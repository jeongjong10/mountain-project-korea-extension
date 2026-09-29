import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SouthKoreaGateway } from '@/ui/south-korea-gateway';
import { UI } from '@/ui/design-tokens';

const SOUTH_KOREA_URL = 'https://www.mountainproject.com/area/106225629/south-korea';

function setPage(): void {
  document.body.innerHTML = `
    <div id="column">
      <div id="unrelated-before" class="text-center pb-2 border-light">Unrelated promotion</div>
      <div id="guidebook" class="text-center pb-2 border-light" style="color: rgb(1, 2, 3)">
        <h1 class="original-title responsive-title">Beyond the Guidebook</h1>
        <h3 class="original-copy responsive-copy">Routes shared by climbers</h3>
      </div>
      <form id="routeFinderForm"></form>
      <div id="unrelated-after" class="text-center pb-2 border-light">Unrelated footer</div>
    </div>
  `;
}

describe('SouthKoreaGateway', () => {
  beforeEach(() => {
    document.head.querySelectorAll('[data-mpkr-south-korea-gateway-style]').forEach((node) => node.remove());
    setPage();
  });

  it('uses only the Beyond the Guidebook element itself as the gateway host', () => {
    const guidebook = document.querySelector<HTMLElement>('#guidebook')!;
    const originalHeading = guidebook.querySelector('h1');
    const form = document.querySelector('#routeFinderForm');
    const gateway = new SouthKoreaGateway(vi.fn());

    gateway.mount();
    gateway.mount();

    const host = document.querySelector<HTMLElement>('[data-mpkr-south-korea-gateway="true"]');
    const link = Array.from(host?.children ?? [])
      .find((element): element is HTMLAnchorElement => (
        element instanceof HTMLAnchorElement
        && element.classList.contains('mpkr-south-korea-gateway__link')
      ));
    expect(host).toBe(guidebook);
    expect(host?.getAttribute('class')).toBe('text-center pb-2 border-light');
    expect(host?.getAttribute('style')).toBe('color: rgb(1, 2, 3)');
    expect(host?.hasAttribute('hidden')).toBe(false);
    expect(host?.previousElementSibling?.id).toBe('unrelated-before');
    expect(host?.nextElementSibling).toBe(form);
    expect(host?.querySelector('h1')).toBe(originalHeading);
    expect(document.querySelectorAll('[data-mpkr-south-korea-gateway="true"]')).toHaveLength(1);
    expect(document.querySelectorAll('.mpkr-south-korea-gateway__link')).toHaveLength(1);
    expect(document.querySelector('aside.mpkr-south-korea-gateway')).toBeNull();
    expect(link?.href).toBe(SOUTH_KOREA_URL);
    expect(link?.getAttribute('aria-label')).toBe('대한민국 클라이밍 지역 보기');
    expect(link?.querySelector('.mpkr-south-korea-gateway__title')?.textContent).toBe('대한민국 클라이밍');
    expect(link?.querySelector('.mpkr-south-korea-gateway__copy')?.textContent)
      .toBe('South Korea의 지역과 루트를 한국어로 살펴보세요.');
    expect(link?.querySelector('.mpkr-south-korea-gateway__action')?.textContent).toBe('지역 보기');
    expect(link?.querySelector('.mpkr-south-korea-gateway__action')?.getAttribute('aria-hidden')).toBe('true');
    expect(link?.querySelector('.mpkr-south-korea-gateway__arrow-rail')).not.toBeNull();
    expect(link?.querySelector('.mpkr-south-korea-gateway__arrow')).not.toBeNull();
    expect(link?.querySelector('.mpkr-south-korea-gateway__overlay')?.getAttribute('aria-hidden')).toBe('true');
    expect(link?.textContent).not.toContain('\u2192');
    expect(link?.textContent).not.toContain('->');
  });

  it('leaves other generic matching elements untouched', () => {
    const before = document.querySelector<HTMLElement>('#unrelated-before')!;
    const after = document.querySelector<HTMLElement>('#unrelated-after')!;
    const beforeHtml = before.outerHTML;
    const afterHtml = after.outerHTML;

    new SouthKoreaGateway(vi.fn()).mount();

    expect(before.outerHTML).toBe(beforeHtml);
    expect(after.outerHTML).toBe(afterHtml);
  });

  it('keeps original children in place so they retain the responsive footprint', () => {
    const guidebook = document.querySelector<HTMLElement>('#guidebook')!;
    const originalChildren = Array.from(guidebook.childNodes);
    const gateway = new SouthKoreaGateway(vi.fn());

    gateway.mount();

    expect(Array.from(guidebook.childNodes).slice(0, originalChildren.length)).toEqual(originalChildren);
    expect(guidebook.lastElementChild?.classList.contains('mpkr-south-korea-gateway__link')).toBe(true);
    const styles = document.querySelector<HTMLStyleElement>('[data-mpkr-south-korea-gateway-style]')?.textContent ?? '';
    expect(styles).toContain('position: relative');
    expect(styles).toContain('position: absolute');
    expect(styles).toContain('inset: 0');
    expect(styles).toContain('visibility: hidden !important');
    expect(styles).not.toContain('min-height: 68px');
    expect(styles).not.toMatch(/\bheight:\s*68px/);
    expect(styles).not.toMatch(/\bmargin:\s*0 0 0\.5rem/);
    expect(styles).not.toContain('display: none !important');
  });

  it('shows the title and restored subtitle with the original typography hooks by default', () => {
    new SouthKoreaGateway(vi.fn()).mount();
    const title = document.querySelector<HTMLElement>('.mpkr-south-korea-gateway__title')!;
    const subtitle = document.querySelector<HTMLElement>('.mpkr-south-korea-gateway__copy')!;
    const styles = document.querySelector<HTMLStyleElement>('[data-mpkr-south-korea-gateway-style]')?.textContent ?? '';
    const titleRule = styles.match(/\.mpkr-south-korea-gateway__title\s*\{([^}]*)\}/)?.[1] ?? '';
    const subtitleRule = styles.match(/\.mpkr-south-korea-gateway__copy\s*\{([^}]*)\}/)?.[1] ?? '';

    expect(title.tagName).toBe('H1');
    expect(title.classList).toContain('original-title');
    expect(title.classList).toContain('responsive-title');
    expect(title.textContent).toBe('대한민국 클라이밍');
    expect(subtitle.tagName).toBe('H3');
    expect(subtitle.classList).toContain('original-copy');
    expect(subtitle.classList).toContain('responsive-copy');
    expect(subtitle.textContent).toBe('South Korea의 지역과 루트를 한국어로 살펴보세요.');
    expect(titleRule).not.toMatch(/font-(?:family|size|weight)|line-height/);
    expect(subtitleRule).not.toMatch(/font-(?:family|size|weight)|line-height/);
    expect(styles).not.toMatch(/\.mpkr-south-korea-gateway__(?:title|copy|content)\s*\{[^}]*(?:font-size|font-weight|line-height)/s);
  });

  it('navigates from the full-host overlay and supports Space', () => {
    const navigate = vi.fn();
    const gateway = new SouthKoreaGateway(navigate);
    gateway.mount();
    const link = document.querySelector<HTMLAnchorElement>('.mpkr-south-korea-gateway__link')!;

    link.click();
    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    link.dispatchEvent(space);

    expect(space.defaultPrevented).toBe(true);
    expect(navigate).toHaveBeenCalledTimes(2);
    expect(navigate).toHaveBeenNthCalledWith(1, SOUTH_KOREA_URL);
    expect(navigate).toHaveBeenNthCalledWith(2, SOUTH_KOREA_URL);
  });

  it('retains native anchor behavior for Enter and modified clicks', () => {
    const navigate = vi.fn();
    const gateway = new SouthKoreaGateway(navigate);
    gateway.mount();
    const link = document.querySelector<HTMLAnchorElement>('.mpkr-south-korea-gateway__link')!;
    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    const modified = new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true });

    link.dispatchEvent(enter);
    link.dispatchEvent(modified);

    expect(enter.defaultPrevented).toBe(false);
    expect(modified.defaultPrevented).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
    expect(link.href).toBe(SOUTH_KOREA_URL);
  });

  it('keeps title and subtitle visible by default and shows only the full overlay on hover or focus', () => {
    new SouthKoreaGateway(vi.fn()).mount();
    const styles = document.querySelector<HTMLStyleElement>('[data-mpkr-south-korea-gateway-style]')?.textContent ?? '';
    const actionRule = styles.match(/\.mpkr-south-korea-gateway__action\s*\{([^}]*)\}/)?.[1] ?? '';
    const overlayRule = styles.match(/\.mpkr-south-korea-gateway__overlay\s*\{([^}]*)\}/)?.[1] ?? '';
    const railRule = styles.match(/\.mpkr-south-korea-gateway__arrow-rail\s*\{([^}]*)\}/)?.[1] ?? '';
    const contentRule = styles.match(/^\.mpkr-south-korea-gateway__content\s*\{([^}]*)\}/m)?.[1] ?? '';
    const hostRule = styles.match(/\[data-mpkr-south-korea-gateway="true"\]\s*\{([^}]*)\}/)?.[1] ?? '';
    const focusWithinRule = styles.match(/\[data-mpkr-south-korea-gateway="true"\]:focus-within\s*\{([^}]*)\}/)?.[1] ?? '';
    const hoverRule = styles.match(/\[data-mpkr-south-korea-gateway="true"\]:hover\s*\{([^}]*)\}/)?.[1] ?? '';

    expect(styles).toContain(`--mpkr-gateway-surface: ${UI.color.surfaceSubtle}`);
    expect(styles).toContain('--mpkr-gateway-dark: #27313b');
    expect(styles).toContain('background: var(--mpkr-gateway-surface)');
    expect(styles).toContain(`outline: 1px solid ${UI.color.link}`);
    expect(hostRule).toContain('cursor: pointer');
    expect(styles).toContain('@media (hover: hover) and (pointer: fine)');
    expect(styles).toContain('[data-mpkr-south-korea-gateway="true"]:hover {');
    expect(styles).toContain('[data-mpkr-south-korea-gateway="true"]:focus-within');
    expect(hoverRule).toContain('outline-color: rgba(255, 255, 255, 0.28)');
    expect(hoverRule).not.toContain('outline-width');
    expect(hoverRule).not.toContain('#00327d');
    expect(focusWithinRule).not.toContain('outline');
    expect(styles).toContain('.mpkr-south-korea-gateway__link:focus-visible');
    expect(styles).toContain(`outline: 3px solid ${UI.color.link}`);
    expect(actionRule).toContain('position: absolute');
    expect(actionRule).toContain('inset: 0');
    expect(actionRule).toContain('display: flex');
    expect(actionRule).toContain('justify-content: center');
    expect(actionRule).toContain('font-size: 2rem');
    expect(actionRule).toContain('line-height: 1.2');
    expect(actionRule).toContain('opacity: 0');
    expect(actionRule).toContain('visibility: hidden');
    expect(actionRule).toContain('pointer-events: none');
    expect(styles).toContain('--mpkr-gateway-overlay: rgba(0, 0, 0, 0.80)');
    expect(overlayRule).toContain('background: var(--mpkr-gateway-overlay)');
    expect(overlayRule).toContain('pointer-events: none');
    expect(overlayRule).toContain('z-index: 2');
    expect(contentRule).toContain('position: relative');
    expect(contentRule).toContain('z-index: 0');
    expect(actionRule).toContain('z-index: 3');
    expect(railRule).toContain('border-left: 1px solid');
    expect(railRule).toContain('pointer-events: none');
    expect(railRule).toContain('width: var(--mpkr-gateway-arrow-rail-width)');
    expect(railRule).toContain('z-index: 4');
    expect(styles).toContain(`border-right: 2px solid ${UI.color.link}`);
    expect(styles).toContain(`border-top: 2px solid ${UI.color.link}`);
    expect(contentRule).not.toContain('opacity: 0');
    expect(contentRule).not.toContain('visibility: hidden');
    expect(styles).toContain('[data-mpkr-south-korea-gateway="true"]:focus-within .mpkr-south-korea-gateway__title');
    expect(styles).toContain('[data-mpkr-south-korea-gateway="true"]:focus-within .mpkr-south-korea-gateway__copy');
    expect(styles).toContain('[data-mpkr-south-korea-gateway="true"]:hover .mpkr-south-korea-gateway__title');
    expect(styles).toContain('[data-mpkr-south-korea-gateway="true"]:hover .mpkr-south-korea-gateway__copy');
    expect(styles).toContain('color: var(--mpkr-gateway-hover-foreground)');
    expect(styles).toContain('[data-mpkr-south-korea-gateway="true"]:focus-within .mpkr-south-korea-gateway__action');
    expect(styles).toContain('[data-mpkr-south-korea-gateway="true"]:focus-within .mpkr-south-korea-gateway__overlay');
    expect(styles).toContain('[data-mpkr-south-korea-gateway="true"]:hover .mpkr-south-korea-gateway__action');
    expect(styles).toContain('[data-mpkr-south-korea-gateway="true"]:hover .mpkr-south-korea-gateway__overlay');
    expect(styles).not.toContain('[data-mpkr-south-korea-gateway="true"]:focus-within .mpkr-south-korea-gateway__content');
    expect(styles).not.toContain('[data-mpkr-south-korea-gateway="true"]:hover .mpkr-south-korea-gateway__content');
    expect(styles).toContain('opacity: 1');
    expect(styles).toContain('[data-mpkr-south-korea-gateway="true"]:active .mpkr-south-korea-gateway__action');
    expect(styles).toContain('background: var(--mpkr-gateway-dark)');
    expect(styles).toContain('color: var(--mpkr-gateway-hover-foreground)');
    expect(styles).toContain('@media (max-width: 480px)');
    expect(styles).toContain('font-size: 1.5rem');
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(hostRule).not.toContain('border: 1px solid');
    expect(styles).not.toMatch(/font-size:\s*[^;]*(?:vw|vh|vmin|vmax)/);
  });

  it('restores exact host markup, child identities, and original event behavior', () => {
    const guidebook = document.querySelector<HTMLElement>('#guidebook')!;
    const heading = guidebook.querySelector('h1')!;
    const originalHtml = guidebook.outerHTML;
    const originalChildren = Array.from(guidebook.childNodes);
    const originalClick = vi.fn();
    heading.addEventListener('click', originalClick);
    const navigate = vi.fn();
    const gateway = new SouthKoreaGateway(navigate);
    gateway.mount();
    const detachedLink = guidebook.querySelector<HTMLAnchorElement>('.mpkr-south-korea-gateway__link')!;

    gateway.destroy();

    expect(guidebook.outerHTML).toBe(originalHtml);
    expect(Array.from(guidebook.childNodes)).toEqual(originalChildren);
    heading.click();
    expect(originalClick).toHaveBeenCalledOnce();
    detachedLink.click();
    expect(navigate).not.toHaveBeenCalled();
    expect(document.querySelector('[data-mpkr-south-korea-gateway-style]')).toBeNull();
  });

  it('restores a pre-existing gateway attribute exactly', () => {
    const guidebook = document.querySelector<HTMLElement>('#guidebook')!;
    guidebook.setAttribute('data-mpkr-south-korea-gateway', 'existing');
    const gateway = new SouthKoreaGateway(vi.fn());

    gateway.mount();
    gateway.destroy();

    expect(guidebook.getAttribute('data-mpkr-south-korea-gateway')).toBe('existing');
  });

  it('does not mount against a generic block without the homepage heading', () => {
    document.body.innerHTML = '<div class="text-center pb-2 border-light">Other content</div>';

    new SouthKoreaGateway(vi.fn()).mount();

    expect(document.querySelector('[data-mpkr-south-korea-gateway="true"]')).toBeNull();
    expect(document.querySelector('.mpkr-south-korea-gateway__link')).toBeNull();
  });

  it('recovers idempotently when only the injected link is removed', () => {
    const gateway = new SouthKoreaGateway(vi.fn());
    const guidebook = document.querySelector<HTMLElement>('#guidebook')!;
    gateway.mount();
    guidebook.querySelector('.mpkr-south-korea-gateway__link')?.remove();
    guidebook.querySelector('h1')!.textContent = '가이드북 그 이상';

    gateway.mount();
    gateway.mount();

    expect(document.querySelector('[data-mpkr-south-korea-gateway="true"]')).toBe(guidebook);
    expect(document.querySelectorAll('.mpkr-south-korea-gateway__link')).toHaveLength(1);
    expect(document.querySelectorAll('.mpkr-south-korea-gateway__action')).toHaveLength(1);
  });
});
