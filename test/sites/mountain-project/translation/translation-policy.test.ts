import {
  PlaceholderIntegrityError,
  preparePlaceholderTranslation,
} from '@/core/translation-text-policy';
import type {
  TranslationContextCategory,
  TranslationContextMetadata,
} from '@/core/translation-provider';
import { MountainProjectTranslationPolicy } from '@/sites/mountain-project/translation/mountain-project-translation-policy';
import { TRANSLATION_QUALITY_CORPUS } from '../../../fixtures/mountain-project/translation-quality-corpus';

const policy = new MountainProjectTranslationPolicy();

function context(category: TranslationContextCategory): TranslationContextMetadata {
  return {
    category,
    pageKind: category === 'help' ? 'help' : 'route',
    policyVersion: policy.policyVersion,
    glossaryVersion: policy.glossaryVersion,
  };
}

describe('Mountain Project translation policy', () => {
  it.each(TRANSLATION_QUALITY_CORPUS)(
    'passes narrative terminology to the model unchanged: $source',
    ({ category, source }) => {
      const prepared = policy.prepare({ text: source, context: context(category), trustedValues: [] });
      expect(prepared.text).toBe(source);
      expect(prepared.metrics).toMatchObject({ protectedSpans: 0, glossarySpans: 0 });
      expect(prepared.fallback).toBeUndefined();
    },
  );

  it('leaves both noun and verb meanings visible in one sentence', () => {
    const source = 'Bring draws; the route draws attention as it wanders past the anchor.';
    const prepared = policy.prepare({ text: source, context: context('safety'), trustedValues: [] });
    expect(prepared.text).toBe(source);
    expect(prepared.restore('퀵드로우를 챙기세요.')).toBe('퀵드로우를 챙기세요.');
  });

  it('protects a term only when the DOM identifies it as a name', () => {
    const source = 'Rope Drag has rope drag above the roof.';
    const prepared = policy.prepare({ text: source, context: context('description'), trustedValues: ['Rope Drag'] });
    expect(prepared.text).toBe('ZXQ0QXZ has rope drag above the roof.');
    expect(prepared.restore('ZXQ0QXZ의 지붕 위에서는 로프 마찰이 있습니다.'))
      .toBe('Rope Drag의 지붕 위에서는 로프 마찰이 있습니다.');
  });

  it('protects only supplied entity names plus grades and technical values', () => {
    const source = 'Chouinard-B is 5.10a with a 60m rope near 37.6581, 126.9770. See https://example.com/beta or guide@example.com.';
    const prepared = policy.prepare({
      text: source,
      context: context('description'),
      trustedValues: ['Chouinard-B'],
    });
    expect(prepared.text).not.toContain('Chouinard-B');
    expect(prepared.text).not.toContain('5.10a');
    expect(prepared.text).not.toContain('60m');
    expect(prepared.text).not.toContain('37.6581, 126.9770');
    expect(prepared.text).not.toContain('https://example.com/beta');
    expect(prepared.text).not.toContain('guide@example.com');
    expect(prepared.restore(prepared.text)).toContain(source);
    expect(prepared.metrics.protectedSpans).toBe(6);
  });

  it('does not infer an unsupplied capitalized phrase as a proper name', () => {
    const prepared = policy.prepare({
      text: 'Unknown Ridge is exposed.',
      context: context('description'),
      trustedValues: [],
    });
    expect(prepared.text).toBe('Unknown Ridge is exposed.');
    expect(prepared.metrics.protectedSpans).toBe(0);
  });
});

