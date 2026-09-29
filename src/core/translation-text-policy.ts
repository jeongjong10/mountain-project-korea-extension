import type { TranslationContextMetadata } from './translation-provider';

export interface TranslationPolicyInput {
  text: string;
  context: TranslationContextMetadata;
  trustedValues: readonly string[];
  protectedReplacements?: readonly TextReplacement[];
}

export interface TranslationPreparationMetrics {
  sourceCharacters: number;
  protectedSpans: number;
  glossarySpans: number;
}

export interface PreparedTranslation {
  text: string;
  cacheDiscriminator: string;
  metrics: TranslationPreparationMetrics;
  fallback?: PreparedTranslation;
  restore(translated: string): string;
}

export interface TranslationTextPolicy {
  readonly policyVersion: string;
  readonly glossaryVersion: string;
  prepare(input: TranslationPolicyInput): PreparedTranslation;
}

export type TextReplacementKind = 'protected' | 'preserve-original' | 'glossary';

export interface TextReplacement {
  start: number;
  end: number;
  value: string;
  kind: TextReplacementKind;
}

export class PlaceholderIntegrityError extends Error {
  constructor(
    readonly failedKinds: readonly TextReplacementKind[],
    message = '번역기가 보호 토큰을 변경해 안전하게 원문을 복원할 수 없습니다.',
  ) {
    super(message);
    this.name = 'PlaceholderIntegrityError';
  }
}

function hash(value: string): string {
  let result = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 0x01000193);
  }
  return (result >>> 0).toString(36).toUpperCase();
}

function escaped(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function namespaceTokenPattern(prefix: string): RegExp {
  return new RegExp(`${escaped(prefix)}\\d+QXZ`, 'giu');
}

function normalizedReplacements(
  source: string,
  replacements: readonly TextReplacement[],
): TextReplacement[] {
  const sorted = [...replacements].sort((left, right) => (
    left.start - right.start || right.end - left.end
  ));
  let previousEnd = 0;
  for (const replacement of sorted) {
    if (replacement.start < previousEnd
      || replacement.start < 0
      || replacement.end <= replacement.start
      || replacement.end > source.length) {
      throw new RangeError('Translation replacements must be valid and non-overlapping.');
    }
    previousEnd = replacement.end;
  }
  return sorted;
}

export function preparePlaceholderTranslation(
  source: string,
  replacements: readonly TextReplacement[],
  fallbackReplacements?: readonly TextReplacement[],
): PreparedTranslation {
  const sorted = normalizedReplacements(source, replacements);
  if (sorted.length === 0) {
    return {
      text: source,
      cacheDiscriminator: 'plain',
      metrics: { sourceCharacters: source.length, protectedSpans: 0, glossarySpans: 0 },
      restore: (translated) => translated,
    };
  }

  // Long hash-bearing markers are corrupted by the on-device model. Values and
  // kinds stay in this request's mapping; only short, exact IDs reach the model.
  let prefix = 'ZXQ';
  while (namespaceTokenPattern(prefix).test(source)) prefix += 'X';

  const tokens = sorted.map((replacement, index) => {
    const original = source.slice(replacement.start, replacement.end);
    return {
      token: `${prefix}${index}QXZ`,
      value: replacement.value,
      kind: replacement.kind,
      original,
    };
  });
  let cursor = 0;
  const parts: string[] = [];
  sorted.forEach((replacement, index) => {
    parts.push(source.slice(cursor, replacement.start), tokens[index]!.token);
    cursor = replacement.end;
  });
  parts.push(source.slice(cursor));

  const fallback = fallbackReplacements
    ? preparePlaceholderTranslation(source, fallbackReplacements)
    : undefined;

  return {
    text: parts.join(''),
    cacheDiscriminator: hash(tokens.map(({ kind, original, value }) => (
      `${kind}\0${original}\0${value}`
    )).join('\x01')),
    metrics: {
      sourceCharacters: source.length,
      protectedSpans: tokens.filter(({ kind }) => kind !== 'glossary').length,
      glossarySpans: tokens.filter(({ kind }) => kind === 'glossary').length,
    },
    ...(fallback ? { fallback } : {}),
    restore(translated: string): string {
      const matches = tokens.map((token) => ({
        ...token,
        matches: [...translated.matchAll(new RegExp(escaped(token.token), 'giu'))],
      }));
      const knownTokens = new Set(tokens.map(({ token }) => token));
      const hasUnknownToken = [...translated.matchAll(namespaceTokenPattern(prefix))]
        .some(([token]) => !knownTokens.has(token.toUpperCase()));
      const failedKinds = [...new Set([
        ...matches.filter(({ matches: tokenMatches }) => tokenMatches.length !== 1)
          .map(({ kind }) => kind),
        ...(hasUnknownToken ? tokens.map(({ kind }) => kind) : []),
      ])];
      if (failedKinds.length > 0) {
        throw new PlaceholderIntegrityError(failedKinds);
      }

      return matches
        .map(({ matches: [match], value }) => ({
          start: match!.index,
          end: match!.index + match![0].length,
          value,
        }))
        .sort((left, right) => right.start - left.start)
        .reduce((result, replacement) => (
          result.slice(0, replacement.start)
          + replacement.value
          + result.slice(replacement.end)
        ), translated);
    },
  };
}
