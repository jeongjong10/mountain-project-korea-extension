import type {
  TranslationProvider,
  TranslationRequest,
} from '../../core/translation-provider';

type ChromeTranslatorAvailability =
  | 'available'
  | 'readily'
  | 'downloadable'
  | 'after-download'
  | 'downloading'
  | 'unavailable'
  | 'no';

interface ChromeTranslatorInstance {
  translate(text: string): Promise<string>;
  destroy?(): void;
}

interface ChromeTranslatorFactory {
  availability(options: {
    sourceLanguage: string;
    targetLanguage: string;
  }): Promise<ChromeTranslatorAvailability>;
  create(options: {
    sourceLanguage: string;
    targetLanguage: string;
  }): Promise<ChromeTranslatorInstance>;
}

function factory(): ChromeTranslatorFactory | undefined {
  return (globalThis as typeof globalThis & { Translator?: ChromeTranslatorFactory }).Translator;
}

export class ChromeTranslationProvider implements TranslationProvider {
  readonly id = 'chrome-on-device-translator';
  private instancePromise: Promise<ChromeTranslatorInstance> | undefined;

  prepare(): Promise<void> {
    return this.instance('en', 'ko').then(() => undefined);
  }

  async availability(): Promise<'available' | 'downloadable' | 'unavailable'> {
    const translator = factory();
    if (!translator) {
      return 'unavailable';
    }

    try {
      const status = await translator.availability({
        sourceLanguage: 'en',
        targetLanguage: 'ko',
      });
      if (status === 'available' || status === 'readily') {
        return 'available';
      }
      if (status === 'downloadable' || status === 'after-download' || status === 'downloading') {
        return 'downloadable';
      }
      return 'unavailable';
    } catch {
      return 'unavailable';
    }
  }

  async translate(request: TranslationRequest): Promise<string> {
    const instancePromise = this.instance(request.sourceLanguage, request.targetLanguage);
    try {
      const instance = await instancePromise;
      return await instance.translate(request.text);
    } catch (error) {
      if (this.instancePromise === instancePromise) this.instancePromise = undefined;
      throw error;
    }
  }

  private instance(sourceLanguage: string, targetLanguage: string): Promise<ChromeTranslatorInstance> {
    if (this.instancePromise) {
      return this.instancePromise;
    }
    const translator = factory();
    if (!translator) {
      return Promise.reject(new Error('Chrome Translator API is unavailable'));
    }

    let created: Promise<ChromeTranslatorInstance>;
    try {
      // Keep create() in the caller's activation stack when prepare() is called
      // from the extension switch or the page's first ordinary interaction.
      created = translator.create({ sourceLanguage, targetLanguage });
    } catch (error) {
      return Promise.reject(error);
    }
    const tracked = created.catch((error) => {
      if (this.instancePromise === tracked) this.instancePromise = undefined;
      throw error;
    });
    this.instancePromise = tracked;
    return tracked;
  }

  destroy(): void {
    void this.instancePromise
      ?.then((instance) => instance.destroy?.())
      .catch(() => undefined);
    this.instancePromise = undefined;
  }
}
