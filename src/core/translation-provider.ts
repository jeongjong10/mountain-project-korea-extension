export interface TranslationRequest {
  sourceLanguage: 'en';
  targetLanguage: 'ko';
  text: string;
}

export interface TranslationProvider {
  readonly id: string;
  availability(): Promise<'available' | 'downloadable' | 'unavailable'>;
  translate(request: TranslationRequest): Promise<string>;
  destroy?(): void;
}
