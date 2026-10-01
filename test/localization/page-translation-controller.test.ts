import { OriginalPreservingRenderer } from '@/rendering/original-preserving-renderer';
import { MountainProjectPageAdapter } from '@/sites/mountain-project/dom/page-adapter';
import type { TranslationProvider, TranslationRequest } from '@/core/translation-provider';
import { TranslationLedger } from '@/core/translation-record';
import { DirectPageLocalizer } from '@/localization/direct-page-localizer';
import { PageTranslationController } from '@/localization/page-translation-controller';
import { AreaPageSectionPresentation } from '@/ui/area-page-section-presentation';
import { MountainProjectTranslationPolicy } from '@/sites/mountain-project/translation/mountain-project-translation-policy';
import { BRYAN_HYLENSKI_COMMENT_HTML } from '../fixtures/mountain-project/bryan-hylenski-comment';

type ProviderAvailability = Awaited<ReturnType<TranslationProvider['availability']>>;

function deferred<T>(): {
  promise: Promise<T>;
  resolve(value: T | PromiseLike<T>): void;
  reject(reason?: unknown): void;
} {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });
  return { promise, resolve, reject };
}

async function flushAsyncWork(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

class FakeProvider implements TranslationProvider {
  readonly id = 'fake';
  readonly requests: TranslationRequest[] = [];
  readonly errors: Error[] = [];
  readonly availabilityResults: Array<ProviderAvailability | Promise<ProviderAvailability>> = [];
  readonly translationResults: Array<string | Promise<string>> = [];
  availabilityStatus: ProviderAvailability = 'available';

  async availability(): Promise<ProviderAvailability> {
    const next = this.availabilityResults.shift();
    return next ? await next : this.availabilityStatus;
  }

  async translate(request: TranslationRequest): Promise<string> {
    this.requests.push(request);
    const error = this.errors.shift();
    if (error) {
      throw error;
    }
    const translated = this.translationResults.shift();
    return translated ? await translated : `번역: ${request.text}`;
  }
}

function addInitialComment(): void {
  document.querySelector('.comment-list')!.innerHTML = `
    <table class="main-comment">
      <tr><td><div class="comment-body">
        <span id="99-full">The anchor was replaced this season.</span>
        <span class="comment-time">Sep 1, 2026</span>
      </div></td></tr>
    </table>
  `;
}

describe('PageTranslationController', () => {
  beforeEach(() => {
    document.head.innerHTML = '<base href="https://www.mountainproject.com/">';
    document.body.innerHTML = `
      <div class="breadcrumbs"><a href="/area/106225629/south-korea">S Korea</a></div>
      <section>
        <h2>Description</h2>
        <div class="fr-view"><p id="copy">A classic line above Seoul.</p></div>
      </section>
      <div class="comment-list"></div>
    `;
  });

  it('translates common sections and comments added after initial load', async () => {
    const provider = new FakeProvider();
    const ledger = new TranslationLedger();
    const controller = new PageTranslationController(provider, ledger, new MountainProjectPageAdapter(), new OriginalPreservingRenderer());
    const copy = document.querySelector('#copy');

    await controller.start();
    expect(document.querySelector('#copy')).toBe(copy);
    expect(document.querySelector('.mpkr-machine-translation')?.textContent)
      .toContain('번역: A classic line above Seoul.');

    const comment = document.createElement('table');
    comment.innerHTML = `
      <tr><td><div class="comment-body">
        <span id="99-full">The anchor was replaced this season.</span>
        <span class="comment-time">Sep 1, 2026</span>
      </div></td></tr>
    `;
    document.querySelector('.comment-list')!.append(comment);
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(provider.requests.map((request) => request.text)).toContain(
      'The anchor was replaced this season.',
    );
    expect(ledger.snapshot().filter((record) => record.category === 'comment'))
      .toHaveLength(1);

    controller.destroy();
    expect(document.querySelectorAll('.mpkr-machine-translation')).toHaveLength(0);
    expect(document.querySelector<HTMLElement>('#copy')?.style.display).toBe('');
  });

  it('translates sections inserted after the UI localizer has localized their headings', async () => {
    document.body.innerHTML = `
      <div class="breadcrumbs"><a href="/area/106225629/south-korea">S Korea</a></div>
      <div class="comment-list"></div>
    `;
    const localizer = new DirectPageLocalizer();
    const provider = new FakeProvider();
    const controller = new PageTranslationController(provider, new TranslationLedger(), new MountainProjectPageAdapter(), new OriginalPreservingRenderer());
    localizer.apply(document);
    await controller.start();

    const section = document.createElement('section');
    section.innerHTML = `
      <h2>Getting There</h2>
      <div class="fr-view"><p id="dynamic-access">Take the first bus to the park.</p></div>
    `;
    document.body.append(section);
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(section.querySelector('h2')?.textContent).toBe('가는 방법');
    expect(provider.requests.map((request) => request.text)).toContain(
      'Take the first bus to the park.',
    );
    expect(section.querySelector('.mpkr-section-translation')?.textContent)
      .toContain('번역: Take the first bus to the park.');
    expect(section.querySelectorAll('.mpkr-original-toggle')).toHaveLength(1);

    controller.destroy();
    localizer.restore();
  });

  it('translates dynamically inserted free-form Area headings without breaking toggles or restore', async () => {
    document.body.innerHTML = '<div id="climb-area-page"><main class="main-content"></main></div>';
    const provider = new FakeProvider();
    const adapter = new MountainProjectPageAdapter();
    const controller = new PageTranslationController(
      provider,
      new TranslationLedger(),
      adapter,
      new OriginalPreservingRenderer(),
    );
    const presentation = new AreaPageSectionPresentation();
    const localizer = new DirectPageLocalizer();
    const original = `
      <div class="list-group mt-2">
        <div class="list-group-item">
          <h2 class="list-group-item-heading" data-toggle="collapse" data-target="#safety">
            SAFETY PUBLIC SERVICE ANNOUNCEMENT March 27 2026
            <span class="expander"><img src="expand.svg"></span>
          </h2>
          <div class="list-group-item-text collapse" id="safety">
            <div class="fr-view"><p>Check current bolt conditions.</p></div>
          </div>
        </div>
      </div>`;

    await controller.start();
    presentation.mount();
    localizer.apply();
    document.querySelector('.main-content')!.innerHTML = original;
    await new Promise((resolve) => setTimeout(resolve, 20));
    presentation.mount();
    localizer.apply();
    await new Promise((resolve) => setTimeout(resolve, 20));

    const heading = document.querySelector<HTMLHeadingElement>('.mpkr-area-section-heading')!;
    const expander = heading.querySelector('.expander');
    expect(provider.requests.map((request) => request.text)).toContain(
      'SAFETY PUBLIC SERVICE ANNOUNCEMENT March 27 2026',
    );
    const translatedHeading = heading.querySelector<HTMLElement>('.mpkr-area-heading-source')!;
    expect(translatedHeading.textContent?.trim())
      .toBe('번역: SAFETY PUBLIC SERVICE ANNOUNCEMENT March 27 2026');
    expect(translatedHeading.textContent).toMatch(/^\s+번역:/);
    expect(translatedHeading.textContent).toMatch(/2026\s+$/);
    expect(translatedHeading.children).toHaveLength(0);
    expect(heading.querySelector('.expander')).toBe(expander);
    expect(heading.querySelector('.mpkr-area-section-hint')).not.toBeNull();
    expect(heading.querySelector('.mpkr-area-section-chevron')).not.toBeNull();

    heading.click();
    expect(document.getElementById(heading.getAttribute('aria-controls')!)?.hidden).toBe(false);

    controller.destroy();
    presentation.destroy();
    localizer.restore();
    const restored = document.querySelector<HTMLHeadingElement>('.list-group-item-heading')!;
    expect(restored.textContent).toContain('SAFETY PUBLIC SERVICE ANNOUNCEMENT March 27 2026');
    expect(restored.querySelector('.mpkr-area-heading-source')).toBeNull();
    expect(restored.querySelector('.expander')).not.toBeNull();
  });

  it('replaces a stale section translation after its source changes in place', async () => {
    const provider = new FakeProvider();
    const controller = new PageTranslationController(provider, new TranslationLedger(), new MountainProjectPageAdapter(), new OriginalPreservingRenderer());
    await controller.start();
    const copy = document.querySelector<HTMLElement>('#copy')!;

    copy.textContent = 'A newly revised line above Busan.';
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(provider.requests.map((request) => request.text)).toEqual([
      'A classic line above Seoul.',
      'A newly revised line above Busan.',
    ]);
    expect(document.querySelectorAll('.mpkr-section-translation')).toHaveLength(1);
    expect(document.querySelectorAll('.mpkr-original-toggle')).toHaveLength(1);
    expect(document.querySelector('.mpkr-translation-body')?.textContent)
      .toBe('번역: A newly revised line above Busan.');
    expect(copy.style.display).toBe('none');

    document.querySelector<HTMLButtonElement>('.mpkr-original-toggle')!.click();
    expect(copy.style.display).toBe('');
    expect(copy.textContent).toBe('A newly revised line above Busan.');
    controller.destroy();
  });

  it('recollects authored insertions and replacements without rescanning its own UI', async () => {
    const provider = new FakeProvider();
    const adapter = new MountainProjectPageAdapter();
    const pageTargets = vi.spyOn(adapter, 'collectPageTargets');
    const commentTargets = vi.spyOn(adapter, 'collectCommentTargets');
    const controller = new PageTranslationController(
      provider,
      new TranslationLedger(),
      adapter,
      new OriginalPreservingRenderer(),
    );
    await controller.start();
    await flushAsyncWork();

    expect(pageTargets).toHaveBeenCalledTimes(1);
    expect(commentTargets).toHaveBeenCalledTimes(1);

    const section = document.createElement('section');
    section.innerHTML = `
      <h2>Location</h2>
      <div class="fr-view"><p id="late-copy">The trail starts beside the gate.</p></div>
    `;
    document.body.append(section);
    await vi.waitFor(() => expect(section.querySelector('.mpkr-translation-body')?.textContent)
      .toBe('번역: The trail starts beside the gate.'));
    await flushAsyncWork();

    expect(pageTargets).toHaveBeenCalledTimes(2);
    expect(commentTargets).toHaveBeenCalledTimes(2);
    expect(section.querySelectorAll('.mpkr-section-translation')).toHaveLength(1);

    section.querySelector<HTMLElement>('#late-copy')!.textContent =
      'The revised trail starts behind the gate.';
    await vi.waitFor(() => expect(section.querySelector('.mpkr-translation-body')?.textContent)
      .toBe('번역: The revised trail starts behind the gate.'));
    await flushAsyncWork();

    expect(pageTargets).toHaveBeenCalledTimes(3);
    expect(commentTargets).toHaveBeenCalledTimes(3);
    expect(section.querySelectorAll('.mpkr-section-translation')).toHaveLength(1);
    expect(section.querySelector('.mpkr-translation-body')?.textContent)
      .toBe('번역: The revised trail starts behind the gate.');
    controller.destroy();
  });

  it('discards an initial translation when its source changes before completion', async () => {
    const staleTranslation = deferred<string>();
    const provider = new FakeProvider();
    provider.translationResults.push(
      staleTranslation.promise,
      '새 번역: A newly revised line above Busan.',
    );
    const controller = new PageTranslationController(provider, new TranslationLedger(), new MountainProjectPageAdapter(), new OriginalPreservingRenderer());
    const startPromise = controller.start();
    await flushAsyncWork();

    document.querySelector<HTMLElement>('#copy')!.textContent =
      'A newly revised line above Busan.';
    await new Promise((resolve) => setTimeout(resolve, 20));

    // The replacement waits for the single provider slot; the old result is ignored.
    expect(provider.requests).toHaveLength(1);
    staleTranslation.resolve('오래된 번역: A classic line above Seoul.');
    await startPromise;
    await flushAsyncWork();
    expect(provider.requests.map((request) => request.text)).toEqual([
      'A classic line above Seoul.',
      'A newly revised line above Busan.',
    ]);
    expect(document.querySelector('.mpkr-translation-body')?.textContent)
      .toBe('새 번역: A newly revised line above Busan.');

    expect(document.querySelectorAll('.mpkr-section-translation')).toHaveLength(1);
    expect(document.querySelector('.mpkr-translation-body')?.textContent)
      .toBe('새 번역: A newly revised line above Busan.');
    controller.destroy();
  });

  it('keeps originals and records an unsupported result when no provider exists', async () => {
    const provider: TranslationProvider = {
      id: 'unavailable',
      availability: async () => 'unavailable',
      translate: async () => {
        throw new Error('not called');
      },
    };
    const ledger = new TranslationLedger();
    const controller = new PageTranslationController(provider, ledger, new MountainProjectPageAdapter(), new OriginalPreservingRenderer());

    await controller.start();

    expect(document.querySelector<HTMLElement>('#copy')?.style.display).toBe('');
    expect(ledger.snapshot()[0]?.status).toBe('unsupported');
    expect(document.querySelector('.mpkr-machine-translation')).toBeNull();
    controller.destroy();
  });

  it('retries automatically on the next interaction when the Chrome model is downloadable', async () => {
    const provider = new FakeProvider();
    provider.availabilityStatus = 'downloadable';
    const ledger = new TranslationLedger();
    const controller = new PageTranslationController(provider, ledger, new MountainProjectPageAdapter(), new OriginalPreservingRenderer());

    await controller.start();

    expect(provider.requests).toHaveLength(0);
    expect(document.querySelector<HTMLElement>('#copy')?.style.display).toBe('');
    expect(document.querySelector('.mpkr-machine-translation')).toBeNull();
    expect(ledger.snapshot()[0]).toMatchObject({
      status: 'waiting-user-start',
      source: 'A classic line above Seoul.',
    });
    expect(ledger.snapshot()[0]?.message).toBe('페이지를 계속 사용하면 번역 준비가 자동으로 시작됩니다.');
    expect(document.querySelector('#mpkr-translation-review')).toBeNull();

    document.body.click();
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(provider.requests.map((request) => request.text)).toEqual([
      'A classic line above Seoul.',
    ]);

    expect(ledger.snapshot()[0]?.status).toBe('translated');
    expect(document.querySelector('.mpkr-machine-translation')?.textContent)
      .toContain('번역: A classic line above Seoul.');
    controller.destroy();
  });

  it('keeps section and comment targets waiting when the Chrome model is downloadable', async () => {
    addInitialComment();
    const provider = new FakeProvider();
    provider.availabilityStatus = 'downloadable';
    const ledger = new TranslationLedger();
    const controller = new PageTranslationController(provider, ledger, new MountainProjectPageAdapter(), new OriginalPreservingRenderer());

    await controller.start();

    const records = ledger.snapshot();
    expect(provider.requests).toHaveLength(0);
    expect(records).toHaveLength(2);
    expect(records).toEqual(expect.arrayContaining([
      expect.objectContaining({
        category: 'description',
        status: 'waiting-user-start',
        source: 'A classic line above Seoul.',
      }),
      expect.objectContaining({
        category: 'comment',
        status: 'waiting-user-start',
        source: 'The anchor was replaced this season.',
      }),
    ]));
    expect(records.some((record) => record.status === 'failed')).toBe(false);
    expect(document.querySelectorAll('.mpkr-machine-translation')).toHaveLength(0);
    controller.destroy();
  });

  it('translates waiting section and comment targets with one user-start retry', async () => {
    addInitialComment();
    const provider = new FakeProvider();
    provider.availabilityStatus = 'downloadable';
    const ledger = new TranslationLedger();
    const controller = new PageTranslationController(provider, ledger, new MountainProjectPageAdapter(), new OriginalPreservingRenderer());

    await controller.start();

    expect(ledger.snapshot().map((record) => record.status)).toEqual([
      'waiting-user-start',
      'waiting-user-start',
    ]);

    const retryPromise = controller.retry();

    await retryPromise;
    expect(provider.requests.map((request) => request.text)).toEqual([
      'A classic line above Seoul.',
      'The anchor was replaced this season.',
    ]);

    expect(ledger.snapshot()).toEqual(expect.arrayContaining([
      expect.objectContaining({
        category: 'description',
        status: 'translated',
        translated: '번역: A classic line above Seoul.',
      }),
      expect.objectContaining({
        category: 'comment',
        status: 'translated',
        translated: '번역: The anchor was replaced this season.',
      }),
    ]));
    expect(document.querySelectorAll('.mpkr-machine-translation')).toHaveLength(2);
    controller.destroy();
  });

  it('keeps waiting if a user-start retry still misses the activation boundary', async () => {
    const provider = new FakeProvider();
    provider.availabilityStatus = 'downloadable';
    provider.errors.push(new Error('Requires a user gesture when availability is downloading or downloadable.'));
    const ledger = new TranslationLedger();
    const controller = new PageTranslationController(provider, ledger, new MountainProjectPageAdapter(), new OriginalPreservingRenderer());

    await controller.start();
    await controller.retry();

    expect(provider.requests).toHaveLength(1);
    expect(ledger.snapshot()[0]).toMatchObject({
      status: 'waiting-user-start',
    });
    expect(ledger.snapshot()[0]?.message).toBe('페이지를 계속 사용하면 번역 준비가 자동으로 시작됩니다.');
    expect(document.querySelector('.mpkr-machine-translation')).toBeNull();
    controller.destroy();
  });

  it('retains the runtime retry path for failed automatic translations', async () => {
    const provider = new FakeProvider();
    provider.errors.push(new Error('temporary failure'));
    const ledger = new TranslationLedger();
    const controller = new PageTranslationController(provider, ledger, new MountainProjectPageAdapter(), new OriginalPreservingRenderer());

    await controller.start();

    expect(provider.requests).toHaveLength(1);
    expect(ledger.snapshot()[0]).toMatchObject({
      status: 'failed',
      message: '번역하지 못했습니다. 잠시 후 재번역해 주세요.',
    });
    expect(document.querySelector('.mpkr-translation-status')?.textContent)
      .toContain('재번역해 주세요');
    expect(document.querySelector('.mpkr-retranslate')).not.toBeNull();

    await controller.retry();

    expect(provider.requests).toHaveLength(2);
    expect(ledger.snapshot()[0]?.status).toBe('translated');
    expect(document.querySelector('.mpkr-machine-translation')?.textContent)
      .toContain('번역: A classic line above Seoul.');
    controller.destroy();
  });

  it('retranslates a completed presentation without clearing the current translation', async () => {
    const nextTranslation = deferred<string>();
    const provider = new FakeProvider();
    provider.translationResults.push('첫 번역입니다.', nextTranslation.promise);
    const ledger = new TranslationLedger();
    const controller = new PageTranslationController(
      provider,
      ledger,
      new MountainProjectPageAdapter(),
      new OriginalPreservingRenderer(),
    );

    await controller.start();
    const button = document.querySelector<HTMLButtonElement>('.mpkr-retranslate')!;
    button.click();
    await flushAsyncWork();

    expect(provider.requests).toHaveLength(2);
    expect(button.disabled).toBe(true);
    expect(button.textContent).toBe('재번역');
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(document.querySelector('.mpkr-translation-feedback')?.textContent).toBe('재번역 중…');
    expect(document.querySelector('.mpkr-translation-body')?.textContent).toBe('첫 번역입니다.');

    button.click();
    expect(provider.requests).toHaveLength(2);

    nextTranslation.resolve('개선된 번역입니다.');
    await flushAsyncWork();
    await flushAsyncWork();

    expect(button.disabled).toBe(false);
    expect(button.textContent).toBe('재번역');
    expect(document.querySelector('.mpkr-translation-body')?.textContent).toBe('개선된 번역입니다.');
    expect(ledger.snapshot()[0]).toMatchObject({
      status: 'translated',
      translated: '개선된 번역입니다.',
    });
    controller.destroy();
  });

  it('keeps the completed translation when user retranslation fails', async () => {
    const provider = new FakeProvider();
    provider.translationResults.push('유지할 번역입니다.');
    const ledger = new TranslationLedger();
    const controller = new PageTranslationController(
      provider,
      ledger,
      new MountainProjectPageAdapter(),
      new OriginalPreservingRenderer(),
    );

    await controller.start();
    provider.errors.push(new Error('temporary retranslation failure'));
    const button = document.querySelector<HTMLButtonElement>('.mpkr-retranslate')!;
    button.click();
    await flushAsyncWork();
    await flushAsyncWork();

    expect(button.textContent).toBe('재번역');
    expect(document.querySelector('.mpkr-translation-feedback')?.textContent).toContain('재번역하지 못했습니다');
    expect(document.querySelector('.mpkr-translation-body')?.textContent).toBe('유지할 번역입니다.');
    expect(ledger.snapshot()[0]).toMatchObject({
      status: 'translated',
      translated: '유지할 번역입니다.',
    });
    controller.destroy();
  });

  it('keeps a failed long comment atomic and recovers it through user retranslation', async () => {
    document.body.innerHTML = `<div class="comment-list">${BRYAN_HYLENSKI_COMMENT_HTML}</div>`;
    let request = 0;
    let corruptSecondParagraph = true;
    const provider: TranslationProvider = {
      id: 'long-comment',
      availability: async () => 'available',
      async translate(input) {
        request += 1;
        const translated = input.text
          .replace('The imaginary training hall', '가상의 연습장')
          .replace('For the sample diagram', '샘플 도식은')
          .replace('At the end of the exercise', '연습이 끝나면');
        return corruptSecondParagraph && request === 2
          ? translated.replace(/ZXQX*\d+QXZ/u, '')
          : translated;
      },
    };
    const ledger = new TranslationLedger();
    const controller = new PageTranslationController(
      provider,
      ledger,
      new MountainProjectPageAdapter(),
      new OriginalPreservingRenderer(),
      { pageKind: 'area', textPolicy: new MountainProjectTranslationPolicy() },
    );

    await controller.start();

    expect(request).toBe(2);
    expect(document.querySelector('.mpkr-translation-body')?.textContent).toBe('');
    expect(document.getElementById('900000401-full')?.style.display).toBe('none');
    expect(document.getElementById('900000401-trimmed')?.style.display).toBe('');
    expect(document.querySelector<HTMLButtonElement>('.mpkr-original-toggle')?.hidden).toBe(true);
    expect(document.querySelector<HTMLElement>('.mpkr-translation-status')?.hidden).toBe(true);
    const retry = document.querySelector<HTMLButtonElement>('.mpkr-retranslate')!;
    expect(retry).not.toBeNull();

    corruptSecondParagraph = false;
    request = 0;
    retry.click();
    await flushAsyncWork();
    await flushAsyncWork();

    expect(request).toBe(3);
    expect(document.querySelector('.mpkr-translation-status')?.textContent).toBe('');
    expect(document.querySelector('.mpkr-translation-body')?.textContent).toContain('가상의 연습장');
    expect(document.querySelector('.mpkr-translation-body')?.querySelectorAll('br')).toHaveLength(4);
    expect(ledger.snapshot()[0]).toMatchObject({ status: 'translated' });
    controller.destroy();
  });

  it.each([
    [Object.assign(new Error('input quota exceeded'), { name: 'QuotaExceededError' }), '글이 길어'],
    [new Error('provider offline'), '번역하지 못했습니다'],
  ])('leaves a short actionable status for an initial provider failure', async (failure, message) => {
    const provider = new FakeProvider();
    provider.errors.push(failure);
    const ledger = new TranslationLedger();
    const controller = new PageTranslationController(
      provider,
      ledger,
      new MountainProjectPageAdapter(),
      new OriginalPreservingRenderer(),
    );

    await controller.start();

    expect(document.querySelector('.mpkr-translation-status')?.textContent).toContain(message);
    expect(document.querySelector('.mpkr-retranslate')).not.toBeNull();
    expect(document.querySelector<HTMLButtonElement>('.mpkr-original-toggle')?.hidden).toBe(true);
    expect(document.querySelector<HTMLElement>('#copy')?.style.display).toBe('');
    controller.destroy();
  });

  it('ignores stale availability after destroy and restart', async () => {
    const firstAvailability = deferred<ProviderAvailability>();
    const provider = new FakeProvider();
    provider.availabilityResults.push(firstAvailability.promise, 'available');
    const ledger = new TranslationLedger();
    const controller = new PageTranslationController(provider, ledger, new MountainProjectPageAdapter(), new OriginalPreservingRenderer());

    const firstStart = controller.start();
    await flushAsyncWork();

    controller.destroy();
    ledger.clear();

    const secondStart = controller.start();
    await secondStart;

    firstAvailability.resolve('unavailable');
    await firstStart;

    expect(provider.requests.map((request) => request.text)).toEqual([
      'A classic line above Seoul.',
    ]);
    expect(ledger.snapshot()).toEqual([
      expect.objectContaining({
        status: 'translated',
        translated: '번역: A classic line above Seoul.',
      }),
    ]);
    expect(document.querySelector('.mpkr-machine-translation')?.textContent)
      .toContain('번역: A classic line above Seoul.');
    controller.destroy();
  });

  it('ignores stale translate results after destroy and restart', async () => {
    const firstTranslation = deferred<string>();
    const provider = new FakeProvider();
    provider.translationResults.push(firstTranslation.promise, '새 번역: A classic line above Seoul.');
    const ledger = new TranslationLedger();
    const controller = new PageTranslationController(provider, ledger, new MountainProjectPageAdapter(), new OriginalPreservingRenderer());

    const firstStart = controller.start();
    await flushAsyncWork();

    expect(provider.requests).toHaveLength(1);

    controller.destroy();
    ledger.clear();

    const secondStart = controller.start();
    await flushAsyncWork();
    expect(provider.requests).toHaveLength(1);
    firstTranslation.resolve('오래된 번역: A classic line above Seoul.');
    await firstStart;
    await secondStart;

    expect(provider.requests).toHaveLength(2);
    expect(document.querySelector('.mpkr-machine-translation')?.textContent)
      .toContain('새 번역: A classic line above Seoul.');

    expect(document.querySelector('.mpkr-machine-translation')?.textContent)
      .not.toContain('오래된 번역');
    expect(ledger.snapshot()).toEqual([
      expect.objectContaining({
        status: 'translated',
        translated: '새 번역: A classic line above Seoul.',
      }),
    ]);
    controller.destroy();
  });

  it('checks provider availability before retrying unsupported targets', async () => {
    let availabilityCalls = 0;
    const provider: TranslationProvider = {
      id: 'still-unavailable',
      availability: async () => {
        availabilityCalls += 1;
        return 'unavailable';
      },
      translate: vi.fn(async () => {
        throw new Error('translate should not run while unavailable');
      }),
    };
    const ledger = new TranslationLedger();
    const controller = new PageTranslationController(provider, ledger, new MountainProjectPageAdapter(), new OriginalPreservingRenderer());

    await controller.start();
    await controller.retry();

    expect(availabilityCalls).toBe(2);
    expect(provider.translate).not.toHaveBeenCalled();
    expect(ledger.snapshot()[0]).toMatchObject({
      status: 'unsupported',
    });
    expect(ledger.snapshot()[0]?.status).not.toBe('failed');
    controller.destroy();
  });
});
