import { STATUS_MESSAGE_CSS } from './message-style';
import { UI, NAV } from './design-tokens';
import { NAVIGATION_HEADER, NAVIGATION_USER } from '../sites/mountain-project/dom/navigation';

export const NAVIGATION_CONTROL_CSS = `
${STATUS_MESSAGE_CSS}
/* Keep the added controls inside MP's native 15px container gutter. The second
   8px inset absorbs the hamburger's native -8px end margin on narrow screens. */
${NAVIGATION_HEADER} .header-container:has(.mp-nav-control) { flex-wrap: wrap; column-gap: 12px; }
${NAVIGATION_HEADER} ${NAVIGATION_USER}:has(.mp-nav-control) { --mp-nav-gap: .5rem; display: flex; flex: 1 1 auto; align-items: center; align-content: center; justify-content: flex-end; flex-wrap: wrap; min-width: 0; max-width: calc(100% - 1rem); margin: .5rem .5rem .5rem auto; padding: 0 .5rem 0 0; box-sizing: border-box; column-gap: var(--mp-nav-gap); row-gap: .5rem; }
${NAVIGATION_HEADER} .mp-nav-control { display: inline-flex; align-items: center; justify-content: center; gap: 9px; flex: 0 0 auto; position: relative; box-sizing: border-box; height: ${NAV.height}; margin: 0; padding: 0 12px; border: 1px solid transparent; border-radius: 0; white-space: nowrap; font: ${UI.font.controlWeight} ${NAV.fontSize}/1.2 ${UI.font.family}; letter-spacing: -.15px; text-decoration: none; color: ${NAV.text}; background: transparent; cursor: pointer; vertical-align: middle; }
${NAVIGATION_HEADER} a.mp-nav-control { color: ${NAV.link}; text-decoration: none; }
${NAVIGATION_HEADER} .mp-nav-control:focus-visible, ${NAVIGATION_HEADER} .mp-nav-control:has(input:focus-visible) { outline: 2px solid ${NAV.focus}; outline-offset: 3px; z-index: 1; }
.mp-nav-control .mp-nav-icon { display: block; width: 18px; height: 18px; flex: 0 0 18px; }
.mp-nav-control .mp-nav-copy { display: block; }
${NAVIGATION_HEADER} .mp-nav-control input { appearance: none; box-sizing: border-box; position: relative; flex: 0 0 26px; width: 26px; height: 16px; margin: 0; border: 1px solid ${NAV.switchBorder}; border-radius: 9px; color: ${NAV.switchThumb}; background: ${NAV.switchOff}; cursor: pointer; }
.mp-nav-control input::before { content: ''; position: absolute; width: 10px; height: 10px; left: 2px; top: 2px; border-radius: 50%; background: currentColor; }
${NAVIGATION_HEADER} .mp-nav-control input:checked { color: ${NAV.switchOnThumb}; background: ${NAV.switchOn}; border-color: ${NAV.switchOn}; }
.mp-nav-control input:checked::before { left: 12px; }
.mp-nav-control input:disabled { opacity: .5; cursor: wait; }
${NAVIGATION_HEADER} label.mp-nav-control:has(input:not(:checked)) .mp-nav-copy { color: ${NAV.muted}; }
/* Preserve native siblings while visually joining them into one control bar. */
${NAVIGATION_HEADER} .mp-nav-control { background: ${NAV.surface}; border-color: ${NAV.border}; }
${NAVIGATION_HEADER} label.mp-nav-control { border-radius: ${UI.radius.nav} 0 0 ${UI.radius.nav}; border-right: 0; padding-right: 14px; }
${NAVIGATION_HEADER} a.mp-nav-control { margin-left: calc(-1 * var(--mp-nav-gap, 8px)); border-radius: 0 ${UI.radius.nav} ${UI.radius.nav} 0; border-left: 0; gap: 7px; padding-left: 14px; }
${NAVIGATION_HEADER} a.mp-nav-control::before { content: ''; position: absolute; left: 0; top: 10px; bottom: 10px; width: 1px; background: ${NAV.divider}; }
${NAVIGATION_HEADER} .mp-nav-control:hover { background: ${NAV.surfaceHover}; }
${NAVIGATION_HEADER} .mp-nav-error { flex:1 0 100%;order:1;min-width:0;max-width:100%;margin:4px 0 0; }
@media (max-width: 420px) { ${NAVIGATION_HEADER} .mp-nav-control { padding-left: 9px; padding-right: 9px; gap: 6px; } }
@media (forced-colors: active) { ${NAVIGATION_HEADER} .mp-nav-control { border: 1px solid ButtonText; } ${NAVIGATION_HEADER} .mp-nav-control input { appearance: auto; } .mp-nav-control input::before { content: none; } }
`;

export function createKoreaIcon(): SVGSVGElement {
  const ns = 'http://www.w3.org/2000/svg';
  const icon = document.createElementNS(ns, 'svg');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('aria-hidden', 'true');
  icon.setAttribute('focusable', 'false');
  icon.classList.add('mp-nav-icon');
  const rim = document.createElementNS(ns, 'circle');
  rim.setAttribute('cx', '12'); rim.setAttribute('cy', '12'); rim.setAttribute('r', '12'); rim.setAttribute('fill', '#f5f3eb');
  const blue = document.createElementNS(ns, 'circle');
  blue.setAttribute('cx', '12'); blue.setAttribute('cy', '12'); blue.setAttribute('r', '8'); blue.setAttribute('fill', '#477b9d');
  const red = document.createElementNS(ns, 'path');
  red.setAttribute('d', 'M4 12a8 8 0 0 1 16 0 4 4 0 0 1-8 0 4 4 0 0 0-8 0');
  red.setAttribute('fill', '#cf655c');
  icon.append(rim, blue, red);
  return icon;
}
