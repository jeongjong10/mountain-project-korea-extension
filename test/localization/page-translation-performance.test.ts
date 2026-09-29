import { PageTranslationController } from '@/localization/page-translation-controller';
import { MountainProjectPageAdapter } from '@/sites/mountain-project/dom/page-adapter';
import { OriginalPreservingRenderer } from '@/rendering/original-preserving-renderer';
import { TranslationLedger } from '@/core/translation-record';
import type { TranslationProvider } from '@/core/translation-provider';

const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));
const controllers = new Set<PageTranslationController>();

function section(count: number, duplicate = false): void {
  document.body.innerHTML = `<section><h2>Description</h2><div class="fr-view">${
    Array.from({ length: count }, (_, i) => `<p>English climbing note ${duplicate ? 'same' : i}.</p>`).join('')
  }</div></section>`;
}

function harness(provider: TranslationProvider) {
  const adapter = new MountainProjectPageAdapter();
  const renderer = new OriginalPreservingRenderer();
  const ledger = new TranslationLedger();
  const controller = new PageTranslationController(provider, ledger, adapter, renderer);
  controllers.add(controller);
  return { adapter, renderer, ledger, controller };
}

describe('translation work budgets', () => {
  afterEach(() => {
    controllers.forEach((controller) => controller.destroy());
    controllers.clear();
    vi.restoreAllMocks();
  });

  it('shares one translation for 100 equal sources and reuses it after DOM replacement', async () => {
    section(100, true);
    const translate = vi.fn(async ({ text }: { text: string }) => `번역 ${text}`);
    const { controller, ledger } = harness({ id: 'mock', availability: async () => 'available', translate });
    await controller.start();
    expect(translate).toHaveBeenCalledTimes(1);
    expect(ledger.snapshot().filter((entry) => entry.status === 'translated')).toHaveLength(100);
    const source = document.querySelector('.fr-view')!;
    source.append(Object.assign(document.createElement('p'), { textContent: 'English climbing note same.' }));
    await flush();
    await flush();
    expect(translate).toHaveBeenCalledTimes(1);
    expect(ledger.snapshot()).toHaveLength(101);
    controller.destroy();
  });

  it.each([10, 100, 250, 300])('creates linear translation DOM for %i targets', async (count) => {
    section(count);
    const created = vi.spyOn(document, 'createElement');
    const { controller } = harness({ id: 'mock', availability: async () => 'available', translate: async ({ text }) => `번역 ${text}` });
    await controller.start();
    expect(document.querySelectorAll('.mpkr-translation-body > p')).toHaveLength(count);
    // One shared style, block, body, status, feedback, two buttons, and actions host.
    expect(created.mock.calls.length).toBeLessThanOrEqual(count + 8);
    controller.destroy();
  });

  it('keeps one active call across mutation batches and cancels deferred work on destroy', async () => {
    section(1);
    let active = 0;
    let peak = 0;
    let release!: (value: string) => void;
    const translate = vi.fn(async () => {
      active += 1;
      peak = Math.max(peak, active);
      try { return await new Promise<string>((resolve) => { release = resolve; }); }
      finally { active -= 1; }
    });
    const { controller } = harness({ id: 'mock', availability: async () => 'available', translate });
    const done = controller.start();
    await flush();
    for (let i = 0; i < 5; i += 1) {
      document.querySelector('.fr-view')!.append(Object.assign(document.createElement('p'), { textContent: `Added climbing sentence ${i}.` }));
      await flush();
    }
    expect(peak).toBe(1);
    expect(translate).toHaveBeenCalledTimes(1);
    controller.destroy();
    release('늦은 번역');
    await done;
    await flush();
    expect(translate).toHaveBeenCalledTimes(1);
    expect(document.querySelector('.mpkr-machine-translation')).toBeNull();
  });

  it('ignores unrelated mutations and collects only changed semantic subtrees', async () => {
    section(1);
    const { adapter, controller } = harness({ id: 'mock', availability: async () => 'available', translate: async ({ text }) => `번역 ${text}` });
    const collect = vi.spyOn(adapter, 'collectPageTargets');
    await controller.start();
    await flush();
    collect.mockClear();
    for (let i = 0; i < 10; i += 1) document.body.append(document.createElement('aside'));
    await flush();
    expect(collect).not.toHaveBeenCalled();
    document.querySelector('.fr-view > p')!.textContent = 'Changed climbing note.';
    await flush();
    expect(collect).toHaveBeenCalledTimes(1);
    expect(collect.mock.calls[0]?.[0]).toBe(document.querySelector('section'));
    controller.destroy();
  });

  it('prunes removed targets and rejects their in-flight results', async () => {
    section(1);
    let release!: (value: string) => void;
    const { controller, ledger, renderer } = harness({ id: 'mock', availability: async () => 'available', translate: () => new Promise((resolve) => { release = resolve; }) });
    const remove = vi.spyOn(renderer, 'remove');
    const done = controller.start();
    await flush();
    document.querySelector('section')!.remove();
    await flush();
    expect(ledger.snapshot()).toHaveLength(0);
    expect(remove).toHaveBeenCalledTimes(1);
    release('제거된 항목의 번역');
    await done;
    expect(ledger.snapshot()).toHaveLength(0);
    expect(document.querySelector('.mpkr-machine-translation')).toBeNull();
    controller.destroy();
  });

  it('drains targets enqueued after a drain loop ends but before its promise settles', async () => {
    section(1);
    const translate = vi.fn(async ({ text }: { text: string }) => `번역 ${text}`);
    const { controller } = harness({ id: 'mock', availability: async () => 'available', translate });
    const internals = controller as unknown as { drain(generation: number): Promise<void> };
    const drain = internals.drain.bind(controller);
    vi.spyOn(internals, 'drain').mockImplementationOnce(async (generation) => {
      await drain(generation);
      // Hold the completion boundary open while the observer enqueues another target.
      document.querySelector('.fr-view')!.append(Object.assign(document.createElement('p'), {
        textContent: 'Enqueued at the drain completion boundary.',
      }));
      await flush();
    });
    await controller.start();
    expect(translate).toHaveBeenCalledTimes(2);
    expect(document.querySelector('.mpkr-translation-body')?.textContent)
      .toContain('번역 Enqueued at the drain completion boundary.');
    controller.destroy();
  });

  it('keeps the provider slot across destroy and restart until a non-abortable call settles', async () => {
    section(1);
    let release!: (value: string) => void;
    let active = 0;
    let peak = 0;
    let calls = 0;
    const destroy = vi.fn();
    const { controller } = harness({
      id: 'non-abortable', availability: async () => 'available', destroy,
      translate: async () => {
        active += 1;
        peak = Math.max(peak, active);
        calls += 1;
        try {
          return calls === 1 ? await new Promise<string>((resolve) => { release = resolve; }) : '새 번역';
        } finally { active -= 1; }
      },
    });
    const first = controller.start();
    await flush();
    controller.destroy();
    const second = controller.start();
    await flush();
    expect(destroy).toHaveBeenCalledTimes(1);
    expect(calls).toBe(1);
    release('폐기할 이전 번역');
    await Promise.all([first, second]);
    expect(calls).toBe(2);
    expect(peak).toBe(1);
    expect(document.querySelector('.mpkr-translation-body')?.textContent).toBe('새 번역');
    controller.destroy();
  });
});
