import type { TranslationNoticeState } from '../application/translation-notice-state';
import { UI } from './design-tokens';

const COPY = {
  waiting: ['한국어 번역을 준비해 주세요', '처음에는 브라우저 번역 언어팩 준비가 필요할 수 있습니다.', '번역 준비 시작'],
  preparing: ['한국어 번역을 준비하고 있습니다', '준비가 끝나면 번역을 이어갑니다. 그동안 원문을 읽을 수 있습니다.', '준비 중…'],
  unsupported: ['이 환경에서는 본문 번역을 사용할 수 없습니다', '원문을 표시합니다. 지원되는 지도·통계와 탐색 기능은 계속 사용할 수 있습니다.', '사용 안내'],
  failed: ['번역을 완료하지 못했습니다', '번역하지 못한 부분은 원문을 유지합니다. 잠시 후 다시 시도해 주세요.', '다시 시도'],
} as const;

export class TranslationNotice {
  private root?: HTMLDivElement;
  private style?: HTMLStyleElement;
  private title?: HTMLElement;
  private message?: HTMLElement;
  private button?: HTMLButtonElement;
  private guide?: HTMLAnchorElement;
  private state?: TranslationNoticeState;

  constructor(private readonly retry: () => Promise<void>) {}

  render(state: TranslationNoticeState | undefined): void {
    if (!state || !state.anchor.isConnected) { this.destroy(); return; }
    this.state = state;
    if (!this.root) this.create();
    const [title, message, action] = COPY[state.kind];
    this.root!.dataset.state = state.kind;
    // Preserve focus and avoid repeating live announcements for unchanged state.
    if (this.title!.textContent !== title) this.title!.textContent = title;
    if (this.message!.textContent !== message) this.message!.textContent = message;
    if (this.button!.textContent !== action) this.button!.textContent = action;
    this.button!.disabled = state.kind === 'preparing';
    this.button!.hidden = state.kind === 'unsupported' || state.kind === 'failed' && !state.retryable;
    this.guide!.hidden = state.kind !== 'unsupported';
    if (!this.root!.isConnected) {
      // Keep the action visible even when the authored section is collapsed.
      const anchor = state.anchor.closest('.mpkr-area-section-body')
        ?? state.anchor.closest('table')
        ?? state.anchor.closest('.fr-view')
        ?? state.anchor.closest('h1, h2, h3, p, section, div')
        ?? state.anchor;
      anchor.before(this.root!);
    }
  }

  destroy(): void {
    this.root?.remove();
    this.style?.remove();
    this.root = undefined;
    this.style = undefined;
    this.state = undefined;
  }

  private create(): void {
    this.root = document.createElement('div');
    this.root.className = 'mpkr-translation-notice';
    this.root.setAttribute('translate', 'no');
    this.root.setAttribute('aria-label', '본문 번역 안내');
    const body = document.createElement('div');
    const status = document.createElement('div');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');
    this.title = document.createElement('strong');
    this.message = document.createElement('p');
    status.append(this.title, this.message);
    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.addEventListener('click', () => {
      if (this.button!.disabled) return;
      const state = this.state;
      void this.retry().catch(() => {
        if (this.root?.isConnected && state) this.render({ ...state, kind: 'failed', retryable: true });
      });
    });
    this.guide = document.createElement('a');
    this.guide.href = 'https://github.com/jeongjong10/mountain-project-korea-extension#readme';
    this.guide.target = '_blank';
    this.guide.rel = 'noopener';
    this.guide.textContent = '사용 안내';
    body.append(status, this.button, this.guide);
    this.root.append(body);
    this.style = document.createElement('style');
    this.style.dataset.mpkrTranslationNotice = '';
    this.style.textContent = `
.mpkr-translation-notice { display:flex;gap:10px;align-items:flex-start;margin:16px 0;padding:14px 12px;box-sizing:border-box;border-left:3px solid ${UI.color.link};background:${UI.color.surfaceHover};color:${UI.color.text};font:13px/1.6 ${UI.font.family};clear:both; }
.mpkr-translation-notice > div { min-width:0; }
.mpkr-translation-notice strong { display:block;font-size:13px;font-weight:600; }
.mpkr-translation-notice p { margin:7px 0 12px;font-size:12px;line-height:1.75;color:${UI.color.muted}; }
.mpkr-translation-notice button,.mpkr-translation-notice a { display:inline-block;box-sizing:border-box;margin:0;padding:7px 12px;border:1px solid ${UI.color.link};border-radius:${UI.radius.control};background:${UI.color.surface};color:${UI.color.link};font:600 12px/1.5 ${UI.font.family};cursor:pointer;text-decoration:none; }
.mpkr-translation-notice button:hover,.mpkr-translation-notice a:hover { background:${UI.color.surfaceSubtle}; }
.mpkr-translation-notice button:focus-visible,.mpkr-translation-notice a:focus-visible { outline:2px solid ${UI.color.link};outline-offset:3px; }
.mpkr-translation-notice button:disabled { border-color:${UI.color.border};color:${UI.color.muted};cursor:wait; }
.mpkr-translation-notice [hidden] { display:none; }
`;
    document.head.append(this.style);
  }
}
