import { Window as HappyDOMWindow } from 'happy-dom';

import {
  CHOUINARD_B_ROUTE_FIXTURE,
  CHOUINARD_B_STATS_FIXTURE,
} from '../../test-fixtures/chouinard-b-route';
import { RouteStatsEmbedLayout } from './layout';

const ROUTE_URL = new URL(
  'https://www.mountainproject.com/route/106232568/chouinard-b',
);
const STATS_URL = 'https://www.mountainproject.com/route/stats/106232568/chouinard-b';

async function flushMutations(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

function setFixture(): void {
  document.head.innerHTML = '<base href="https://www.mountainproject.com/">';
  document.body.innerHTML = `
    <div class="small mb-1" id="unrelated-summary">
      <table class="description-details"><tr><td>Unrelated</td></tr></table>
    </div>
    ${CHOUINARD_B_ROUTE_FIXTURE}
    <div class="row" id="unrelated-row">
      <div class="col-lg-5 col-md-6" id="unrelated-column">Keep me</div>
    </div>
  `;
}

function connectSameOriginFrame(
  iframe: HTMLIFrameElement,
  html = CHOUINARD_B_STATS_FIXTURE,
): HappyDOMWindow {
  const frameWindow = new HappyDOMWindow({ url: STATS_URL });
  frameWindow.document.body.innerHTML = html;
  Object.defineProperty(iframe, 'contentDocument', {
    configurable: true,
    value: frameWindow.document,
  });
  Object.defineProperty(iframe, 'contentWindow', {
    configurable: true,
    value: frameWindow,
  });
  iframe.dispatchEvent(new Event('load'));
  return frameWindow;
}

describe('RouteStatsEmbedLayout', () => {
  const layouts: RouteStatsEmbedLayout[] = [];
  const frameWindows: HappyDOMWindow[] = [];

  const createLayout = (): RouteStatsEmbedLayout => {
    const layout = new RouteStatsEmbedLayout();
    layouts.push(layout);
    return layout;
  };

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    (
      window as unknown as Window & {
        happyDOM: { settings: { disableIframePageLoading: boolean } };
      }
    ).happyDOM.settings.disableIframePageLoading = true;
    setFixture();
  });

  afterEach(() => {
    layouts.forEach((layout) => layout.destroy());
    layouts.length = 0;
    frameWindows.forEach((frameWindow) => frameWindow.close());
    frameWindows.length = 0;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('lays out the structurally related summary and You region without replacing either node', () => {
    const routeRow = document.querySelector<HTMLElement>('#route-overview-row')!;
    const overview = document.querySelector<HTMLElement>('#route-overview-primary')!;
    const summary = document.querySelector<HTMLElement>('#route-summary')!;
    const youAndRoute = document.querySelector<HTMLElement>('#you-and-route')!;
    const summaryChildren = Array.from(summary.querySelectorAll('*'));
    let clicks = 0;
    document.querySelector('#todoToggle')!.addEventListener('click', (event) => {
      event.preventDefault();
      clicks += 1;
    });

    expect(createLayout().mount(document, ROUTE_URL)).toBe(true);

    expect(document.querySelector('#route-overview-primary')).toBe(overview);
    expect(document.querySelector('#route-summary')).toBe(summary);
    expect(document.querySelector('#you-and-route')).toBe(youAndRoute);
    expect(Array.from(summary.querySelectorAll('*'))).toEqual(summaryChildren);
    expect(summary.parentElement).toBe(overview);
    expect(youAndRoute.parentElement).toBe(overview);
    expect(overview.getAttribute('data-mpkr-route-overview')).toBe('true');
    expect(summary.getAttribute('data-mpkr-route-summary')).toBe('true');
    expect(youAndRoute.getAttribute('data-mpkr-you-and-route')).toBe('true');
    expect(document.querySelector('#unrelated-summary')?.hasAttribute('data-mpkr-route-summary'))
      .toBe(false);

    const style = document.querySelector<HTMLStyleElement>(
      'style[data-mp-korea-route-stats="styles"]',
    )!;
    expect(style.textContent).toContain('grid-template-columns: minmax(0, 1fr) minmax(18rem, 1fr)');
    expect(style.textContent).toContain('@media (max-width: 767px)');
    expect(style.textContent).toContain('grid-template-columns: minmax(0, 1fr)');
    expect(style.textContent).toContain('overflow-wrap: anywhere');
    expect(style.textContent).toContain('min-height: 680px');
    expect(style.textContent).toContain('padding-top: 0 !important');
    expect(style.textContent).toContain('min-height: 2.5rem');
    expect(style.textContent).not.toContain('border-bottom: 2px solid #0060a9');
    expect(style.textContent).toContain('flex-wrap: wrap');

    const statsSection = document.querySelector<HTMLElement>('.mpkr-route-stats')!;
    expect(statsSection.previousElementSibling).toBe(routeRow);
    expect(statsSection.parentElement).toBe(routeRow.parentElement);
    const statsHeadingWrap = statsSection.querySelector<HTMLElement>(
      '.mpkr-route-stats__heading-wrap',
    )!;
    expect(statsHeadingWrap.classList.contains('title-with-border-bottom')).toBe(true);
    expect(statsHeadingWrap.classList.contains('mb-1')).toBe(true);
    expect(statsHeadingWrap.classList.contains('mpkr-info-heading')).toBe(true);
    const youHeading = youAndRoute.firstElementChild as HTMLElement;
    expect(youHeading.classList.contains('title-with-border-bottom')).toBe(true);
    expect(youHeading.classList.contains('mb-1')).toBe(true);
    expect(youHeading.classList.contains('mpkr-info-heading')).toBe(true);
    expect(statsHeadingWrap.querySelector('h2')?.textContent).toBe('루트 통계');
    expect(statsHeadingWrap.querySelector('.mpkr-route-stats__external')).not.toBeNull();
    document.querySelector<HTMLAnchorElement>('#todoToggle')!.click();
    expect(clicks).toBe(1);
  });

  it('removes only the two verified auxiliary siblings from presentation', () => {
    createLayout().mount(document, ROUTE_URL);

    const onx = document.querySelector<HTMLElement>('#route-onx-region')!;
    const carousel = document.querySelector<HTMLElement>('#route-carousel-region')!;
    const unrelated = document.querySelector<HTMLElement>('#unrelated-column')!;
    expect(onx.getAttribute('data-mpkr-route-auxiliary')).toBe('true');
    expect(carousel.getAttribute('data-mpkr-route-auxiliary')).toBe('true');
    expect(unrelated.hasAttribute('data-mpkr-route-auxiliary')).toBe(false);
    expect(window.getComputedStyle(onx).display).toBe('none');
    expect(window.getComputedStyle(carousel).display).toBe('none');
    expect(window.getComputedStyle(unrelated).display).not.toBe('none');
    expect(document.querySelector('#photo-carousel')).not.toBeNull();
    expect(document.querySelector('#explore-3d')).not.toBeNull();
  });

  it('uses the exact Stats href found inside You & This Route instead of deriving an id', () => {
    document.querySelector<HTMLAnchorElement>('#you-and-route a[href*="/route/stats/"]')!
      .setAttribute('href', '/route/stats/998877665/a-different-live-route');
    document.querySelector('#route-name')!.firstChild!.textContent = 'Unrelated prose and 106232568';

    createLayout().mount(
      document,
      new URL('https://www.mountainproject.com/route/998877665/a-different-live-route'),
    );

    const iframe = document.querySelector<HTMLIFrameElement>('.mpkr-route-stats__frame')!;
    const external = document.querySelector<HTMLAnchorElement>('.mpkr-route-stats__external')!;
    expect(iframe.getAttribute('src')).toBe('/route/stats/998877665/a-different-live-route');
    expect(iframe.title).toBe('Mountain Project 루트 통계');
    expect(iframe.loading).toBe('lazy');
    expect(external.getAttribute('href')).toBe('/route/stats/998877665/a-different-live-route');
    expect(external.target).toBe('_blank');
    expect(external.rel).toBe('noopener noreferrer');
    expect(external.textContent).toBe('Mountain Project 원본 통계 열기');
    expect(external.parentElement).toBe(
      document.querySelector('.mpkr-route-stats__heading-wrap'),
    );
    expect(document.querySelector('.mpkr-route-stats__frame-wrap')?.nextElementSibling)
      .toBeNull();
    expect(document.querySelector('.mpkr-route-stats__heading')?.textContent).toBe('루트 통계');

    let headingBarClicks = 0;
    external.parentElement!.addEventListener('click', () => {
      headingBarClicks += 1;
    });
    external.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(headingBarClicks).toBe(0);
  });

  it('presents the verified Stats document without removing tables, charts, filters, controls, or attribution', async () => {
    const layout = createLayout();
    layout.mount(document, ROUTE_URL);
    const iframe = document.querySelector<HTMLIFrameElement>('.mpkr-route-stats__frame')!;
    const frameWindow = connectSameOriginFrame(iframe);
    frameWindows.push(frameWindow);
    await flushMutations();
    const frameDocument = frameWindow.document as unknown as Document;

    const frameStyle = frameDocument.querySelector<HTMLStyleElement>(
      'style[data-mpkr-route-stats-frame="styles"]',
    )!;
    expect(frameStyle.textContent).toContain('#header-container');
    expect(frameStyle.textContent).toContain('#footer-container');
    expect(frameStyle.textContent).toContain('.col-xs-12 > h1');
    expect(frameWindow.getComputedStyle(frameDocument.querySelector('#header-container') as never).display)
      .toBe('none');
    expect(frameWindow.getComputedStyle(frameDocument.querySelector('#footer-container') as never).display)
      .toBe('none');
    expect(frameWindow.getComputedStyle(frameDocument.querySelector('#stats-breadcrumbs') as never).display)
      .toBe('none');
    expect(frameWindow.getComputedStyle(frameDocument.querySelector('#route-stats h1') as never).display)
      .toBe('none');

    expect(frameDocument.querySelector('#stats-filter')).not.toBeNull();
    expect(frameDocument.querySelector('#stats-ratings')).not.toBeNull();
    expect(frameDocument.querySelector('#stats-chart')).not.toBeNull();
    expect(frameDocument.querySelector('#stats-ticks')).not.toBeNull();
    expect(frameDocument.querySelector('#tick-user')?.textContent).toBe('Climber');
    expect(frameDocument.querySelector('#stats-attribution')?.textContent)
      .toBe('Mountain Project community data');
    expect(frameDocument.querySelector('#login-control')).not.toBeNull();
    expect(frameDocument.querySelector('#route-star-avg')).not.toBeNull();
    expect(document.querySelector('.mpkr-route-stats__status')?.textContent).toBe('');
    expect(document.querySelector('.mpkr-route-stats__status')?.hasAttribute('role')).toBe(false);
  });

  it('opens content destinations in a new tab while leaving Stats paging and filtering in-frame', async () => {
    const layout = createLayout();
    layout.mount(document, ROUTE_URL);
    const iframe = document.querySelector<HTMLIFrameElement>('.mpkr-route-stats__frame')!;
    const frameWindow = connectSameOriginFrame(iframe);
    frameWindows.push(frameWindow);
    await flushMutations();
    const frameDocument = frameWindow.document as unknown as Document;

    const otherRoute = frameDocument.querySelector<HTMLAnchorElement>('#other-route')!;
    const tickUser = frameDocument.querySelector<HTMLAnchorElement>('#tick-user')!;
    const statsPage = frameDocument.querySelector<HTMLAnchorElement>('#stats-page-two')!;
    const filter = frameDocument.querySelector<HTMLFormElement>('#stats-filter')!;
    expect(otherRoute.target).toBe('_blank');
    expect(otherRoute.rel).toBe('noopener noreferrer');
    expect(tickUser.target).toBe('_blank');
    expect(statsPage.hasAttribute('target')).toBe(false);
    expect(filter.hasAttribute('target')).toBe(false);

    const dynamicArea = frameDocument.createElement('a');
    dynamicArea.href = '/area/106225629/south-korea';
    dynamicArea.textContent = 'South Korea';
    frameDocument.querySelector('.onx-stats-table')!.append(dynamicArea);
    await flushMutations();
    expect(dynamicArea.target).toBe('_blank');
    expect(dynamicArea.rel).toBe('noopener noreferrer');
  });

  it('falls back to the original link without noisy status text when iframe DOM access is unavailable', () => {
    const layout = createLayout();
    layout.mount(document, ROUTE_URL);
    const iframe = document.querySelector<HTMLIFrameElement>('.mpkr-route-stats__frame')!;
    Object.defineProperty(iframe, 'contentDocument', {
      configurable: true,
      get: () => {
        throw new DOMException('Blocked', 'SecurityError');
      },
    });

    iframe.dispatchEvent(new Event('load'));

    const status = document.querySelector<HTMLElement>('.mpkr-route-stats__status')!;
    expect(status.hidden).toBe(true);
    expect(status.textContent).toBe('');
    expect(status.dataset.state).toBe('loaded-limited');
    expect(document.querySelector('.mpkr-route-stats__frame-wrap')?.hasAttribute('aria-busy'))
      .toBe(false);
    expect(document.querySelector<HTMLAnchorElement>('.mpkr-route-stats__external')?.getAttribute('href'))
      .toBe('/route/stats/106232568/chouinard-b');
  });

  it('restores exact attributes, styles, positions, and iframe-owned changes on destroy', async () => {
    const layout = createLayout();
    const overview = document.querySelector<HTMLElement>('#route-overview-primary')!;
    const summary = document.querySelector<HTMLElement>('#route-summary')!;
    const youAndRoute = document.querySelector<HTMLElement>('#you-and-route')!;
    const onx = document.querySelector<HTMLElement>('#route-onx-region')!;
    const carousel = document.querySelector<HTMLElement>('#route-carousel-region')!;
    const row = document.querySelector<HTMLElement>('#route-overview-row')!;
    const routeSection = row.nextElementSibling;
    const snapshots = [overview, summary, youAndRoute, onx, carousel].map((element) => ({
      element,
      className: element.getAttribute('class'),
      style: element.getAttribute('style'),
      parent: element.parentNode,
      nextSibling: element.nextSibling,
    }));

    layout.mount(document, ROUTE_URL);
    layout.mount(document, ROUTE_URL);
    expect(document.querySelectorAll('.mpkr-route-stats')).toHaveLength(1);
    expect(document.querySelectorAll('style[data-mp-korea-route-stats]')).toHaveLength(1);

    const iframe = document.querySelector<HTMLIFrameElement>('.mpkr-route-stats__frame')!;
    const frameWindow = connectSameOriginFrame(iframe);
    frameWindows.push(frameWindow);
    const frameDocument = frameWindow.document as unknown as Document;
    frameDocument.documentElement.setAttribute('data-mpkr-route-stats-frame', 'changed-after-load');
    await flushMutations();
    const otherRoute = frameDocument.querySelector<HTMLAnchorElement>('#other-route')!;
    expect(otherRoute.target).toBe('_blank');

    layout.destroy();

    expect(document.querySelector('.mpkr-route-stats')).toBeNull();
    expect(document.querySelector('style[data-mp-korea-route-stats]')).toBeNull();
    expect(row.nextElementSibling).toBe(routeSection);
    for (const snapshot of snapshots) {
      expect(snapshot.element.getAttribute('class')).toBe(snapshot.className);
      expect(snapshot.element.getAttribute('style')).toBe(snapshot.style);
      expect(snapshot.element.parentNode).toBe(snapshot.parent);
      expect(snapshot.element.nextSibling).toBe(snapshot.nextSibling);
      expect(Array.from(snapshot.element.attributes).some((attribute) => (
        attribute.name.startsWith('data-mpkr-')
      ))).toBe(false);
    }
    expect(frameDocument.querySelector('style[data-mpkr-route-stats-frame="styles"]')).toBeNull();
    expect(frameDocument.documentElement.hasAttribute('data-mpkr-route-stats-frame')).toBe(false);
    expect(otherRoute.hasAttribute('target')).toBe(false);
    expect(otherRoute.hasAttribute('rel')).toBe(false);
  });

  it('waits safely for a delayed Route DOM and still mounts only once', async () => {
    document.body.innerHTML = '<main id="shell"></main>';
    const layout = createLayout();

    expect(layout.mount(document, ROUTE_URL)).toBe(false);
    document.querySelector('#shell')!.innerHTML = CHOUINARD_B_ROUTE_FIXTURE;
    await flushMutations();
    await flushMutations();

    expect(document.querySelector('#route-page')).not.toBeNull();
    expect(layout.mount(document, ROUTE_URL)).toBe(true);
    expect(document.querySelectorAll('.mpkr-route-stats')).toHaveLength(1);
    expect(document.querySelectorAll('style[data-mp-korea-route-stats]')).toHaveLength(1);
    layout.mount(document, ROUTE_URL);
    expect(document.querySelectorAll('.mpkr-route-stats')).toHaveLength(1);
  });

  it('does not mount on unsupported pages or ambiguous Route structures', () => {
    const layout = createLayout();
    expect(layout.mount(
      document,
      new URL('https://www.mountainproject.com/route/stats/106232568/chouinard-b'),
    )).toBe(false);

    document.querySelector('#route-onx-region .onx-explore')?.remove();
    expect(layout.mount(document, ROUTE_URL)).toBe(false);
    expect(document.querySelector('.mpkr-route-stats')).toBeNull();
    expect(document.querySelector('#unrelated-column')?.hasAttribute('data-mpkr-route-auxiliary'))
      .toBe(false);
  });
});
