import { ChromeTranslationProvider } from '@/platforms/chrome/chrome-translation-provider';

describe('ChromeTranslationProvider', () => {
  const context = {
    category: 'description' as const,
    pageKind: 'route',
    policyVersion: 'test-policy',
    glossaryVersion: 'test-glossary',
  };
  afterEach(() => {
    Reflect.deleteProperty(globalThis, 'Translator');
  });

  it('reports unsupported browsers without throwing', async () => {
    const provider = new ChromeTranslationProvider();
    await expect(provider.availability()).resolves.toBe('unavailable');
    await expect(provider.prepare()).rejects.toThrow('Translator API is unavailable');
    await expect(provider.translate({
      sourceLanguage: 'en', targetLanguage: 'ko', text: 'original', context,
    })).rejects.toThrow('Translator API is unavailable');
    expect(() => provider.destroy()).not.toThrow();
  });

  it.each([
    ['available', 'available'],
    ['readily', 'available'],
    ['downloadable', 'downloadable'],
    ['after-download', 'downloadable'],
    ['downloading', 'downloadable'],
    ['unavailable', 'unavailable'],
    ['no', 'unavailable'],
    ['unexpected-status', 'unavailable'],
  ])('maps language-pair status %s to %s without preparing a session', async (status, expected) => {
    const availability = vi.fn(async () => status);
    const create = vi.fn();
    Object.defineProperty(globalThis, 'Translator', {
      configurable: true,
      value: { availability, create },
    });

    await expect(new ChromeTranslationProvider().availability()).resolves.toBe(expected);

    expect(availability).toHaveBeenCalledExactlyOnceWith({ sourceLanguage: 'en', targetLanguage: 'ko' });
    expect(create).not.toHaveBeenCalled();
  });

  it('fails closed when the availability query rejects', async () => {
    const availability = vi.fn().mockRejectedValue(new Error('Availability query failed'));
    const create = vi.fn();
    Object.defineProperty(globalThis, 'Translator', {
      configurable: true,
      value: { availability, create },
    });

    await expect(new ChromeTranslationProvider().availability()).resolves.toBe('unavailable');

    expect(availability).toHaveBeenCalledOnce();
    expect(create).not.toHaveBeenCalled();
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
    const first = provider.translate({ sourceLanguage: 'en', targetLanguage: 'ko', text: 'one', context });
    const second = provider.translate({ sourceLanguage: 'en', targetLanguage: 'ko', text: 'two', context });

    expect(create).toHaveBeenCalledOnce();

    await expect(first).resolves.toBe('KO:one');
    await expect(second).resolves.toBe('KO:two');
    expect(translate).toHaveBeenCalledTimes(2);

    provider.destroy();
    await Promise.resolve();
    expect(destroy).toHaveBeenCalledOnce();
  });

  it('starts create synchronously from prepare and shares it with translation', async () => {
    let finish!: (instance: { translate(text: string): Promise<string> }) => void;
    const translate = vi.fn(async (text: string) => `KO:${text}`);
    const create = vi.fn(() => new Promise<{ translate(text: string): Promise<string> }>((resolve) => {
      finish = resolve;
    }));
    Object.defineProperty(globalThis, 'Translator', {
      configurable: true,
      value: { availability: vi.fn(async () => 'downloadable'), create },
    });
    const provider = new ChromeTranslationProvider();

    const preparation = provider.prepare();
    expect(create).toHaveBeenCalledOnce();
    expect(create).toHaveBeenCalledWith({ sourceLanguage: 'en', targetLanguage: 'ko' });
    const translation = provider.translate({
      sourceLanguage: 'en', targetLanguage: 'ko', text: 'shared', context,
    });
    const repeatedPreparation = provider.prepare();
    expect(create).toHaveBeenCalledOnce();

    finish({ translate });
    await expect(preparation).resolves.toBeUndefined();
    await expect(repeatedPreparation).resolves.toBeUndefined();
    await expect(translation).resolves.toBe('KO:shared');
    expect(translate).toHaveBeenCalledOnce();
  });

  it('clears a rejected preparation so the next activation can retry create', async () => {
    const translate = vi.fn(async (text: string) => `KO:${text}`);
    const create = vi.fn()
      .mockRejectedValueOnce(new Error('Requires a user activation'))
      .mockResolvedValueOnce({ translate });
    Object.defineProperty(globalThis, 'Translator', {
      configurable: true,
      value: { availability: vi.fn(async () => 'downloadable'), create },
    });
    const provider = new ChromeTranslationProvider();

    await expect(provider.prepare()).rejects.toThrow('user activation');
    await expect(provider.prepare()).resolves.toBeUndefined();
    await expect(provider.translate({
      sourceLanguage: 'en', targetLanguage: 'ko', text: 'retry', context,
    })).resolves.toBe('KO:retry');
    expect(create).toHaveBeenCalledTimes(2);
  });

  it('does not let a disposed preparation rejection clear a newer active session', async () => {
    let rejectOld!: (reason: Error) => void;
    const translate = vi.fn(async (text: string) => `KO:${text}`);
    const destroy = vi.fn();
    const create = vi.fn()
      .mockImplementationOnce(() => new Promise((_, reject) => { rejectOld = reject; }))
      .mockResolvedValueOnce({ translate, destroy });
    Object.defineProperty(globalThis, 'Translator', {
      configurable: true,
      value: { availability: vi.fn(async () => 'available'), create },
    });
    const provider = new ChromeTranslationProvider();
    const oldPreparation = provider.prepare();
    const oldFailure = expect(oldPreparation).rejects.toThrow('Old preparation failed');
    provider.destroy();
    await expect(provider.prepare()).resolves.toBeUndefined();

    rejectOld(new Error('Old preparation failed'));
    await oldFailure;

    await expect(provider.translate({
      sourceLanguage: 'en', targetLanguage: 'ko', text: 'new session', context,
    })).resolves.toBe('KO:new session');
    expect(create).toHaveBeenCalledTimes(2);
    expect(destroy).not.toHaveBeenCalled();
    provider.destroy();
    await Promise.resolve();
    expect(destroy).toHaveBeenCalledOnce();
  });
});
