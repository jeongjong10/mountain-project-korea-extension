import type { TranslationProvider, TranslationRequest } from '@/core/translation-provider';
import { TranslationLedger } from '@/core/translation-record';
import { PageTranslationController } from '@/localization/page-translation-controller';
import { OriginalPreservingRenderer } from '@/rendering/original-preserving-renderer';
import { MountainProjectPageAdapter } from '@/sites/mountain-project/dom/page-adapter';
import { MountainProjectTranslationPolicy } from '@/sites/mountain-project/translation/mountain-project-translation-policy';
import { HIGH_EXPOSURE_DESCRIPTION_HTML } from '../fixtures/mountain-project/high-exposure-description';

class RecordingProvider implements TranslationProvider {
  readonly id = 'quality-recording';
  readonly requests: TranslationRequest[] = [];
  availability = async () => 'available' as const;
  constructor(private readonly result?: (request: TranslationRequest) => string) {}
  async translate(request: TranslationRequest): Promise<string> {
    this.requests.push(request);
    return this.result?.(request) ?? `번역 ${request.text}`;
  }
}

function controller(provider: TranslationProvider, ledger = new TranslationLedger()) {
  return {
    ledger,
    controller: new PageTranslationController(
      provider,
      ledger,
      new MountainProjectPageAdapter(),
      new OriginalPreservingRenderer(),
      { pageKind: 'route', textPolicy: new MountainProjectTranslationPolicy() },
    ),
  };
}

