import { CHOUINARD_B_ROUTE_FIXTURE } from '../test-fixtures/chouinard-b-route';
import { LeftSidebarToggle } from './left-sidebar-toggle';

function setNarrowViewport(matches: boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: () => ({ matches }),
  });
}

function setAreaFixture(): void {
  document.head.innerHTML = '';
  document.body.innerHTML = `
    <div id="climb-area-page">
      <div class="row pt-main-content" id="area-layout">
        <div class="col-md-9 float-md-right mb-1" id="area-heading">Heading</div>
        <div class="col-md-3 left-nav float-md-left mb-2" style="color: red">
          <div class="mp-sidebar"><h3>Areas</h3></div>
        </div>
        <div class="col-md-9 main-content float-md-right" style="min-width: 0">
          Main content
        </div>
      </div>
    </div>
  `;
}

describe('LeftSidebarToggle', () => {
  let toggles: LeftSidebarToggle[];

  const createToggle = (): LeftSidebarToggle => {
    const toggle = new LeftSidebarToggle();
    toggles.push(toggle);
    return toggle;
  };

  beforeEach(() => {
    toggles = [];
    setNarrowViewport(false);
  });

  afterEach(() => {
    for (const toggle of toggles) {
      toggle.destroy();
    }
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  it('mounts an accessible, expanded hamburger control on an Area layout', () => {
    setAreaFixture();
    const toggle = createToggle();

    expect(toggle.mount()).toBe(1);

    const sidebar = document.querySelector<HTMLElement>('.left-nav')!;
    const button = sidebar.querySelector<HTMLButtonElement>(
      '.mpkr-left-sidebar-toggle',
    )!;
    expect(button.type).toBe('button');
    expect(button.textContent).toBe('');
    expect(button.title).toBe('사이드바 닫기');
    expect(button.getAttribute('aria-label')).toBe('사이드바 닫기');
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(button.getAttribute('aria-controls')).toBe(sidebar.id);
    expect(button.hasAttribute('aria-haspopup')).toBe(false);
    expect(button.hasAttribute('role')).toBe(false);
    expect(sidebar.classList.contains('mpkr-left-sidebar--collapsed')).toBe(false);
  });

  it('collapses only on direct activation and expands every matching main column', () => {
    setAreaFixture();
    const toggle = createToggle();
    toggle.mount();
    const sidebar = document.querySelector<HTMLElement>('.left-nav')!;
    const button = document.querySelector<HTMLButtonElement>(
      '.mpkr-left-sidebar-toggle',
    )!;
    const heading = document.querySelector<HTMLElement>('#area-heading')!;
    const main = document.querySelector<HTMLElement>('.main-content')!;

    document.querySelector('.main-content')!.dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    );
    expect(sidebar.classList.contains('mpkr-left-sidebar--collapsed')).toBe(false);

    button.click();
    expect(sidebar.classList.contains('mpkr-left-sidebar--collapsed')).toBe(true);
    expect(heading.classList.contains('mpkr-left-sidebar-main--expanded')).toBe(true);
    expect(main.classList.contains('mpkr-left-sidebar-main--expanded')).toBe(true);
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.title).toBe('사이드바 열기');

    button.click();
    expect(sidebar.classList.contains('mpkr-left-sidebar--collapsed')).toBe(false);
    expect(heading.classList.contains('mpkr-left-sidebar-main--expanded')).toBe(false);
    expect(main.classList.contains('mpkr-left-sidebar-main--expanded')).toBe(false);
    expect(button.getAttribute('aria-expanded')).toBe('true');
  });

  it('uses a 44px target, visible focus ring and hamburger-to-close state without menu semantics', () => {
    setAreaFixture();
    const toggle = createToggle();
    toggle.mount();
    const styles = document.querySelector<HTMLStyleElement>(
      'style[data-mpkr-left-sidebar-toggle-style]',
    )?.textContent;

    expect(styles).toContain('height: 44px');
    expect(styles).toContain('width: 44px');
    expect(styles).toContain('outline: 2px solid var(--mpkr-sidebar-focus)');
    expect(styles).toContain('outline-offset: 2px');
    expect(styles).toContain('[aria-expanded="true"]');
    expect(styles).toContain('transform: rotate(45deg)');
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('closes a reopened mobile drawer on Escape and returns focus to the disclosure', () => {
    setNarrowViewport(true);
    setAreaFixture();
    const toggle = createToggle();
    toggle.mount();
    const sidebar = document.querySelector<HTMLElement>('.left-nav')!;
    const button = document.querySelector<HTMLButtonElement>('.mpkr-left-sidebar-toggle')!;
    const backdrop = document.querySelector<HTMLButtonElement>('.mpkr-left-sidebar-backdrop')!;

    button.click();
    button.click();
    expect(sidebar.classList.contains('mpkr-left-sidebar--drawer-open')).toBe(true);
    expect(backdrop.hidden).toBe(false);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(sidebar.classList.contains('mpkr-left-sidebar--collapsed')).toBe(true);
    expect(sidebar.classList.contains('mpkr-left-sidebar--drawer-open')).toBe(false);
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(button);
    expect(backdrop.hidden).toBe(true);
  });

  it('closes a reopened mobile drawer through its backdrop without reacting to page content', () => {
    setNarrowViewport(true);
    setAreaFixture();
    const toggle = createToggle();
    toggle.mount();
    const sidebar = document.querySelector<HTMLElement>('.left-nav')!;
    const button = document.querySelector<HTMLButtonElement>('.mpkr-left-sidebar-toggle')!;
    const backdrop = document.querySelector<HTMLButtonElement>('.mpkr-left-sidebar-backdrop')!;

    button.click();
    button.click();
    document.querySelector('.main-content')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(sidebar.classList.contains('mpkr-left-sidebar--drawer-open')).toBe(true);

    backdrop.click();
    expect(sidebar.classList.contains('mpkr-left-sidebar--collapsed')).toBe(true);
    expect(button.getAttribute('aria-label')).toBe('사이드바 열기');
  });

  it('supports the live-derived Route layout without page-id hardcoding', () => {
    document.head.innerHTML = '';
    document.body.innerHTML = CHOUINARD_B_ROUTE_FIXTURE;
    const toggle = createToggle();

    expect(toggle.mount()).toBe(1);
    const button = document.querySelector<HTMLButtonElement>(
      '#route-page .mpkr-left-sidebar-toggle',
    )!;
    button.click();

    expect(document.querySelector('.left-nav')?.classList.contains(
      'mpkr-left-sidebar--collapsed',
    )).toBe(true);
    expect(document.querySelector('#route-page > .col-md-9')?.classList.contains(
      'mpkr-left-sidebar-main--expanded',
    )).toBe(true);
    expect(document.querySelector('#route-page > .main-content')?.classList.contains(
      'mpkr-left-sidebar-main--expanded',
    )).toBe(true);
  });

  it('is idempotent and discovers a dynamically inserted common left sidebar', async () => {
    document.head.innerHTML = '';
    document.body.innerHTML = '<main id="dynamic-root"></main>';
    const toggle = createToggle();
    expect(toggle.mount()).toBe(0);
    expect(document.head.querySelector(
      'style[data-mpkr-left-sidebar-toggle-style]',
    )).not.toBeNull();
    expect(toggle.mount()).toBe(0);

    document.querySelector('#dynamic-root')!.insertAdjacentHTML('beforeend', `
      <section class="row">
        <aside class="col-md-3 left-nav"><div class="mp-sidebar">Menu</div></aside>
        <article class="col-md-9 main-content">Content</article>
      </section>
    `);
    await new Promise<void>((resolve) => setTimeout(resolve, 0));

    expect(document.querySelectorAll('.mpkr-left-sidebar-toggle')).toHaveLength(1);
    expect(document.head.querySelectorAll('style[data-mpkr-left-sidebar-toggle-style]'))
      .toHaveLength(1);
  });

  it('ignores lookalikes without an MP sidebar or matching main column', () => {
    document.body.innerHTML = `
      <div class="left-nav"><div>Not an MP sidebar</div></div>
      <div><aside class="left-nav"><div class="mp-sidebar">Menu</div></aside></div>
    `;
    const toggle = createToggle();

    expect(toggle.mount()).toBe(0);
    expect(document.querySelector('.mpkr-left-sidebar-toggle')).toBeNull();
    expect(document.querySelector('.mpkr-left-sidebar-backdrop')).toBeNull();
  });

  it('restores original nodes, order, ids and class attributes on destroy', () => {
    setAreaFixture();
    const layout = document.querySelector<HTMLElement>('#area-layout')!;
    const sidebar = document.querySelector<HTMLElement>('.left-nav')!;
    const main = document.querySelector<HTMLElement>('.main-content')!;
    const originalChildren = Array.from(layout.children);
    const layoutClass = layout.getAttribute('class');
    const sidebarClass = sidebar.getAttribute('class');
    const mainClass = main.getAttribute('class');
    const sidebarStyle = sidebar.getAttribute('style');
    const mainStyle = main.getAttribute('style');
    const toggle = createToggle();
    toggle.mount();
    document.querySelector<HTMLButtonElement>('.mpkr-left-sidebar-toggle')!.click();

    toggle.destroy();

    expect(Array.from(layout.children)).toEqual(originalChildren);
    expect(sidebar.getAttribute('class')).toBe(sidebarClass);
    expect(sidebar.hasAttribute('id')).toBe(false);
    expect(sidebar.getAttribute('style')).toBe(sidebarStyle);
    expect(main.getAttribute('class')).toBe(mainClass);
    expect(main.getAttribute('style')).toBe(mainStyle);
    expect(layout.getAttribute('class')).toBe(layoutClass);
    expect(document.querySelector('.mpkr-left-sidebar-toggle')).toBeNull();
    expect(document.querySelector('style[data-mpkr-left-sidebar-toggle-style]')).toBeNull();
  });

  it('preserves a pre-existing sidebar id through destroy', () => {
    setAreaFixture();
    const sidebar = document.querySelector<HTMLElement>('.left-nav')!;
    sidebar.id = 'original-sidebar';
    const toggle = createToggle();
    toggle.mount();

    expect(document.querySelector('button')?.getAttribute('aria-controls'))
      .toBe('original-sidebar');
    toggle.destroy();
    expect(sidebar.id).toBe('original-sidebar');
  });
});
