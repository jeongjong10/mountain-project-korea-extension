import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SouthKoreaGateway } from './south-korea-gateway';

const SOUTH_KOREA_URL = 'https://www.mountainproject.com/area/106225629/south-korea';

function setPage(): void {
  document.body.innerHTML = `
    <div id="column">
      <div id="unrelated-before" class="text-center pb-2 border-light">Unrelated promotion</div>
      <div id="guidebook" class="text-center pb-2 border-light" style="color: rgb(1, 2, 3)">
        <h1>Beyond the Guidebook</h1><h3>Routes shared by climbers</h3>
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

  it('replaces only the heading-owning homepage block in its exact sibling position', () => {
    const guidebook = document.querySelector('#guidebook');
    const form = document.querySelector('#routeFinderForm');
    const unrelatedBefore = document.querySelector<HTMLElement>('#unrelated-before');
    const unrelatedAfter = document.querySelector<HTMLElement>('#unrelated-after');
    const gateway = new SouthKoreaGateway(vi.fn());

    gateway.mount();
    gateway.mount();

    const aside = document.querySelector<HTMLElement>('[data-mpkr-south-korea-gateway="true"]');
    const link = aside?.querySelector<HTMLAnchorElement>('a');
    expect(document.querySelector('#guidebook')).toBe(guidebook);
    expect(document.querySelector('#routeFinderForm')).toBe(form);
    expect(guidebook?.hasAttribute('hidden')).toBe(true);
    expect(guidebook?.getAttribute('data-mpkr-south-korea-gateway-source')).toBe('true');
    expect(guidebook?.getAttribute('class')).toBe('text-center pb-2 border-light');
    expect(guidebook?.getAttribute('style')).toBe('color: rgb(1, 2, 3)');
    expect(unrelatedBefore?.hasAttribute('hidden')).toBe(false);
    expect(unrelatedAfter?.hasAttribute('hidden')).toBe(false);
    expect(aside?.parentElement?.id).toBe('column');
    expect(aside?.nextElementSibling).toBe(guidebook);
    expect(guidebook?.nextElementSibling).toBe(form);
    expect(document.querySelectorAll('[data-mpkr-south-korea-gateway="true"]')).toHaveLength(1);
    expect(aside?.hasAttribute('role')).toBe(false);
    expect(aside?.children).toHaveLength(1);
    expect(aside?.querySelector('.mpkr-south-korea-gateway__eyebrow')).toBeNull();
    expect(aside?.querySelector('.mpkr-south-korea-gateway__heading')).toBeNull();
    expect(aside?.querySelector('.mpkr-south-korea-gateway__title')?.textContent)
      .toBe('대한민국 클라이밍');
    expect(aside?.textContent).toContain('South Korea');
    expect(link?.href).toBe(SOUTH_KOREA_URL);
    expect(link?.tabIndex).toBe(0);
    expect(link?.hasAttribute('aria-hidden')).toBe(false);
    expect(link?.querySelector('.mpkr-south-korea-gateway__action')?.textContent)
      .toBe('지역 보기');
    expect(link?.querySelector('.mpkr-south-korea-gateway__icon')).toBeNull();
  });

  it('navigates when the full-row link is clicked', () => {
    const navigate = vi.fn();
    const gateway = new SouthKoreaGateway(navigate);
    gateway.mount();

    document.querySelector<HTMLAnchorElement>('[data-mpkr-south-korea-gateway] a')?.click();

    expect(navigate).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith(SOUTH_KOREA_URL);
  });

  it.each([' ', 'Spacebar'])('navigates once for the %j key', (key) => {
    const navigate = vi.fn();
    const gateway = new SouthKoreaGateway(navigate);
    gateway.mount();
    const link = document.querySelector<HTMLAnchorElement>('[data-mpkr-south-korea-gateway] a')!;
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });

    link.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(navigate).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith(SOUTH_KOREA_URL);
  });

  it('keeps native anchor semantics for Enter without a competing keydown handler', () => {
    const navigate = vi.fn();
    const gateway = new SouthKoreaGateway(navigate);
    gateway.mount();
    const link = document.querySelector<HTMLAnchorElement>('[data-mpkr-south-korea-gateway] a')!;
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });

    link.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
    expect(link.href).toBe(SOUTH_KOREA_URL);
  });

  it('handles the inner anchor exactly once without bubbling a second navigation', () => {
    const navigate = vi.fn();
    const gateway = new SouthKoreaGateway(navigate);
    gateway.mount();
    const link = document.querySelector<HTMLAnchorElement>('[data-mpkr-south-korea-gateway] a')!;

    link.click();

    expect(navigate).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith(SOUTH_KOREA_URL);
  });

  it('provides a restrained visual hierarchy and conventional interaction states', () => {
    const gateway = new SouthKoreaGateway(vi.fn());
    gateway.mount();
    const styles = document.querySelector<HTMLStyleElement>('[data-mpkr-south-korea-gateway-style]')?.textContent;

    expect(styles).toContain('--mpkr-gateway-surface: #fff');
    expect(styles).toContain('--mpkr-gateway-foreground: #111');
    expect(styles).toContain('--mpkr-gateway-copy: #343a40');
    expect(styles).toContain('--mpkr-gateway-action: #0645ad');
    expect(styles).toContain('background: var(--mpkr-gateway-surface)');
    expect(styles).toContain('--mpkr-gateway-border: #0645ad');
    expect(styles).toContain('border: 1px solid var(--mpkr-gateway-border)');
    expect(styles).toContain('color: var(--mpkr-gateway-foreground)');
    expect(styles).toContain('font-size: inherit');
    expect(styles).toContain('min-height: 68px');
    expect(styles).toContain('padding: 14px 12px');
    expect(styles).toContain('width: 100%');
    expect(styles).toContain('[data-mpkr-south-korea-gateway-source="true"][hidden]');
    expect(styles).toContain('display: none !important');
    expect(styles).toContain('color: var(--mpkr-gateway-action)');
    expect(styles).toContain('color: #00327d');
    expect(styles).toContain('.mpkr-south-korea-gateway:hover');
    expect(styles).toContain('.mpkr-south-korea-gateway:focus-within');
    expect(styles).toContain('.mpkr-south-korea-gateway__link:focus-visible');
    expect(styles).toContain('outline: 2px solid #039');
    expect(styles).toContain('outline-offset: 2px');
    expect(styles).not.toContain('border-left:');
    expect(styles).not.toContain('border-radius:');
    expect(styles).not.toContain('box-shadow:');
    expect(styles).not.toContain('linear-gradient');
    expect(styles).not.toContain('#efc14e');
    expect(styles).not.toContain('#fffaf0');
    expect(document.querySelector('.mpkr-south-korea-gateway__copy')?.classList)
      .not.toContain('text-muted');
  });

  it('keeps dimensions responsive, wraps text, and respects reduced motion', () => {
    const gateway = new SouthKoreaGateway(vi.fn());
    gateway.mount();
    const styles = document.querySelector<HTMLStyleElement>('[data-mpkr-south-korea-gateway-style]')?.textContent;

    expect(styles).toContain('box-sizing: border-box');
    expect(styles).toContain('max-width: 100%');
    expect(styles).toContain('overflow-wrap: anywhere');
    expect(styles).toContain('@media (max-width: 576px)');
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(styles).toContain('transition: none');
    expect(styles).not.toMatch(/font-size:\s*[^;]*(?:vw|vh|vmin|vmax)/);
  });

  it('removes all injected UI and styles on destroy and can mount again', () => {
    const navigate = vi.fn();
    const gateway = new SouthKoreaGateway(navigate);
    gateway.mount();
    const detachedAside = document.querySelector<HTMLElement>('[data-mpkr-south-korea-gateway]')!;
    const guidebook = document.querySelector<HTMLElement>('#guidebook')!;
    const originalParent = guidebook.parentElement;
    const originalNextSibling = guidebook.nextElementSibling;

    gateway.destroy();

    expect(document.querySelector('[data-mpkr-south-korea-gateway]')).toBeNull();
    expect(document.querySelector('[data-mpkr-south-korea-gateway-style]')).toBeNull();
    expect(guidebook.parentElement).toBe(originalParent);
    expect(guidebook.nextElementSibling).toBe(originalNextSibling);
    expect(guidebook.hasAttribute('hidden')).toBe(false);
    expect(guidebook.hasAttribute('data-mpkr-south-korea-gateway-source')).toBe(false);
    expect(guidebook.getAttribute('class')).toBe('text-center pb-2 border-light');
    expect(guidebook.getAttribute('style')).toBe('color: rgb(1, 2, 3)');
    detachedAside.click();
    expect(navigate).not.toHaveBeenCalled();

    gateway.mount();
    expect(document.querySelectorAll('[data-mpkr-south-korea-gateway]')).toHaveLength(1);
  });

  it('preserves pre-existing hidden and marker attributes exactly on destroy', () => {
    const guidebook = document.querySelector<HTMLElement>('#guidebook')!;
    guidebook.setAttribute('hidden', 'until-found');
    guidebook.setAttribute('data-mpkr-south-korea-gateway-source', 'existing');
    const gateway = new SouthKoreaGateway(vi.fn());

    gateway.mount();
    gateway.destroy();

    expect(guidebook.getAttribute('hidden')).toBe('until-found');
    expect(guidebook.getAttribute('data-mpkr-south-korea-gateway-source')).toBe('existing');
  });

  it('does not mount against a generic matching block without the homepage heading', () => {
    document.body.innerHTML = '<div class="text-center pb-2 border-light">Other content</div>';
    const gateway = new SouthKoreaGateway(vi.fn());

    gateway.mount();

    expect(document.querySelector('[data-mpkr-south-korea-gateway]')).toBeNull();
    expect(document.querySelector('.text-center.pb-2.border-light')?.hasAttribute('hidden')).toBe(false);
  });

  it('recovers from a detached gateway without repeatedly moving or hiding the source block', () => {
    const gateway = new SouthKoreaGateway(vi.fn());
    const guidebook = document.querySelector<HTMLElement>('#guidebook')!;
    gateway.mount();
    document.querySelector('[data-mpkr-south-korea-gateway]')?.remove();
    guidebook.querySelector('h1')!.textContent = '가이드북 그 이상';

    gateway.mount();
    gateway.mount();

    expect(document.querySelectorAll('[data-mpkr-south-korea-gateway]')).toHaveLength(1);
    expect(document.querySelector('[data-mpkr-south-korea-gateway]')?.nextElementSibling).toBe(guidebook);
    expect(guidebook.getAttribute('data-mpkr-south-korea-gateway-source')).toBe('true');
  });
});
