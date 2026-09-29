import { LeftSidebarToggle } from '@/ui/left-sidebar-toggle';
import { UI } from '@/ui/design-tokens';

type PointerMode = 'fine' | 'coarse';

function setPointerMode(mode: PointerMode): void {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: mode === 'fine' ? 1280 : 390,
  });
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn((query: string) => ({
      matches: query.includes('max-width')
        ? mode === 'coarse'
        : query.includes('hover: hover')
          ? mode === 'fine'
          : query.includes('hover: none') || query.includes('pointer: coarse')
            ? mode === 'coarse'
            : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

function setReducedMotion(enabled: boolean): void {
  const base = window.matchMedia.bind(window);
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn((query: string) => (
      query.includes('prefers-reduced-motion')
        ? {
            matches: enabled,
            media: query,
            onchange: null,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            addListener: vi.fn(),
            removeListener: vi.fn(),
            dispatchEvent: vi.fn(),
          }
        : base(query)
    )),
  });
}

function setAreaFixture(): void {
  document.head.innerHTML = '';
  document.body.innerHTML = `
    <div class="main-content-container"><div id="climb-area-page">
      <div class="row pt-main-content" id="area-layout">
        <div class="col-md-9 float-md-right mb-1" id="area-heading">Heading</div>
        <aside class="col-md-3 left-nav float-md-left mb-2" style="color: red">
          <div class="mp-sidebar" id="original-menu">
            <h3>Areas</h3>
            <a href="/area/1/first">First area</a>
            <a href="/route/3/route">Route</a>
          </div>
        </aside>
        <main class="col-md-9 main-content float-md-right" style="min-width: 0">
          <button id="outside">Main action</button>
        </main>
      </div>
    </div></div>
  `;
}

function mockLayoutRect(layout: HTMLElement, getLeft: () => number): void {
  vi.spyOn(layout, 'getBoundingClientRect').mockImplementation(() => {
    const left = getLeft();
    return {
      bottom: 800,
      height: 800,
      left,
      right: left + 900,
      top: 0,
      width: 900,
      x: left,
      y: 0,
      toJSON: () => ({}),
    };
  });
}

function enter(element: Element): void {
  element.dispatchEvent(new MouseEvent('mouseenter'));
}

function leave(element: Element): void {
  element.dispatchEvent(new MouseEvent('mouseleave'));
}

describe('LeftSidebarToggle edge rail', () => {
  let toggles: LeftSidebarToggle[];

  const createToggle = (): LeftSidebarToggle => {
    const toggle = new LeftSidebarToggle();
    toggles.push(toggle);
    return toggle;
  };

  beforeEach(() => {
    vi.useFakeTimers();
    toggles = [];
    setPointerMode('fine');
  });

  afterEach(() => {
    for (const toggle of toggles) toggle.destroy();
    vi.clearAllTimers();
    vi.useRealTimers();
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    document.body.removeAttribute('style');
  });

  it('starts closed with an edge button and injects nothing into main content', () => {
    setAreaFixture();
    const main = document.querySelector<HTMLElement>('.main-content')!;
    const originalMain = main.innerHTML;
    const toggle = createToggle();

    expect(toggle.mount()).toBe(1);
    const rail = document.querySelector<HTMLButtonElement>('.mpkr-left-sidebar-rail')!;
    const panel = document.querySelector<HTMLElement>('.mpkr-left-sidebar-panel')!;

    expect(rail.tagName).toBe('BUTTON');
    expect(rail.getAttribute('aria-expanded')).toBe('false');
    expect(rail.getAttribute('aria-controls')).toBe(panel.id);
    expect(rail.getAttribute('aria-label')).toBe('다른 지역 목록 열기');
    expect(rail.querySelector('.mpkr-left-sidebar-rail__label')?.textContent).toBe('다른 지역');
    expect(rail.querySelector('.mpkr-left-sidebar-rail__label')?.getAttribute('aria-hidden'))
      .toBe('true');
    expect(rail.querySelector('.mpkr-left-sidebar-rail__chevron')?.getAttribute('aria-hidden'))
      .toBe('true');
    expect(panel.hidden).toBe(true);
    expect(main.innerHTML).toBe(originalMain);
    expect(document.querySelector('.mpkr-left-sidebar-trigger')).toBeNull();
    expect(document.querySelector('.mpkr-left-sidebar-trigger-slot')).toBeNull();
    expect(panel.querySelector('.left-nav .mp-sidebar')).toBe(
      document.querySelector('#original-menu'),
    );
  });

  it.each([
    ['#climb-area-page', '다른 지역', '다른 지역 목록 열기'],
    ['#route-page', '다른 루트', '다른 루트 목록 열기'],
    ['#generic-page', '메뉴', '메뉴 열기'],
  ])('uses the page-specific visible and accessible labels for %s', (
    pageSelector,
    visibleLabel,
    accessibleLabel,
  ) => {
    document.body.innerHTML = `
      <div id="${pageSelector.slice(1)}">
        <div class="row">
          <aside class="left-nav"><div class="mp-sidebar">Original menu</div></aside>
          <main class="main-content">Content</main>
        </div>
      </div>
    `;
    const toggle = createToggle();
    toggle.mount();
    const rail = document.querySelector<HTMLButtonElement>('.mpkr-left-sidebar-rail')!;
    const title = document.querySelector<HTMLElement>('.mpkr-left-sidebar-panel__title')!;

    expect(rail.querySelector('.mpkr-left-sidebar-rail__label')?.textContent)
      .toBe(visibleLabel);
    expect(rail.getAttribute('aria-label')).toBe(accessibleLabel);
    expect(title.textContent).toBe(visibleLabel);
    expect(rail.textContent).not.toContain('탐색');
  });

  it('uses the route URL for labels when the route-page wrapper is absent', () => {
    const originalUrl = window.location.href;
    window.location.href = 'https://www.mountainproject.com/route/105798994/high-exposure';
    document.body.innerHTML = `
      <div class="main-content-container">
        <div class="row">
          <aside class="left-nav"><div class="mp-sidebar">Original menu</div></aside>
          <main class="main-content">Content</main>
        </div>
      </div>
    `;
    const toggle = createToggle();

    try {
      expect(toggle.mount()).toBe(1);
      const rail = document.querySelector<HTMLButtonElement>('.mpkr-left-sidebar-rail')!;
      const panel = document.querySelector<HTMLElement>('.mpkr-left-sidebar-panel')!;

      expect(rail.querySelector('.mpkr-left-sidebar-rail__label')?.textContent)
        .toBe('다른 루트');
      expect(rail.getAttribute('aria-label')).toBe('다른 루트 목록 열기');
      expect(panel.querySelector('.mpkr-left-sidebar-panel__title')?.textContent)
        .toBe('다른 루트');

      rail.click();
      expect(panel.hidden).toBe(false);
      expect(rail.getAttribute('aria-label')).toBe('다른 루트 목록 닫기');
    } finally {
      toggle.destroy();
      window.location.href = originalUrl;
    }
  });

  it('uses the main row edge and places the rail outside it with an 8px gap', () => {
    setAreaFixture();
    const layout = document.querySelector<HTMLElement>('#area-layout')!;
    mockLayoutRect(layout, () => 220);
    const toggle = createToggle();

    toggle.mount();
    const rail = document.querySelector<HTMLElement>('.mpkr-left-sidebar-rail')!;
    expect(rail.parentElement).toBe(layout);
    expect(rail.style.getPropertyValue('--mpkr-sidebar-rail-left')).toBe('-48px');
    expect(layout.classList.contains('mpkr-left-sidebar-rail-host')).toBe(true);
    expect(layout.classList.contains('mpkr-left-sidebar-layout--rail-gutter')).toBe(false);
    expect(layout.style.getPropertyValue('--mpkr-sidebar-rail-gutter')).toBe('');
  });

  it('hands control to the drawer without moving the rail across the viewport', () => {
    setAreaFixture();
    const layout = document.querySelector<HTMLElement>('#area-layout')!;
    mockLayoutRect(layout, () => 220);
    const toggle = createToggle();

    toggle.mount();
    const rail = document.querySelector<HTMLButtonElement>('.mpkr-left-sidebar-rail')!;
    const styles = document.querySelector<HTMLStyleElement>(
      'style[data-mpkr-left-sidebar-toggle-style]',
    )?.textContent ?? '';

    expect(rail.style.getPropertyValue('--mpkr-sidebar-rail-left')).toBe('-48px');
    rail.click();

    expect(rail.getAttribute('aria-expanded')).toBe('true');
    expect(rail.style.getPropertyValue('--mpkr-sidebar-rail-left')).toBe('-48px');
    expect(styles).not.toContain('--mpkr-sidebar-rail-open-left');
    expect(styles).toContain('transform: translateX(-100%)');
    expect(styles).toContain('[aria-expanded="true"]');
  });

  it('contains the drawer within the main row instead of the viewport', () => {
    setAreaFixture();
    const layout = document.querySelector<HTMLElement>('#area-layout')!;
    const toggle = createToggle();

    toggle.mount();
    document.querySelector<HTMLButtonElement>('.mpkr-left-sidebar-rail')!.click();
    const panel = document.querySelector<HTMLElement>('.mpkr-left-sidebar-panel')!;
    const surface = panel.querySelector<HTMLElement>('.mpkr-left-sidebar-panel__surface')!;
    const styles = document.querySelector<HTMLStyleElement>(
      'style[data-mpkr-left-sidebar-toggle-style]',
    )?.textContent ?? '';

    expect(panel.parentElement).toBe(layout);
    expect(getComputedStyle(layout).position).toBe('relative');
    expect(getComputedStyle(layout).isolation).toBe('isolate');
    expect(getComputedStyle(panel).position).toBe('absolute');
    expect(getComputedStyle(panel).overflow).toBe('hidden');
    expect(getComputedStyle(surface).maxWidth).toBe('100%');
    expect(styles).not.toContain('position: fixed');
    expect(styles).toContain('max-width: calc(100% - 28px)');
  });

  it('adds a layout-scoped gutter when outside space is too narrow', () => {
    setAreaFixture();
    const layout = document.querySelector<HTMLElement>('#area-layout')!;
    layout.style.setProperty('border-top-width', '1px');
    const originalClass = layout.getAttribute('class');
    const originalStyle = layout.getAttribute('style');
    mockLayoutRect(layout, () => 4);
    const toggle = createToggle();

    toggle.mount();
    const rail = document.querySelector<HTMLElement>('.mpkr-left-sidebar-rail')!;

    expect(layout.classList.contains('mpkr-left-sidebar-layout--rail-gutter')).toBe(true);
    expect(layout.style.getPropertyValue('--mpkr-sidebar-rail-gutter')).toBe('48px');
    expect(rail.style.getPropertyValue('--mpkr-sidebar-rail-left')).toBe('0px');

    toggle.destroy();
    expect(layout.classList.contains('mpkr-left-sidebar-rail-host')).toBe(false);
    expect(layout.getAttribute('class')).toBe(originalClass);
    expect(layout.getAttribute('style')).toBe(originalStyle);
  });

  it('repositions the rail and removes a temporary gutter after resize', () => {
    setAreaFixture();
    const layout = document.querySelector<HTMLElement>('#area-layout')!;
    let layoutLeft = 0;
    mockLayoutRect(layout, () => layoutLeft);
    const toggle = createToggle();
    toggle.mount();
    const rail = document.querySelector<HTMLElement>('.mpkr-left-sidebar-rail')!;

    expect(layout.classList.contains('mpkr-left-sidebar-layout--rail-gutter')).toBe(true);
    layoutLeft = 260;
    window.dispatchEvent(new Event('resize'));
    vi.advanceTimersByTime(20);

    expect(layout.classList.contains('mpkr-left-sidebar-layout--rail-gutter')).toBe(false);
    expect(rail.style.getPropertyValue('--mpkr-sidebar-rail-left')).toBe('-48px');
  });

  it('keeps the rail label centered in the visible container while the page scrolls', () => {
    setAreaFixture();
    const layout = document.querySelector<HTMLElement>('#area-layout')!;
    let top = 100;
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
    vi.spyOn(layout, 'getBoundingClientRect').mockImplementation(() => ({
      bottom: top + 1000,
      height: 1000,
      left: 220,
      right: 1120,
      top,
      width: 900,
      x: 220,
      y: top,
      toJSON: () => ({}),
    }));
    const toggle = createToggle();
    toggle.mount();
    const rail = document.querySelector<HTMLElement>('.mpkr-left-sidebar-rail')!;

    expect(rail.style.getPropertyValue('--mpkr-sidebar-marker-top')).toBe('272px');
    top = -200;
    window.dispatchEvent(new Event('scroll'));
    vi.advanceTimersByTime(20);

    expect(rail.style.getPropertyValue('--mpkr-sidebar-marker-top')).toBe('522px');
  });

  it('opens at the current viewport position while a scroll update is pending', () => {
    setAreaFixture();
    const layout = document.querySelector<HTMLElement>('#area-layout')!;
    let top = 120;
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
    vi.spyOn(layout, 'getBoundingClientRect').mockImplementation(() => ({
      bottom: top + 1400,
      height: 1400,
      left: 220,
      right: 1120,
      top,
      width: 900,
      x: 220,
      y: top,
      toJSON: () => ({}),
    }));
    const toggle = createToggle();
    toggle.mount();
    const rail = document.querySelector<HTMLButtonElement>('.mpkr-left-sidebar-rail')!;
    const panel = document.querySelector<HTMLElement>('.mpkr-left-sidebar-panel')!;

    top = -320;
    window.dispatchEvent(new Event('scroll'));
    rail.click();

    expect(panel.hidden).toBe(false);
    expect(panel.style.getPropertyValue('--mpkr-sidebar-panel-top')).toBe('320px');
    expect(panel.style.getPropertyValue('--mpkr-sidebar-panel-height')).toBe('800px');
  });

  it('keeps long sidebar content scrollable inside the visible row segment', () => {
    setAreaFixture();
    const layout = document.querySelector<HTMLElement>('#area-layout')!;
    const menu = document.querySelector<HTMLElement>('#original-menu')!;
    menu.insertAdjacentHTML(
      'beforeend',
      Array.from({ length: 80 }, (_, index) => (
        `<a href="/area/${index + 10}/area-${index + 1}">Area ${index + 1}</a>`
      )).join(''),
    );
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 700 });
    vi.spyOn(layout, 'getBoundingClientRect').mockImplementation(() => ({
      bottom: 1700,
      height: 2000,
      left: 220,
      right: 1120,
      top: -300,
      width: 900,
      x: 220,
      y: -300,
      toJSON: () => ({}),
    }));
    const toggle = createToggle();
    toggle.mount();
    document.querySelector<HTMLButtonElement>('.mpkr-left-sidebar-rail')!.click();
    const panel = document.querySelector<HTMLElement>('.mpkr-left-sidebar-panel')!;
    const surface = panel.querySelector<HTMLElement>('.mpkr-left-sidebar-panel__surface')!;

    expect(panel.style.getPropertyValue('--mpkr-sidebar-panel-top')).toBe('300px');
    expect(panel.style.getPropertyValue('--mpkr-sidebar-panel-height')).toBe('700px');
    expect(getComputedStyle(surface).overflowY).toBe('auto');
    expect(surface.querySelectorAll('#original-menu a')).toHaveLength(82);
    surface.scrollTop = 420;
    expect(surface.scrollTop).toBe(420);
  });

  it('clamps the panel to the row bottom as the user scrolls past it', () => {
    setAreaFixture();
    const layout = document.querySelector<HTMLElement>('#area-layout')!;
    let top = -900;
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
    vi.spyOn(layout, 'getBoundingClientRect').mockImplementation(() => ({
      bottom: top + 1100,
      height: 1100,
      left: 220,
      right: 1120,
      top,
      width: 900,
      x: 220,
      y: top,
      toJSON: () => ({}),
    }));
    const toggle = createToggle();
    toggle.mount();
    document.querySelector<HTMLButtonElement>('.mpkr-left-sidebar-rail')!.click();
    const panel = document.querySelector<HTMLElement>('.mpkr-left-sidebar-panel')!;

    expect(panel.style.getPropertyValue('--mpkr-sidebar-panel-top')).toBe('900px');
    expect(panel.style.getPropertyValue('--mpkr-sidebar-panel-height')).toBe('200px');

    top = -1100;
    window.dispatchEvent(new Event('scroll'));
    vi.advanceTimersByTime(20);

    expect(panel.style.getPropertyValue('--mpkr-sidebar-panel-top')).toBe('1100px');
    expect(panel.style.getPropertyValue('--mpkr-sidebar-panel-height')).toBe('0px');
  });

  it('coalesces scroll and resize layout reads into one animation frame', () => {
    setAreaFixture();
    const layout = document.querySelector<HTMLElement>('#area-layout')!;
    const rect = vi.spyOn(layout, 'getBoundingClientRect').mockImplementation(() => ({
      bottom: 900,
      height: 900,
      left: 220,
      right: 1120,
      top: 0,
      width: 900,
      x: 220,
      y: 0,
      toJSON: () => ({}),
    }));
    const toggle = createToggle();
    toggle.mount();
    expect(rect).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new Event('scroll'));
    expect(rect).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(20);

    expect(rect).toHaveBeenCalledTimes(2);
  });

  it('opens after 120ms hover and closes 250ms after leaving rail and panel', () => {
    setAreaFixture();
    const toggle = createToggle();
    toggle.mount();
    const rail = document.querySelector<HTMLButtonElement>('.mpkr-left-sidebar-rail')!;
    const panel = document.querySelector<HTMLElement>('.mpkr-left-sidebar-panel')!;
    const surface = panel.querySelector<HTMLElement>('.mpkr-left-sidebar-panel__surface')!;

    enter(rail);
    vi.advanceTimersByTime(119);
    expect(panel.hidden).toBe(true);
    vi.advanceTimersByTime(1);
    expect(panel.hidden).toBe(false);

    leave(rail);
    vi.advanceTimersByTime(100);
    enter(surface);
    vi.advanceTimersByTime(300);
    expect(panel.hidden).toBe(false);

    leave(surface);
    vi.advanceTimersByTime(249);
    expect(panel.hidden).toBe(false);
    vi.advanceTimersByTime(1);
    expect(panel.hidden).toBe(false);
    expect(panel.dataset.mpkrState).toBe('closing');
    expect(panel.getAttribute('aria-hidden')).toBe('true');
    expect(rail.getAttribute('data-mpkr-motion')).toBe('closing');
    vi.advanceTimersByTime(219);
    expect(panel.hidden).toBe(false);
    vi.advanceTimersByTime(1);
    expect(panel.hidden).toBe(true);
    expect(rail.getAttribute('aria-expanded')).toBe('false');
    expect(rail.hasAttribute('data-mpkr-motion')).toBe(false);
  });

  it('pins and unpins on rail click and closes a pinned panel on outside pointerdown', () => {
    setAreaFixture();
    const toggle = createToggle();
    toggle.mount();
    const rail = document.querySelector<HTMLButtonElement>('.mpkr-left-sidebar-rail')!;
    const panel = document.querySelector<HTMLElement>('.mpkr-left-sidebar-panel')!;
    const outside = document.querySelector<HTMLButtonElement>('#outside')!;

    rail.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
    expect(panel.hidden).toBe(false);
    leave(rail);
    vi.advanceTimersByTime(500);
    expect(panel.hidden).toBe(false);

    outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(panel.hidden).toBe(false);
    expect(panel.dataset.mpkrState).toBe('closing');
    vi.advanceTimersByTime(220);
    expect(panel.hidden).toBe(true);

    rail.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
    rail.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
    vi.advanceTimersByTime(249);
    expect(panel.hidden).toBe(false);
    vi.advanceTimersByTime(1);
    expect(panel.hidden).toBe(false);
    vi.advanceTimersByTime(220);
    expect(panel.hidden).toBe(true);
  });

  it('opens from keyboard focus, moves focus into the panel, and Escape returns it', () => {
    setAreaFixture();
    const toggle = createToggle();
    toggle.mount();
    const rail = document.querySelector<HTMLButtonElement>('.mpkr-left-sidebar-rail')!;
    const panel = document.querySelector<HTMLElement>('.mpkr-left-sidebar-panel')!;
    const close = panel.querySelector<HTMLButtonElement>('.mpkr-left-sidebar-panel__close')!;

    rail.focus();
    vi.advanceTimersByTime(120);
    expect(panel.hidden).toBe(false);
    expect(document.activeElement).toBe(close);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(panel.hidden).toBe(false);
    expect(panel.dataset.mpkrState).toBe('closing');
    expect(document.activeElement).toBe(rail);
    vi.advanceTimersByTime(219);
    expect(panel.hidden).toBe(false);
    vi.advanceTimersByTime(1);
    expect(panel.hidden).toBe(true);
  });

  it('skips the closing delay when reduced motion is requested', () => {
    setReducedMotion(true);
    setAreaFixture();
    const toggle = createToggle();
    toggle.mount();
    const rail = document.querySelector<HTMLButtonElement>('.mpkr-left-sidebar-rail')!;
    const panel = document.querySelector<HTMLElement>('.mpkr-left-sidebar-panel')!;
    const close = panel.querySelector<HTMLButtonElement>('.mpkr-left-sidebar-panel__close')!;

    rail.click();
    expect(panel.hidden).toBe(false);
    close.click();

    expect(panel.hidden).toBe(true);
    expect(panel.hasAttribute('data-mpkr-state')).toBe(false);
    expect(rail.hasAttribute('data-mpkr-motion')).toBe(false);
  });

  it('cancels an active closing motion when the feature is destroyed', () => {
    setAreaFixture();
    const layout = document.querySelector<HTMLElement>('#area-layout')!;
    const sidebar = document.querySelector<HTMLElement>('.left-nav')!;
    const toggle = createToggle();
    toggle.mount();
    const rail = document.querySelector<HTMLButtonElement>('.mpkr-left-sidebar-rail')!;
    const panel = document.querySelector<HTMLElement>('.mpkr-left-sidebar-panel')!;
    const close = panel.querySelector<HTMLButtonElement>('.mpkr-left-sidebar-panel__close')!;

    rail.click();
    close.click();
    expect(panel.dataset.mpkrState).toBe('closing');

    toggle.destroy();
    vi.advanceTimersByTime(500);

    expect(sidebar.parentElement).toBe(layout);
    expect(document.querySelector('.mpkr-left-sidebar-rail')).toBeNull();
    expect(document.querySelector('.mpkr-left-sidebar-panel')).toBeNull();
  });

  it('closes an unpinned desktop panel when focus moves outside', () => {
    setAreaFixture();
    const toggle = createToggle();
    toggle.mount();
    const rail = document.querySelector<HTMLButtonElement>('.mpkr-left-sidebar-rail')!;
    const panel = document.querySelector<HTMLElement>('.mpkr-left-sidebar-panel')!;
    const outside = document.querySelector<HTMLButtonElement>('#outside')!;

    enter(rail);
    vi.advanceTimersByTime(120);
    expect(panel.hidden).toBe(false);
    outside.focus();
    expect(panel.dataset.mpkrState).toBe('closing');
    vi.advanceTimersByTime(220);
    expect(panel.hidden).toBe(true);
  });

  it('keeps desktop flyout non-modal without backdrop or body scroll lock', () => {
    setAreaFixture();
    document.body.style.setProperty('overflow', 'clip', 'important');
    const toggle = createToggle();
    toggle.mount();
    const rail = document.querySelector<HTMLButtonElement>('.mpkr-left-sidebar-rail')!;
    const panel = document.querySelector<HTMLElement>('.mpkr-left-sidebar-panel')!;
    const backdrop = panel.querySelector<HTMLButtonElement>('.mpkr-left-sidebar-panel__backdrop')!;

    enter(rail);
    vi.advanceTimersByTime(120);

    expect(panel.hidden).toBe(false);
    expect(panel.hasAttribute('aria-modal')).toBe(false);
    expect(backdrop.hidden).toBe(true);
    expect(document.body.style.getPropertyValue('overflow')).toBe('clip');
    expect(document.body.style.getPropertyPriority('overflow')).toBe('important');
  });

  it('uses tap, backdrop, scroll lock, and focus trap for coarse pointers', () => {
    setPointerMode('coarse');
    setAreaFixture();
    document.body.style.setProperty('overflow', 'clip', 'important');
    const toggle = createToggle();
    toggle.mount();
    const rail = document.querySelector<HTMLButtonElement>('.mpkr-left-sidebar-rail')!;
    const layout = document.querySelector<HTMLElement>('#area-layout')!;
    const panel = document.querySelector<HTMLElement>('.mpkr-left-sidebar-panel')!;
    const backdrop = panel.querySelector<HTMLButtonElement>('.mpkr-left-sidebar-panel__backdrop')!;
    const close = panel.querySelector<HTMLButtonElement>('.mpkr-left-sidebar-panel__close')!;
    const lastLink = Array.from(panel.querySelectorAll<HTMLAnchorElement>('a')).at(-1)!;

    enter(rail);
    vi.advanceTimersByTime(500);
    expect(panel.hidden).toBe(true);
    expect(layout.classList.contains('mpkr-left-sidebar-layout--rail-gutter')).toBe(true);
    expect(layout.style.getPropertyValue('--mpkr-sidebar-rail-gutter')).toBe('50px');
    rail.click();
    expect(panel.hidden).toBe(false);
    expect(panel.getAttribute('aria-modal')).toBe('true');
    expect(backdrop.hidden).toBe(false);
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.activeElement).toBe(close);

    lastLink.focus();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement).toBe(close);

    backdrop.click();
    expect(panel.hidden).toBe(false);
    expect(panel.dataset.mpkrState).toBe('closing');
    expect(document.body.style.getPropertyValue('overflow')).toBe('clip');
    expect(document.body.style.getPropertyPriority('overflow')).toBe('important');
    expect(document.activeElement).toBe(rail);
    vi.advanceTimersByTime(220);
    expect(panel.hidden).toBe(true);
  });

  it('preserves original ancestry, identity, order, attributes, and events on destroy', () => {
    setAreaFixture();
    const layout = document.querySelector<HTMLElement>('#area-layout')!;
    const sidebar = document.querySelector<HTMLElement>('.left-nav')!;
    const menu = document.querySelector<HTMLElement>('#original-menu')!;
    const link = menu.querySelector<HTMLAnchorElement>('a')!;
    const originalLayoutNodes = Array.from(layout.childNodes);
    const sidebarClass = sidebar.getAttribute('class');
    const sidebarStyle = sidebar.getAttribute('style');
    const layoutClass = layout.getAttribute('class');
    let clicks = 0;
    link.addEventListener('click', (event) => {
      event.preventDefault();
      clicks += 1;
    });
    const toggle = createToggle();
    toggle.mount();
    document.querySelector<HTMLButtonElement>('.mpkr-left-sidebar-rail')!.click();
    link.click();

    toggle.destroy();
    link.click();

    expect(clicks).toBe(2);
    expect(Array.from(layout.childNodes)).toEqual(originalLayoutNodes);
    expect(sidebar.parentElement).toBe(layout);
    expect(sidebar.querySelector('.mp-sidebar')).toBe(menu);
    expect(sidebar.getAttribute('class')).toBe(sidebarClass);
    expect(sidebar.getAttribute('style')).toBe(sidebarStyle);
    expect(layout.getAttribute('class')).toBe(layoutClass);
    expect(document.querySelector('.mpkr-left-sidebar-rail')).toBeNull();
    expect(document.querySelector('.mpkr-left-sidebar-panel')).toBeNull();
    expect(document.body.style.overflow).toBe('');
  });

  it('is idempotent and discovers dynamically inserted sidebars once', async () => {
    document.body.innerHTML = '<main id="dynamic-root"></main>';
    const toggle = createToggle();
    expect(toggle.mount()).toBe(0);
    expect(toggle.mount()).toBe(0);
    vi.useRealTimers();

    document.querySelector('#dynamic-root')!.insertAdjacentHTML('beforeend', `
      <section class="row">
        <aside class="left-nav"><div class="mp-sidebar">Menu</div></aside>
        <main class="main-content">Content</main>
      </section>
    `);
    await new Promise<void>((resolve) => setTimeout(resolve, 0));

    expect(document.querySelectorAll('.mpkr-left-sidebar-rail')).toHaveLength(1);
    expect(document.querySelectorAll('.mpkr-left-sidebar-panel')).toHaveLength(1);
    expect(document.head.querySelectorAll('style[data-mpkr-left-sidebar-toggle-style]'))
      .toHaveLength(1);
  });

  it('supports multiple sidebars without duplicating controls', () => {
    document.body.innerHTML = `
      <section><aside class="left-nav"><div class="mp-sidebar">One</div></aside><main class="main-content">A</main></section>
      <section><aside class="left-nav"><div class="mp-sidebar">Two</div></aside><main class="main-content">B</main></section>
    `;
    const toggle = createToggle();

    expect(toggle.mount()).toBe(2);
    expect(document.querySelectorAll('.mpkr-left-sidebar-rail')).toHaveLength(2);
    expect(document.querySelectorAll('.mpkr-left-sidebar-panel')).toHaveLength(2);
    expect(toggle.mount()).toBe(2);
    expect(document.querySelectorAll('.mpkr-left-sidebar-rail')).toHaveLength(2);
  });

  it('contains only edge rail/flyout styles and no former top-bar or category UI', () => {
    setAreaFixture();
    const toggle = createToggle();
    toggle.mount();
    const styles = document.querySelector<HTMLStyleElement>(
      'style[data-mpkr-left-sidebar-toggle-style]',
    )?.textContent ?? '';

    expect(styles).toContain('width: 38px');
    expect(styles).toContain('width: 40px');
    expect(styles).toContain('min-height: 156px');
    expect(styles).toContain('bottom: 0');
    expect(styles).toContain('position: absolute');
    expect(styles).toContain('position: sticky');
    expect(styles).toContain(`background: ${UI.color.surfaceSubtle}`);
    expect(styles).toContain(`border: 1px solid ${UI.color.border}`);
    expect(styles).toContain(`border-right: 3px solid ${UI.color.link}`);
    expect(styles).toContain(`color: ${UI.color.text}`);
    expect(styles).toContain('writing-mode: vertical-rl');
    expect(styles).toContain('min-height: 124px');
    expect(styles).toContain('width: 42px');
    expect(styles).toContain('width: 328px');
    expect(styles).toContain('pointer-events: none');
    expect(styles).toContain('@media (hover: none), (pointer: coarse)');
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(styles).toContain('mpkr-sidebar-flyout-exit');
    expect(styles).toContain('mpkr-sidebar-backdrop-exit');
    expect(styles).toContain('pointer-events: none');
    expect(styles).not.toContain('max-width: 360px');
    expect(styles).not.toContain(`background: ${UI.color.link}`);
    expect(styles).not.toContain('mpkr-left-sidebar-trigger');
    expect(styles).not.toContain('mpkr-left-sidebar-trigger-slot');
    expect(document.body.textContent).not.toContain('하위 지역');
    expect(document.body.textContent).not.toContain('루트 목록');
    expect(document.body.textContent).not.toContain('탐색');
  });
});
