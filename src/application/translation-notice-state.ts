/** Page-level translation readiness. A missing value keeps normal translation quiet. */
export interface TranslationNoticeState {
  kind: 'waiting' | 'preparing' | 'unsupported' | 'failed';
  anchor: HTMLElement;
  retryable: boolean;
}
