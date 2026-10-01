import { createMountainProjectApplication } from '@/application/mountain-project-application';
import type { PageLifecycle } from '@/application/ports';
import { ChromeTranslationProvider } from '@/platforms/chrome/chrome-translation-provider';

const originalUrl = window.location.href;
let page: PageLifecycle | undefined;
const settle = async () => { await new Promise((resolve) => setTimeout(resolve, 0)); };

beforeEach(() => {
  window.location.href = 'https://www.mountainproject.com/route/123/test-route';
  document.head.innerHTML = '';
  document.body.innerHTML = `
    <main id="route-page">
      <div id="you-and-route"></div>
      <section>
        <h2 id="description-heading">Description</h2>
        <div id="route-source" class="fr-view"><p>Original route text.</p><p>Second paragraph.<br>Original line break.</p></div>
      </section>
      <a id="original-link" href="/area/123/original-area">Original area</a>
      <form id="original-form" action="/original-action" method="post"><input name="note" value="User input"></form>
    </main>`;
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Unexpected network access')));
  Reflect.deleteProperty(globalThis, 'Translator');
});

afterEach(() => {
  page?.destroy();
  page = undefined;
  window.location.href = originalUrl;
  Reflect.deleteProperty(globalThis, 'Translator');
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('shared runtime with Whale-compatible feature detection', () => {
  it.each(['missing-api', 'availability-failure', 'unavailable-language-pair'] as const)(
    'keeps fixed UI and original content without input-triggered retry loops for %s',
    async (failure) => {
      const availability = failure === 'availability-failure'
        ? vi.fn().mockRejectedValue(new Error('Availability query failed'))
        : vi.fn().mockResolvedValue('unavailable');
      const create = vi.fn().mockRejectedValue(new Error('Language pair not supported'));
      if (failure !== 'missing-api') {
        Object.defineProperty(globalThis, 'Translator', {
          configurable: true,
          value: { availability, create },
        });
      }
      const originalBody = document.body.innerHTML;
      const source = document.querySelector<HTMLElement>('#route-source')!;
      const sourceMarkup = source.innerHTML;
      const link = document.querySelector<HTMLAnchorElement>('#original-link')!;
      const form = document.querySelector<HTMLFormElement>('#original-form')!;
      const input = form.querySelector<HTMLInputElement>('input')!;
      const submit = vi.fn((event: Event) => event.preventDefault());
      form.addEventListener('submit', submit);
      const provider = new ChromeTranslationProvider();
      const providerAvailability = vi.spyOn(provider, 'availability');
      page = createMountainProjectApplication(provider);

      page.enable();
      await vi.waitFor(() => {
        expect(document.querySelector('.mpkr-translation-notice')?.getAttribute('data-state'))
          .toBe('unsupported');
      });
      await settle();

      expect(document.documentElement.dataset.mpKoreaCore).toBe('ready');
      expect(document.querySelector('#description-heading')?.textContent).toContain('설명');
      expect(source.innerHTML).toBe(sourceMarkup);
      expect(document.querySelector('.mpkr-machine-translation')).toBeNull();
      expect(document.querySelector<HTMLButtonElement>('.mpkr-translation-notice button')?.hidden).toBe(true);
      expect(create).toHaveBeenCalledTimes(failure === 'missing-api' ? 0 : 1);
      // Start checks availability once, then the settled preparation triggers one bounded retry.
      expect(availability).toHaveBeenCalledTimes(failure === 'missing-api' ? 0 : 2);
      expect(providerAvailability).toHaveBeenCalledTimes(2);

      for (let i = 0; i < 3; i += 1) {
        document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        await settle();
      }
      expect(create).toHaveBeenCalledTimes(failure === 'missing-api' ? 0 : 1);
      expect(availability).toHaveBeenCalledTimes(failure === 'missing-api' ? 0 : 2);
      expect(providerAvailability).toHaveBeenCalledTimes(2);
      expect(document.querySelector('.mpkr-translation-notice')?.getAttribute('data-state'))
        .toBe('unsupported');
      expect(document.querySelector('#original-link')).toBe(link);
      expect(link.getAttribute('href')).toBe('/area/123/original-area');
      input.value = 'Edited while enabled';
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      expect(submit).toHaveBeenCalledOnce();
      expect(form.getAttribute('action')).toBe('/original-action');

      page.disable();
      expect(document.body.innerHTML).toBe(originalBody);
      expect(document.querySelector<HTMLInputElement>('input')?.value).toBe('Edited while enabled');
      expect(document.head.querySelector('[data-mpkr-translation-notice]')).toBeNull();
      expect(document.documentElement.dataset.mpKoreaExtension).toBe('disabled');
      document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      source.append(document.createTextNode(' Added after OFF.'));
      await settle();
      expect(create).toHaveBeenCalledTimes(failure === 'missing-api' ? 0 : 1);
      expect(availability).toHaveBeenCalledTimes(failure === 'missing-api' ? 0 : 2);
      expect(providerAvailability).toHaveBeenCalledTimes(2);
      expect(document.querySelector('.mpkr-translation-notice')).toBeNull();
      expect(fetch).not.toHaveBeenCalled();
    },
  );

  it('destroys a late prepared engine after OFF without translating or restoring notices', async () => {
    const destroy = vi.fn();
    const translate = vi.fn(async () => '번역된 설명');
    let finish!: (engine: { translate: typeof translate; destroy: typeof destroy }) => void;
    const create = vi.fn(() => new Promise<{ translate: typeof translate; destroy: typeof destroy }>((resolve) => {
      finish = resolve;
    }));
    const availability = vi.fn().mockResolvedValue('downloadable');
    Object.defineProperty(globalThis, 'Translator', {
      configurable: true,
      value: { availability, create },
    });
    const originalBody = document.body.innerHTML;
    page = createMountainProjectApplication(new ChromeTranslationProvider());
    page.enable();
    await vi.waitFor(() => {
      expect(document.querySelector('.mpkr-translation-notice')?.getAttribute('data-state'))
        .toBe('waiting');
    });
    expect(create).toHaveBeenCalledOnce();

    page.disable();
    finish({ translate, destroy });
    await vi.waitFor(() => expect(destroy).toHaveBeenCalledOnce());
    document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await settle();

    expect(create).toHaveBeenCalledOnce();
    expect(availability).toHaveBeenCalledOnce();
    expect(translate).not.toHaveBeenCalled();
    expect(document.body.innerHTML).toBe(originalBody);
    expect(document.querySelector('.mpkr-translation-notice')).toBeNull();
    expect(document.documentElement.dataset.mpKoreaExtension).toBe('disabled');
    expect(fetch).not.toHaveBeenCalled();
  });
});
