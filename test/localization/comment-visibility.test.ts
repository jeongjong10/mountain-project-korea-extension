import { PageTranslationController } from '@/localization/page-translation-controller';
import { MountainProjectPageAdapter } from '@/sites/mountain-project/dom/page-adapter';
import { OriginalPreservingRenderer } from '@/rendering/original-preserving-renderer';
import { TranslationLedger } from '@/core/translation-record';
import { StatsProgressiveList } from '@/ui/stats-progressive-list';

class Observer {
  static instances: Observer[] = [];
  elements = new Set<Element>();
  constructor(readonly callback: IntersectionObserverCallback, readonly options: IntersectionObserverInit = {}) {
    Observer.instances.push(this);
  }
  observe(element: Element) { this.elements.add(element); }
  unobserve(element: Element) { this.elements.delete(element); }
  disconnect() { this.elements.clear(); }
  emit(element: Element, visible = true) {
    this.callback([{ target: element, isIntersecting: visible } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
}
const mutationObservers: Array<{ observer: MutationObserver; callback: MutationCallback }> = [];
async function flush(): Promise<void> {
  for (let batch = 0; batch < 100; batch += 1) {
    await vi.runAllTimersAsync();
    let delivered = 0;
    for (const { observer, callback } of mutationObservers) {
      const records = observer.takeRecords();
      delivered += records.length;
      if (records.length) callback(records, observer);
    }
    if (!delivered) return;
  }
  throw new Error('Comment mutations did not settle within 100 batches');
}
let controller: PageTranslationController;
let list: StatsProgressiveList | undefined;
function start() {
  const translate = vi.fn(async ({ text }: { text: string }) => `번역 ${text}`);
  controller = new PageTranslationController({ id: 'mock', availability: async () => 'available', translate }, new TranslationLedger(), new MountainProjectPageAdapter(), new OriginalPreservingRenderer());
  return translate;
}
beforeEach(() => {
  vi.useFakeTimers({
    toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame'],
    loopLimit: 100,
  });
  // Keep real DOM records while explicitly draining observer delivery.
  const NativeMutationObserver = MutationObserver;
  mutationObservers.length = 0;
  vi.stubGlobal('MutationObserver', class extends NativeMutationObserver {
    constructor(callback: MutationCallback) {
      super(callback);
      mutationObservers.push({ observer: this, callback });
    }
  });
  Observer.instances = [];
  vi.stubGlobal('IntersectionObserver', Observer);
});
afterEach(() => {
  controller?.destroy();
  list?.destroy();
  list = undefined;
  document.body.innerHTML = '';
  vi.clearAllTimers();
  vi.restoreAllMocks();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it('translates only six visible/nearby ticks among 250, then two newly entering rows', async () => {
  document.body.innerHTML = `<div id="route-stats"><div class="onx-stats-table mpkr-route-stats-ticks-viewport"><table><tbody>${Array.from({length:250}, (_, i) => `<tr id="ticks.${i}"><td><a href="/user/${i}">User</a></td><td><div class="small"><div>English tick note ${i}.</div></div></td></tr>`).join('')}</tbody></table></div></div>`;
  const original = document.body.innerHTML;
  const translate = start();
  const table = document.querySelector('table')!;
  const viewport = document.querySelector<HTMLElement>('.mpkr-route-stats-ticks-viewport')!;
  list = new StatsProgressiveList(table, viewport, false, () => {});
  list.refresh();
  await controller.start();
  expect(translate).toHaveBeenCalledTimes(0);
  const root = document.querySelector('.mpkr-route-stats-ticks-viewport')!;
  const inner = Observer.instances.find((item) => item.options.root === root)!;
  const outer = Observer.instances.find((item) => !item.options.root)!;
  const rows = [...document.querySelectorAll('tr')];
  rows.slice(0, 6).forEach((row) => inner.emit(row));
  await flush();
  expect(translate).toHaveBeenCalledTimes(0);
  outer.emit(root);
  await flush();
  expect(translate).toHaveBeenCalledTimes(6);
  inner.emit(rows[25]!);
  await flush();
  expect(translate).toHaveBeenCalledTimes(6);
  rows.slice(6, 8).forEach((row) => inner.emit(row));
  await flush();
  expect(translate).toHaveBeenCalledTimes(8);
  viewport.scrollTop = 100;
  viewport.dispatchEvent(new Event('scroll'));
  await flush();
  expect(rows[25]!.hasAttribute('hidden')).toBe(false);
  inner.emit(rows[25]!);
  await flush();
  expect(translate).toHaveBeenCalledTimes(9);
  expect(translate.mock.calls.map(([request]) => request.text)).toEqual(
    [0, 1, 2, 3, 4, 5, 6, 7, 25].map((index) => `English tick note ${index}.`),
  );
  controller.destroy();
  inner.emit(rows[8]!);
  await flush();
  expect(translate).toHaveBeenCalledTimes(9);
  expect(inner.elements.size).toBe(0);
  list.destroy();
  expect(document.body.innerHTML).toBe(original);
});

it('defers regular comments while immediately translating authored text', async () => {
  document.body.innerHTML = '<section><h2>Description</h2><div class="fr-view"><p>English description.</p></div></section><div class="comment-list"><div class="comment-body"><span id="1-full">English comment.</span></div></div>';
  const translate = start();
  await controller.start();
  expect(translate).toHaveBeenCalledTimes(1);
  const observer = Observer.instances[0]!;
  observer.emit(document.querySelector('.comment-body')!);
  await flush();
  expect(translate).toHaveBeenCalledTimes(2);
});

it('starts a downloadable model on user retry for a visible comment', async () => {
  document.body.innerHTML = '<div class="comment-list"><div class="comment-body"><span id="1-full">English comment.</span></div></div>';
  const translate = vi.fn(async () => '한국어 댓글');
  controller = new PageTranslationController({ id: 'mock', availability: async () => 'downloadable', translate }, new TranslationLedger(), new MountainProjectPageAdapter(), new OriginalPreservingRenderer());
  await controller.start();
  Observer.instances[0]!.emit(document.querySelector('.comment-body')!);
  await flush();
  expect(translate).not.toHaveBeenCalled();
  await controller.retry();
  expect(translate).toHaveBeenCalledTimes(1);
});

it('does not process a removed deferred comment', async () => {
  document.body.innerHTML = '<div class="comment-list"><div class="comment-body"><span id="1-full">English comment.</span></div></div>';
  const translate = start();
  await controller.start();
  const element = document.querySelector('.comment-body')!;
  element.remove();
  await flush();
  Observer.instances[0]!.emit(element);
  await flush();
  expect(translate).not.toHaveBeenCalled();
});

it('drops a queued comment when it scrolls away and translates it on reentry', async () => {
  document.body.innerHTML = `<div class="comment-list">${[1, 2].map((id) => `<div class="comment-body"><span id="${id}-full">English comment ${id}.</span></div>`).join('')}</div>`;
  let release!: (value: string) => void;
  const translate = vi.fn(() => new Promise<string>((resolve) => { release = resolve; }));
  controller = new PageTranslationController({ id: 'mock', availability: async () => 'available', translate }, new TranslationLedger(), new MountainProjectPageAdapter(), new OriginalPreservingRenderer());
  await controller.start();
  const observer = Observer.instances[0]!;
  const [first, second] = [...document.querySelectorAll('.comment-body')];
  observer.emit(first!);
  observer.emit(second!);
  await flush();
  expect(translate).toHaveBeenCalledTimes(1);
  observer.emit(second!, false);
  release('첫 번째 번역');
  await flush();
  expect(translate).toHaveBeenCalledTimes(1);
  observer.emit(second!);
  await flush();
  expect(translate).toHaveBeenCalledTimes(2);
  release('두 번째 번역');
  await flush();
});
