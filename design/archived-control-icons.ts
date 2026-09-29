// Archived artwork for historical design proposals; not used by the extension.
/** Original MP Korea control artwork. Approved 16px / 1.75 stroke icon family. */
export type ControlIcon = 'original' | 'retry' | 'external' | 'expand' | 'collapse' | 'prepare';
const PATHS: Record<ControlIcon, readonly string[]> = {
  original: ['M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z'],
  retry: ['M20 11a8 8 0 1 0-2 6M20 4v7h-7'],
  external: ['M14 3h7v7M10 14 21 3M10 3H3v18h18v-7'],
  expand: ['m6 9 6 6 6-6'],
  collapse: ['m6 15 6-6 6 6'],
  prepare: ['M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5'],
};
const SVG_NS = 'http://www.w3.org/2000/svg';

export function createControlIcon(name: ControlIcon, ownerDocument = document): SVGSVGElement {
  const icon = ownerDocument.createElementNS(SVG_NS, 'svg');
  for (const [key, value] of Object.entries({
    width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    'stroke-width': '1.75', 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
    'aria-hidden': 'true', focusable: 'false', 'data-mpkr-icon': name,
  })) icon.setAttribute(key, value);
  icon.style.cssText = 'display:inline-block;width:16px;height:16px;flex:none;vertical-align:-.2em;pointer-events:none;';
  for (const d of PATHS[name]) {
    const path = ownerDocument.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', d);
    icon.append(path);
  }
  if (name === 'original') {
    const circle = ownerDocument.createElementNS(SVG_NS, 'circle');
    circle.setAttribute('cx', '12'); circle.setAttribute('cy', '12'); circle.setAttribute('r', '3');
    icon.append(circle);
  }
  return icon;
}

/** Keeps the text node separate so ON/OFF and retry updates retain the SVG. */
export function setIconLabel(control: HTMLElement, name: ControlIcon, text: string): void {
  let label = control.querySelector<HTMLElement>(':scope > [data-mpkr-icon-label]');
  const current = control.querySelector<SVGSVGElement>(':scope > [data-mpkr-icon]');
  if (!label || current?.getAttribute('data-mpkr-icon') !== name) {
    const icon = createControlIcon(name, control.ownerDocument);
    icon.style.marginInlineEnd = '6px';
    label = control.ownerDocument.createElement('span');
    label.dataset.mpkrIconLabel = '';
    control.replaceChildren(icon, label);
  }
  if (label.textContent !== text) label.textContent = text;
}

/** Only used on links created by the extension, preserving the visible label. */
export function appendExternalIcon(link: HTMLAnchorElement): void {
  if (link.querySelector(':scope > [data-mpkr-icon="external"]')) return;
  const icon = createControlIcon('external', link.ownerDocument);
  icon.style.marginInlineStart = '6px';
  link.append(icon);
}
