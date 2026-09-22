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
    const translator = factory();
    if (!translator) {
      throw new Error('Chrome Translator API is unavailable');
    }

    this.instancePromise ??= translator.create({
      sourceLanguage: request.sourceLanguage,
      targetLanguage: request.targetLanguage,
    });
    try {
      const instance = await this.instancePromise;
      return await instance.translate(request.text);
    } catch (error) {
      this.instancePromise = undefined;
      throw error;
    }
  }

  destroy(): void {
    void this.instancePromise
      ?.then((instance) => instance.destroy?.())
      .catch(() => undefined);
    this.instancePromise = undefined;
  }
}
