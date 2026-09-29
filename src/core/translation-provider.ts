export type TranslationContextCategory =
  | 'description'
  | 'access'
  | 'safety'
  | 'comment'
  | 'help';

export interface TranslationContextMetadata {
  category: TranslationContextCategory;
  pageKind: string;
  sectionHeading?: string;
  policyVersion: string;
  glossaryVersion: string;
}

export interface TranslationRequest {
  sourceLanguage: 'en';
  targetLanguage: 'ko';
  text: string;
  context: TranslationContextMetadata;
}

export interface TranslationProvider {
  readonly id: string;
  availability(): Promise<'available' | 'downloadable' | 'unavailable'>;
  translate(request: TranslationRequest): Promise<string>;
  destroy?(): void;
}