describe('placeholder integrity', () => {
  const replacement = [{ start: 6, end: 15, value: 'Chouinard', kind: 'protected' as const }];

  it('uses a source-safe request token and restores it exactly once', () => {
    const prepared = preparePlaceholderTranslation('Climb Chouinard today.', replacement);
    const token = prepared.text.split(' ')[1]!;
    expect(token).toBe('ZXQ0QXZ');
    expect(prepared.restore(`번역 ${token}`)).toBe('번역 Chouinard');
  });

  it('restores a token when only its letter case changed', () => {
    const prepared = preparePlaceholderTranslation('Climb Chouinard today.', replacement);
    const token = prepared.text.split(' ')[1]!;
    const benignVariant = token.toLocaleLowerCase('en-US');
    expect(prepared.restore(`번역 ${benignVariant}`)).toBe('번역 Chouinard');
  });

  it('rejects missing technical values while keeping vocabulary visible', () => {
    const prepared = policy.prepare({
      text: 'High Exposure has an anchor at 5.6.',
      context: context('description'),
      trustedValues: ['High Exposure'],
    });
    expect(prepared.text).toBe('ZXQ0QXZ has an anchor at ZXQ1QXZ.');
    expect(() => prepared.restore(prepared.text.replace('ZXQ1QXZ', '')))
      .toThrow(PlaceholderIntegrityError);
    expect(prepared.fallback).toBeUndefined();
  });

  it.each([
    ['missing', '번역에 토큰이 없습니다.'],
    ['changed', 'ZXQ999QXZ'],
    ['extra digit', 'ZXQ00QXZ'],
    ['extra field', 'ZXQ0_0QXZ'],
    ['changed prefix', 'ZXQQ0QXZ'],
  ])('rejects a %s token without retrying in the codec', (_case, translated) => {
    const prepared = preparePlaceholderTranslation('Climb Chouinard today.', replacement);
    expect(() => prepared.restore(translated)).toThrow(PlaceholderIntegrityError);
  });

  it('rejects duplicated tokens', () => {
    const prepared = preparePlaceholderTranslation('Climb Chouinard today.', replacement);
    const token = prepared.text.split(' ')[1]!;
    expect(() => prepared.restore(`${token} ${token}`)).toThrow(PlaceholderIntegrityError);
  });

  it('rejects an unexpected ID even when every expected marker is present', () => {
    const prepared = preparePlaceholderTranslation('Climb Chouinard today.', replacement);
    expect(() => prepared.restore(`${prepared.text} ZXQ7QXZ`)).toThrow(PlaceholderIntegrityError);
  });

  it('avoids literal markers in the source using the same case normalization as restore', () => {
    const source = 'Keep zxq0qxz and ZxQx1QxZ while climbing Chouinard.';
    const start = source.indexOf('Chouinard');
    const prepared = preparePlaceholderTranslation(source, [
      { start, end: start + 9, value: 'Chouinard', kind: 'protected' },
    ]);
    expect(prepared.text).toContain('ZXQXX0QXZ');
    expect(prepared.restore(prepared.text.replace('climbing', '등반')))
      .toBe('Keep zxq0qxz and ZxQx1QxZ while 등반 Chouinard.');
  });

  it('keeps multi-digit IDs distinct and detects their duplication', () => {
    const words = Array.from({ length: 12 }, (_, index) => `Name${index}`);
    const source = words.join(' ');
    let cursor = 0;
    const replacements = words.map((word) => {
      const start = cursor;
      cursor += word.length + 1;
      return { start, end: start + word.length, value: word, kind: 'protected' as const };
    });
    const prepared = preparePlaceholderTranslation(source, replacements);
    const reversed = prepared.text.split(' ').reverse().join(' ');
    expect(prepared.restore(reversed)).toBe([...words].reverse().join(' '));
    expect(() => prepared.restore(`${prepared.text} ZXQ1QXZ`)).toThrow(PlaceholderIntegrityError);
    expect(() => prepared.restore(prepared.text.replace('ZXQ10QXZ', 'ZXQ100QXZ')))
      .toThrow(PlaceholderIntegrityError);
  });

  it('keeps restoration and cache identity separate for equal short request IDs', () => {
    const first = preparePlaceholderTranslation('Climb Alpha today.', [
      { start: 6, end: 11, value: 'Alpha', kind: 'protected' },
    ]);
    const second = preparePlaceholderTranslation('Climb Bravo today.', [
      { start: 6, end: 11, value: 'Bravo', kind: 'protected' },
    ]);
    expect(first.text).toBe(second.text);
    expect(first.cacheDiscriminator).not.toBe(second.cacheDiscriminator);
    expect(first.restore('등반 ZXQ0QXZ')).toBe('등반 Alpha');
    expect(second.restore('등반 zxq0qxz')).toBe('등반 Bravo');
  });
});
