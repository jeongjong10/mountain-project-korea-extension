import {
  preparePlaceholderTranslation,
  type TextReplacement,
  type TranslationPolicyInput,
  type TranslationTextPolicy,
} from '../../../core/translation-text-policy';
import {
  MOUNTAIN_PROJECT_GLOSSARY_VERSION,
  MOUNTAIN_PROJECT_TRANSLATION_POLICY_VERSION,
} from '../contract/translation/glossary';

interface Candidate extends TextReplacement {
  priority: number;
}

const TECHNICAL_PATTERNS: readonly RegExp[] = [
  /https?:\/\/[^\s<>"']*[^\s<>"'.,;:!?)]/giu,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/giu,
  /(?<!\d)-?\d{1,3}\.\d{3,}\s*[,/]\s*-?\d{1,3}\.\d{3,}(?!\d)/gu,
  /\b5\.\d{1,2}[abcd]?[+-]?(?:\s+(?:PG-?13|R|X))?\b/giu,
  /\b(?:V\d{1,2}[+-]?|(?:A|C|WI|M)\d{1,2}[+-]?)\b/gu,
  /\b\d+(?:\.\d+)?\s?(?:mm|cm|m|ft|in|kg|lbs?|kN)\b/gu,
] as const;

function overlaps(left: Pick<TextReplacement, 'start' | 'end'>, right: Pick<TextReplacement, 'start' | 'end'>): boolean {
  return left.start < right.end && right.start < left.end;
}

function wordBoundary(text: string, start: number, end: number): boolean {
  const before = start > 0 ? text[start - 1] : undefined;
  const after = end < text.length ? text[end] : undefined;
  return (!before || !/[\p{L}\p{N}_]/u.test(before))
    && (!after || !/[\p{L}\p{N}_]/u.test(after));
}

function literalCandidates(
  text: string,
  source: string,
  caseSensitive: boolean,
  replacement: Omit<Candidate, 'start' | 'end'>,
  requireBoundary: boolean,
): Candidate[] {
  const haystack = caseSensitive ? text : text.toLocaleLowerCase('en-US');
  const needle = caseSensitive ? source : source.toLocaleLowerCase('en-US');
  const matches: Candidate[] = [];
  let from = 0;
  while (from <= haystack.length - needle.length) {
    const start = haystack.indexOf(needle, from);
    if (start === -1) break;
    const end = start + needle.length;
    if (!requireBoundary || wordBoundary(text, start, end)) {
      matches.push({ start, end, ...replacement });
    }
    from = end;
  }
  return matches;
}

function technicalCandidates(text: string): Candidate[] {
  return TECHNICAL_PATTERNS.flatMap((pattern, patternIndex) => (
    [...text.matchAll(pattern)].flatMap((match) => {
      const value = match[0];
      const start = match.index;
      if (start === undefined || !value) return [];
      return [{
        start,
        end: start + value.length,
        value,
        kind: 'protected' as const,
        priority: 1000 - patternIndex,
      }];
    })
  ));
}

function trustedValueCandidates(text: string, trustedValues: readonly string[]): Candidate[] {
  return [...new Set(trustedValues.map((value) => value.replace(/\s+/g, ' ').trim()))]
    .filter((value) => value.length >= 2)
    .sort((left, right) => right.length - left.length)
    .flatMap((value) => literalCandidates(
      text,
      value,
      true,
      { value, kind: 'protected', priority: 900 },
      wordBoundary(value, 0, value.length),
    ));
}

function selectCandidates(candidates: readonly Candidate[]): TextReplacement[] {
  const selected: Candidate[] = [];
  const sorted = [...candidates].sort((left, right) => (
    right.priority - left.priority
    || (right.end - right.start) - (left.end - left.start)
    || left.start - right.start
  ));
  for (const candidate of sorted) {
    if (!selected.some((current) => overlaps(current, candidate))) selected.push(candidate);
  }
  return selected.sort((left, right) => left.start - right.start);
}

export class MountainProjectTranslationPolicy implements TranslationTextPolicy {
  readonly policyVersion = MOUNTAIN_PROJECT_TRANSLATION_POLICY_VERSION;
  readonly glossaryVersion = MOUNTAIN_PROJECT_GLOSSARY_VERSION;

  prepare(input: TranslationPolicyInput) {
    const protectedCandidates = [
      ...(input.protectedReplacements ?? []).map((replacement) => ({
        ...replacement,
        priority: 2000,
      })),
      ...technicalCandidates(input.text),
      ...trustedValueCandidates(input.text, input.trustedValues),
    ];
    // Keep narrative words visible: only DOM structure, trusted names and
    // exact technical values need placeholders. No lexical fallback is needed.
    return preparePlaceholderTranslation(
      input.text,
      selectCandidates(protectedCandidates),
    );
  }
}
