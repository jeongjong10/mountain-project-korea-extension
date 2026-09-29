import { UI } from './design-tokens';

/** Shared presentation for visible, recoverable status messages. */
export const STATUS_MESSAGE_CSS = `
.mpkr-status-message { box-sizing:border-box;display:block;margin:12px 0;padding:10px 12px;border-left:3px solid ${UI.color.link};background:${UI.color.surfaceHover};color:${UI.color.text};font:12px/1.75 ${UI.font.family};white-space:normal;overflow-wrap:anywhere;text-align:left; }
.mpkr-status-message[hidden] { display:none; }
.mpkr-status-message strong { display:block;font-size:13px;font-weight:600; }
.mpkr-status-message p,.mpkr-status-message__detail { display:block; margin:3px 0 0;font-size:12px;line-height:1.75;color:${UI.color.muted}; }
`;

export const TRANSLATION_ACTION_CSS = `${STATUS_MESSAGE_CSS}
.mpkr-translation-actions { display:inline-flex;max-width:100%;flex-wrap:wrap;align-items:center;gap:8px;margin:0.35rem 0 0; }
.mpkr-translation-actions button { box-sizing:border-box;margin:0;padding:0;border:0;border-radius:0;background:transparent;color:#52635a;font:inherit;font-size:0.75rem;cursor:pointer;text-decoration:underline; }
.mpkr-translation-actions button:hover { background:transparent; }
.mpkr-translation-actions button:focus-visible { outline:2px solid ${UI.color.link};outline-offset:3px; }
.mpkr-translation-actions button:disabled { cursor:wait;opacity:.65; }
.mpkr-translation-actions [hidden] { display:none; }
.mpkr-translation-feedback { color:${UI.color.muted};font:12px/1.5 ${UI.font.family}; }
`;

/** Split short heading/detail copy without inserting HTML from message content. */
export function setStatusMessage(element: HTMLElement, message: string): void {
  if (element.textContent === message) return;
  const split = message.indexOf('. ');
  if (split < 0) { element.textContent = message; return; }
  const title = element.ownerDocument.createElement('strong');
  title.textContent = message.slice(0, split + 2);
  const detail = element.ownerDocument.createElement('span');
  detail.className = 'mpkr-status-message__detail';
  detail.textContent = message.slice(split + 2);
  element.replaceChildren(title, detail);
}
