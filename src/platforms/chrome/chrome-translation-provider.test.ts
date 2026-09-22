import { ChromeTranslationProvider } from './chrome-translation-provider';

describe('ChromeTranslationProvider', () => {
  afterEach(() => {
    Reflect.deleteProperty(globalThis, 'Translator');
  });

  it('reports unsupported browsers without throwing', async () => {
    const provider = new ChromeTranslationProvider();
    await expect(provider.availability()).resolves.toBe('unavailable');
  });

  it('maps model availability and reuses one on-device session', async () => {
    const destroy = vi.fn();
    const translate = vi.fn(async (text: string) => `KO:${text}`);
    const create = vi.fn(async () => ({ translate, destroy }));
    Object.defineProperty(globalThis, 'Translator', {
      configurable: true,
      value: {
        availability: vi.fn(async () => 'downloadable'),
        create,
      },
    });
    const provider = new ChromeTranslationProvider();

    await expect(provider.availability()).resolves.toBe('downloadable');
    const first = provider.translate({ sourceLanguage: 'en', targetLanguage: 'ko', text: 'one' });
    const second = provider.translate({ sourceLanguage: 'en', targetLanguage: 'ko', text: 'two' });

    expect(create).toHaveBeenCalledOnce();

    await expect(first).resolves.toBe('KO:one');
    await expect(second).resolves.toBe('KO:two');
    expect(translate).toHaveBeenCalledTimes(2);

    provider.destroy();
    await Promise.resolve();
    expect(destroy).toHaveBeenCalledOnce();
  });
});