describe('translation policy pipeline integration (mock provider, not linguistic quality)', () => {
  beforeEach(() => {
    document.head.innerHTML = '<base href="https://www.mountainproject.com/">';
    document.body.innerHTML = '';
  });

  it('isolates identical source text by context in requests and cache keys', async () => {
    document.body.innerHTML = `
      <section><h2>Description</h2><div class="fr-view"><p>Follow the anchor.</p></div></section>
      <section><h2>Getting There</h2><div class="fr-view"><p>Follow the anchor.</p></div></section>`;
    const provider = new RecordingProvider();
    const harness = controller(provider);
    await harness.controller.start();

    expect(provider.requests).toHaveLength(2);
    expect(provider.requests.map(({ context }) => context.category)).toEqual(['description', 'access']);
    expect(provider.requests.every(({ context }) => (
      context.pageKind === 'route'
      && context.policyVersion === 'mpkr-policy-5'
      && context.glossaryVersion === 'mpkr-climbing-ko-3'
    ))).toBe(true);
    expect(harness.controller.metricsSnapshot()).toMatchObject({
      providerCalls: 2,
      cacheHits: 0,
      glossarySpans: 0,
    });
    harness.controller.destroy();
  });

  it('keeps one provider call for equal text in the same context', async () => {
    document.body.innerHTML = `<section><h2>Description</h2><div class="fr-view">${
      Array.from({ length: 100 }, () => '<p>Clip the anchor at 5.10a.</p>').join('')
    }</div></section>`;
    const provider = new RecordingProvider();
    const harness = controller(provider);
    await harness.controller.start();

    expect(provider.requests).toHaveLength(1);
    expect(harness.ledger.snapshot().filter(({ status }) => status === 'translated')).toHaveLength(100);
    expect(harness.controller.metricsSnapshot()).toMatchObject({
      providerCalls: 1,
      cacheHits: 99,
      preparedCharacters: 2500,
      protectedSpans: 100,
      glossarySpans: 0,
      integrityFailures: 0,
    });
    harness.controller.destroy();
  });

  it('separates cache entries by exact whitespace and DOM format fingerprint', async () => {
    document.body.innerHTML = `
      <section><h2>Description</h2><div class="fr-view"><p>Same line<br>same ending.</p></div></section>
      <section><h2>Description</h2><div class="fr-view"><p>Same line
same ending.</p></div></section>`;
    const provider = new RecordingProvider();
    const harness = controller(provider);

    await harness.controller.start();

    expect(provider.requests).toHaveLength(2);
    expect(provider.requests[0]?.text).not.toBe(provider.requests[1]?.text);
    expect(harness.controller.metricsSnapshot().cacheHits).toBe(0);
    harness.controller.destroy();
  });

  it('keeps a trusted DOM route name and climbing grade unchanged', async () => {
    document.body.innerHTML = `
      <main id="route-page"><h1>Chouinard-B</h1>
        <section><h2>Description</h2><div class="fr-view"><p>Chouinard-B starts at 5.10a.</p></div></section>
      </main>`;
    const provider = new RecordingProvider();
    const harness = controller(provider);
    await harness.controller.start();

    expect(provider.requests[0]?.text).not.toContain('Chouinard-B');
    expect(provider.requests[0]?.text).not.toContain('5.10a');
    expect(document.querySelector('.mpkr-machine-translation')?.textContent).toContain('Chouinard-B');
    expect(document.querySelector('.mpkr-machine-translation')?.textContent).toContain('5.10a');
    harness.controller.destroy();
  });

  it('treats protected entity corruption as terminal and leaves the original visible', async () => {
    document.body.innerHTML = '<main id="route-page"><h1>High Exposure</h1><section><h2>Description</h2><div class="fr-view"><p id="source">High Exposure starts at 5.6.</p></div></section></main>';
    const provider = new RecordingProvider(() => '보호 토큰이 사라진 번역');
    const harness = controller(provider);
    await harness.controller.start();

    expect(provider.requests).toHaveLength(1);
    expect(harness.ledger.snapshot()[0]).toMatchObject({ status: 'preserved' });
    expect(harness.ledger.snapshot()[0]?.message).toContain('보호 토큰');
    expect(document.querySelector<HTMLElement>('#source')?.style.display).toBe('');
    expect(document.querySelector<HTMLElement>('.mpkr-translation-status')?.hidden).toBe(true);
    expect(document.querySelector('.mpkr-translation-status')?.textContent).toBe('');
    expect(document.querySelector('.mpkr-retranslate')).not.toBeNull();
    await harness.controller.retry();
    expect(provider.requests).toHaveLength(1);
    expect(harness.controller.metricsSnapshot().integrityFailures).toBe(1);
    harness.controller.destroy();
  });

  it('sends narrative words without lexical tokens and preserves paragraph structure', async () => {
    document.body.innerHTML = HIGH_EXPOSURE_DESCRIPTION_HTML;
    const provider = new RecordingProvider();
    const harness = controller(provider);
    await harness.controller.start();

    expect(provider.requests.some(({ text }) => text.includes('first pitch follows a finger crack'))).toBe(true);
    expect(provider.requests.some(({ text }) => text.includes('short chimney'))).toBe(true);
    expect(harness.ledger.snapshot()).toHaveLength(8);
    expect(harness.ledger.snapshot().every(({ status }) => status === 'translated')).toBe(true);
    expect(document.querySelectorAll('.mpkr-translation-body > *')).toHaveLength(8);
    expect(harness.controller.metricsSnapshot()).toMatchObject({
      providerCalls: 8,
      glossarySpans: 0,
      integrityFailures: 0,
      glossaryFallbacks: 0,
    });
    harness.controller.destroy();
  });

  it('allows the engine to translate ordinary expressions instead of forcing English or Korean', async () => {
    document.body.innerHTML = '<section><h2>Description</h2><div class="fr-view"><p>Use the bolt ladder. The route wanders above it.</p></div></section>';
    const provider = new RecordingProvider(() => '볼트 사다리를 이용하세요. 그 위로 루트가 이리저리 이어집니다.');
    const harness = controller(provider);
    await harness.controller.start();
    expect(provider.requests[0]?.text).toBe('Use the bolt ladder. The route wanders above it.');
    expect(document.querySelector('.mpkr-machine-translation')?.textContent)
      .toContain('볼트 사다리를 이용하세요. 그 위로 루트가 이리저리 이어집니다.');
    expect(harness.controller.metricsSnapshot().glossaryFallbacks).toBe(0);
    harness.controller.destroy();
  });
});
