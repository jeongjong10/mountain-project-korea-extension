import { Window as HappyDOMWindow } from 'happy-dom';

import {
  SOUTH_KOREA_MAP_URL,
  SouthKoreaMapEmbed,
} from '@/ui/south-korea-map-embed';

const SOUTH_KOREA_AREA_URL = new URL(
  'https://www.mountainproject.com/area/106225629/south-korea',
);

function setFixture(): void {
  document.head.innerHTML = '';
  document.body.innerHTML = `
    <div id="climb-area-page">
      <div class="row pt-main-content">
        <div class="col-md-9 float-md-right mb-1" id="area-heading">Heading</div>
        <div class="col-md-3 left-nav float-md-left mb-2" style="color: red; display: block">
          <div class="mp-sidebar">
            <a id="original-map-link" href="${SOUTH_KOREA_MAP_URL}">
              <div class="position-relative map-preview"><button class="expand-map" type="button"></button></div>
            </a>
            <div id="original-map-label">
              <a href="${SOUTH_KOREA_MAP_URL}">Climbing Area Map</a>
            </div>
          </div>
        </div>
        <div class="col-md-9 main-content float-md-right" style="min-width: 0">
          <div id="original-content">Original area content</div>
        </div>
      </div>
    </div>
  `;
}

function openMap(embed: SouthKoreaMapEmbed): HTMLIFrameElement {
  expect(embed.mount(document, SOUTH_KOREA_AREA_URL)).toBe(true);
  document.querySelector<HTMLElement>(
    '.mpkr-south-korea-map__toggle',
  )!.click();
  return document.querySelector<HTMLIFrameElement>(
    '.mpkr-south-korea-map__frame',
  )!;
}

function connectSameOriginFrame(iframe: HTMLIFrameElement): HappyDOMWindow {
  const frameWindow = new HappyDOMWindow({ url: SOUTH_KOREA_MAP_URL });
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

describe('SouthKoreaMapEmbed', () => {
  const embeds: SouthKoreaMapEmbed[] = [];
  const frameWindows: HappyDOMWindow[] = [];

  const createEmbed = (): SouthKoreaMapEmbed => {
    const embed = new SouthKoreaMapEmbed();
    embeds.push(embed);
    return embed;
  };

  const connectFrame = (iframe: HTMLIFrameElement): HappyDOMWindow => {
    const frameWindow = connectSameOriginFrame(iframe);
    frameWindows.push(frameWindow);
    return frameWindow;
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
    embeds.forEach((embed) => embed.destroy());
    embeds.length = 0;
    frameWindows.forEach((frameWindow) => frameWindow.close());
    frameWindows.length = 0;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('mounts against the real Area layout without replacing existing nodes or links', () => {
    const originalPreview = document.querySelector('.map-preview');
    const originalLink = document.querySelector('#original-map-link');
    const originalContent = document.querySelector('#original-content');
    const areaSidebar = document.querySelector('.left-nav');
    const embed = createEmbed();

    expect(embed.mount(document, SOUTH_KOREA_AREA_URL)).toBe(true);
    expect(document.querySelector('.map-preview')).toBe(originalPreview);
    expect(document.querySelector('#original-map-link')).toBe(originalLink);
    expect(document.querySelector('#original-content')).toBe(originalContent);
    expect(document.querySelector('.left-nav')).toBe(areaSidebar);
    expect((originalLink as HTMLAnchorElement).href).toBe(SOUTH_KOREA_MAP_URL);
    expect(document.querySelector('.main-content')?.firstElementChild)
      .toBe(document.querySelector('[data-mp-korea-south-korea-map="true"]'));
    expect(document.querySelector('style[data-mp-korea-south-korea-map="styles"]'))
      .not.toBeNull();
    expect(document.body.textContent).not.toContain(
      'Mountain Project의 원본 전체 지도 페이지입니다. 원본 헤더와 메뉴가 지도와 함께 표시됩니다.',
    );
    expect(document.body.textContent).not.toContain('원본 지도가 로드되었습니다.');
  });

  it('creates the exact original iframe lazily and keeps it across map collapses', () => {
    const embed = createEmbed();
    embed.mount(document, SOUTH_KOREA_AREA_URL);

    const toggle = document.querySelector<HTMLElement>(
      '.mpkr-south-korea-map__toggle',
    )!;
    const content = document.querySelector<HTMLElement>(
      '#mpkr-south-korea-map-content',
    )!;

    expect(toggle.tagName).toBe('DIV');
    expect(toggle.getAttribute('role')).toBe('button');
    expect(toggle.getAttribute('tabindex')).toBe('0');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.getAttribute('aria-label')).toBe('대한민국 클라이밍 지도 내용 펼치기');
    expect(toggle.getAttribute('aria-controls')).toBe(content.id);
    expect(toggle.classList.contains('title-with-border-bottom')).toBe(true);
    expect(toggle.classList.contains('mb-1')).toBe(true);
    expect(toggle.classList.contains('mpkr-info-heading')).toBe(true);
    const children = Array.from(toggle.children);
    expect(children.map((child) => child.className)).toEqual([
      'mpkr-south-korea-map__label',
      'mpkr-south-korea-map__hint',
      'mpkr-south-korea-map__external',
      'mpkr-south-korea-map__chevron',
    ]);
    expect(document.querySelector('.mpkr-south-korea-map__hint')?.textContent)
      .toBe('눌러서 내용 보기');
    const styleText = document.querySelector<HTMLStyleElement>(
      'style[data-mp-korea-south-korea-map="styles"]',
    )?.textContent;
    expect(styleText).toContain('font-size: 0.9rem');
    expect(styleText).toContain('border-bottom-color: #0060a9');
    expect(styleText).not.toContain('box-shadow: inset 3px 0 #0060a9');
    expect(styleText).toContain('background: rgba(0, 96, 169, 0.12)');
    expect(styleText).toContain('outline: 3px solid #0060a9');
    expect(document.querySelector('.mpkr-south-korea-map__heading')
      ?.contains(document.querySelector('.mpkr-south-korea-map__external'))).toBe(true);
    expect(content.contains(document.querySelector('.mpkr-south-korea-map__external')))
      .toBe(false);
    expect(content.hidden).toBe(true);
    expect(document.querySelector('iframe')).toBeNull();

    toggle.click();

    const iframe = document.querySelector<HTMLIFrameElement>('iframe')!;
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.getAttribute('aria-label')).toBe('대한민국 클라이밍 지도 내용 접기');
    expect(document.querySelector('.mpkr-south-korea-map__hint')?.textContent)
      .toBe('눌러서 접기');
    expect(content.hidden).toBe(false);
    expect(iframe.getAttribute('src')).toBe(SOUTH_KOREA_MAP_URL);
    expect(iframe.title).toBe('Mountain Project 대한민국 클라이밍 지도');
    expect(iframe.loading).toBe('lazy');
    expect(document.querySelector('.mpkr-south-korea-map__note')).toBeNull();
    expect(document.querySelector('.mpkr-south-korea-map__status')?.hasAttribute('role'))
      .toBe(false);
    expect(document.querySelector('.mpkr-south-korea-map__external')?.textContent)
      .toBe('Mountain Project 원본 지도 열기');

    toggle.click();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(document.querySelector('.mpkr-south-korea-map__hint')?.textContent)
      .toBe('눌러서 내용 보기');
    expect(content.hidden).toBe(true);
    expect(document.querySelector('iframe')).toBe(iframe);

    toggle.click();
    expect(document.querySelectorAll('iframe')).toHaveLength(1);
    expect(document.querySelector('iframe')).toBe(iframe);
  });

  it('keeps the original map link in the heading without toggling the map section', () => {
    const embed = createEmbed();
    embed.mount(document, SOUTH_KOREA_AREA_URL);

    const toggle = document.querySelector<HTMLButtonElement>(
      '.mpkr-south-korea-map__toggle',
    )!;
    const link = document.querySelector<HTMLAnchorElement>(
      '.mpkr-south-korea-map__external',
    )!;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });

    link.addEventListener('click', (clickEvent) => clickEvent.preventDefault());
    link.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(document.querySelector('.mpkr-south-korea-map__frame')).toBeNull();
    expect(link.href).toBe(SOUTH_KOREA_MAP_URL);
    expect(link.target).toBe('_blank');
    expect(link.rel).toBe('noopener noreferrer');
  });

  it('hides only verified page chrome while retaining map controls and restores ownership on destroy', () => {
    const embed = createEmbed();
    const iframe = openMap(embed);
    const frameWindow = new HappyDOMWindow({ url: SOUTH_KOREA_MAP_URL });
    frameWindows.push(frameWindow);
    const frameDocument = frameWindow.document as unknown as Document;
    frameDocument.body.innerHTML = `
      <div id="header-container-print">Print logo</div>
      <div id="header-container"><nav id="header-nav">Global navigation</nav></div>
      <div id="div-gpt-ad-1614709329076-0">Advertisement</div>
      <div class="main-content-container">
        <div class="container-fluid">
          <div class="row pt-main-content"><div class="col-xs-12">
            <h1>Climbing Map of South Korea</h1>
            <div class="text-warm">Breadcrumbs</div>
            <div class="mt-2 mb-1">Framing</div>
            <div id="sun-controls">
              <label><input id="toggle-sun" type="checkbox"> Sun Angles</label>
              <div>Sunrise: <span id="sunrise">06:18</span> · Sunset: <span id="sunset">18:28</span></div>
            </div>
            <div id="map-and-ride-finder-container">
              <div id="ap-map-container">
                <div id="details-window">Details</div>
                <div id="details-popup">Popup</div>
                <div id="mapbox">
                  <button id="zoom-control">Zoom</button>
                  <div id="attribution-popup">Mountain Project map attribution</div>
                </div>
                <div id="where-play-map-key">Filters</div>
              </div>
            </div>
          </div></div>
        </div>
      </div>
      <div id="footer-container">Footer</div>
    `;
    frameDocument.documentElement.setAttribute(
      'data-mpkr-south-korea-map-chrome',
      'preexisting',
    );
    Object.defineProperty(iframe, 'contentDocument', {
      configurable: true,
      value: frameDocument,
    });
    Object.defineProperty(iframe, 'contentWindow', {
      configurable: true,
      value: frameWindow,
    });
    const sunEvents: string[] = [];
    frameDocument.querySelector('#toggle-sun')?.addEventListener(
      'input',
      () => sunEvents.push('input'),
    );
    frameDocument.querySelector('#toggle-sun')?.addEventListener(
      'change',
      () => sunEvents.push('change'),
    );

    iframe.dispatchEvent(new Event('load'));

    const chromeStyle = frameDocument.querySelector<HTMLStyleElement>(
      'style[data-mpkr-south-korea-map-chrome="styles"]',
    );
    expect(chromeStyle?.textContent).toContain('#header-container');
    expect(chromeStyle?.textContent).toContain('#footer-container');
    expect(chromeStyle?.textContent).toContain('#map-and-ride-finder-container');
    expect(frameDocument.documentElement.getAttribute(
      'data-mpkr-south-korea-map-chrome',
    )).toBe('true');
    expect(frameWindow.getComputedStyle(
      frameDocument.querySelector('#header-container') as never,
    ))
      .toHaveProperty('display', 'none');
    expect(frameWindow.getComputedStyle(
      frameDocument.querySelector('#footer-container') as never,
    ))
      .toHaveProperty('display', 'none');
    expect(frameDocument.querySelector('#sun-controls')).not.toBeNull();
    expect(frameDocument.querySelector('#toggle-sun')).not.toBeNull();
    expect(frameDocument.querySelector<HTMLInputElement>('#toggle-sun')?.checked).toBe(false);
    expect(sunEvents).toEqual([]);
    expect(frameDocument.querySelector('#sun-controls')?.textContent?.replace(/\s+/g, ' ').trim())
      .toBe('태양 각도 일출: 06:18 · 일몰: 18:28');
    expect(frameDocument.querySelector('#details-window')).not.toBeNull();
    expect(frameDocument.querySelector('#details-popup')).not.toBeNull();
    expect(frameDocument.querySelector('#zoom-control')).not.toBeNull();
    expect(frameDocument.querySelector('#where-play-map-key')).not.toBeNull();
    expect(frameDocument.querySelector('#attribution-popup')).not.toBeNull();
    expect(frameDocument.querySelector('#ap-map-container')?.hasAttribute('hidden'))
      .toBe(false);

    const status = document.querySelector<HTMLElement>(
      '.mpkr-south-korea-map__status',
    )!;
    expect(status.hidden).toBe(true);
    expect(status.textContent).toBe('');
    expect(status.hasAttribute('role')).toBe(false);

    const sunCheckbox = frameDocument.querySelector<HTMLInputElement>('#toggle-sun')!;
    iframe.dispatchEvent(new Event('load'));
    expect(sunCheckbox.checked).toBe(false);
    expect(sunEvents).toEqual([]);
    sunCheckbox.click();
    expect(sunCheckbox.checked).toBe(true);
    expect(sunEvents).toEqual(['input', 'change']);
    iframe.dispatchEvent(new Event('load'));
    expect(sunCheckbox.checked).toBe(true);
    expect(sunEvents).toEqual(['input', 'change']);

    embed.destroy();
    expect(sunCheckbox.checked).toBe(true);
    expect(frameDocument.querySelector('#sun-controls')?.textContent?.replace(/\s+/g, ' ').trim())
      .toBe('Sun Angles Sunrise: 06:18 · Sunset: 18:28');
    expect(frameDocument.querySelector(
      'style[data-mpkr-south-korea-map-chrome="styles"]',
    )).toBeNull();
    expect(frameDocument.documentElement.getAttribute(
      'data-mpkr-south-korea-map-chrome',
    )).toBe('preexisting');
  });

  it('leaves the full original iframe document untouched when verified map chrome is absent', () => {
    const embed = createEmbed();
    const iframe = openMap(embed);
    const frameWindow = connectFrame(iframe);

    expect(frameWindow.document.querySelector(
      'style[data-mpkr-south-korea-map-chrome="styles"]',
    )).toBeNull();
    expect(frameWindow.document.documentElement.hasAttribute(
      'data-mpkr-south-korea-map-chrome',
    )).toBe(false);
  });

  it('reserves scroll space for a fixed access notice without changing the notice or attribution', async () => {
    const embed = createEmbed();
    const iframe = openMap(embed);
    const frameWindow = new HappyDOMWindow({ url: SOUTH_KOREA_MAP_URL });
    frameWindows.push(frameWindow);
    const frameDocument = frameWindow.document as unknown as Document;
    frameDocument.body.innerHTML = `
      <div id="map-and-ride-finder-container"><div id="ap-map-container">
        <a class="mapboxgl-ctrl-logo" href="https://www.mapbox.com/">Mapbox</a>
        <div id="attribution-popup" class="display-none" style="display: none">Copyright</div>
      </div></div>
      <div id="access-gate" style="position: fixed; bottom: 0"><a href="/auth/login">Login</a></div>
    `;
    Object.defineProperty(frameWindow, 'innerHeight', { configurable: true, value: 760 });
    const notice = frameDocument.querySelector<HTMLElement>('#access-gate')!;
    const attribution = frameDocument.querySelector('#attribution-popup')!;
    const noticeHtml = notice.outerHTML;
    const attributionHtml = attribution.outerHTML;
    let noticeHeight = 200;
    vi.spyOn(notice, 'getBoundingClientRect').mockImplementation(() => ({
      x: 0, y: 760 - noticeHeight, top: 760 - noticeHeight, bottom: 760,
      left: 0, right: 1218, width: 1218, height: noticeHeight,
    } as DOMRect));
    const resizeCallbacks: (() => void)[] = [];
    const disconnectResize = vi.fn();
    Object.defineProperty(frameWindow, 'ResizeObserver', {
      configurable: true,
      value: class {
        constructor(callback: () => void) { resizeCallbacks.push(callback); }
        observe(): void {}
        unobserve(): void {}
        disconnect(): void { disconnectResize(); }
      },
    });
    Object.defineProperty(iframe, 'contentDocument', { configurable: true, value: frameDocument });
    Object.defineProperty(iframe, 'contentWindow', { configurable: true, value: frameWindow });
    iframe.dispatchEvent(new Event('load'));

    const space = () => frameDocument.querySelector<HTMLElement>('[data-mpkr-map-notice-space]');
    expect(space()?.style.height).toBe('216px');
    expect(space()?.getAttribute('aria-hidden')).toBe('true');
    expect(frameDocument.querySelector('#access-gate')).toBe(notice);
    expect(notice.outerHTML).toBe(noticeHtml);
    expect(attribution.outerHTML).toBe(attributionHtml);

    noticeHeight = 280;
    resizeCallbacks[0]!();
    expect(space()?.style.height).toBe('296px');
    notice.style.display = 'none';
    await frameWindow.happyDOM.whenAsyncComplete();
    expect(space()).toBeNull();
    notice.style.display = '';
    await frameWindow.happyDOM.whenAsyncComplete();
    expect(space()?.style.height).toBe('296px');

    const finalNoticeHtml = notice.outerHTML;
    embed.destroy();
    expect(space()).toBeNull();
    expect(notice.outerHTML).toBe(finalNoticeHtml);
    expect(attribution.outerHTML).toBe(attributionHtml);
    expect(disconnectResize).toHaveBeenCalledOnce();
    resizeCallbacks[0]!();
    frameWindow.dispatchEvent(new frameWindow.Event('resize'));
    expect(space()).toBeNull();
  });

  it('handles late native notices and reloads without space for normal-flow notices or leftover observers', async () => {
    const embed = createEmbed();
    const iframe = openMap(embed);
    const frameWindow = new HappyDOMWindow({ url: SOUTH_KOREA_MAP_URL });
    frameWindows.push(frameWindow);
    const frameDocument = frameWindow.document as unknown as Document;
    frameDocument.body.innerHTML = '<div id="map-and-ride-finder-container"><div id="ap-map-container">Map</div></div>';
    Object.defineProperty(frameWindow, 'innerHeight', { configurable: true, value: 760 });
    Object.defineProperty(iframe, 'contentDocument', { configurable: true, value: frameDocument });
    Object.defineProperty(iframe, 'contentWindow', { configurable: true, value: frameWindow });
    iframe.dispatchEvent(new Event('load'));
    const spaces = () => frameDocument.querySelectorAll('[data-mpkr-map-notice-space]');
    expect(spaces()).toHaveLength(0);

    const notice = frameDocument.createElement('div');
    notice.id = 'access-gate';
    notice.textContent = 'Join the Community';
    notice.style.position = 'static';
    vi.spyOn(notice, 'getBoundingClientRect').mockReturnValue({
      x: 0, y: 560, top: 560, bottom: 760, left: 0, right: 1218, width: 1218, height: 200,
    } as DOMRect);
    frameDocument.body.append(notice);
    await frameWindow.happyDOM.whenAsyncComplete();
    expect(spaces()).toHaveLength(0);
    notice.style.position = 'fixed';
    await frameWindow.happyDOM.whenAsyncComplete();
    expect(spaces()).toHaveLength(1);
    iframe.dispatchEvent(new Event('load'));
    await frameWindow.happyDOM.whenAsyncComplete();
    expect(spaces()).toHaveLength(1);

    notice.remove();
    await frameWindow.happyDOM.whenAsyncComplete();
    expect(spaces()).toHaveLength(0);
    embed.destroy();
    frameDocument.body.append(notice);
    frameWindow.dispatchEvent(new frameWindow.Event('resize'));
    await frameWindow.happyDOM.whenAsyncComplete();
    expect(spaces()).toHaveLength(0);
  });

  it('reapplies iframe presentation on reload without duplicate styles and restores the old document', () => {
    const embed = createEmbed();
    const iframe = openMap(embed);
    const firstWindow = new HappyDOMWindow({ url: SOUTH_KOREA_MAP_URL });
    frameWindows.push(firstWindow);
    const firstDocument = firstWindow.document as unknown as Document;
    firstDocument.body.innerHTML = `
      <div id="header-container">Header</div>
      <div id="map-and-ride-finder-container"><div id="ap-map-container">Map</div></div>
    `;
    Object.defineProperty(iframe, 'contentDocument', {
      configurable: true,
      value: firstDocument,
    });
    Object.defineProperty(iframe, 'contentWindow', {
      configurable: true,
      value: firstWindow,
    });

    iframe.dispatchEvent(new Event('load'));
    iframe.dispatchEvent(new Event('load'));

    expect(firstDocument.querySelectorAll(
      'style[data-mpkr-south-korea-map-chrome="styles"]',
    )).toHaveLength(1);

    const secondWindow = new HappyDOMWindow({ url: SOUTH_KOREA_MAP_URL });
    frameWindows.push(secondWindow);
    const secondDocument = secondWindow.document as unknown as Document;
    secondDocument.body.innerHTML = `
      <div id="header-container">Header</div>
      <div id="map-and-ride-finder-container"><div id="ap-map-container">Map</div></div>
    `;
    Object.defineProperty(iframe, 'contentDocument', {
      configurable: true,
      value: secondDocument,
    });
    Object.defineProperty(iframe, 'contentWindow', {
      configurable: true,
      value: secondWindow,
    });

    iframe.dispatchEvent(new Event('load'));

    expect(firstDocument.querySelector(
      'style[data-mpkr-south-korea-map-chrome="styles"]',
    )).toBeNull();
    expect(firstDocument.documentElement.hasAttribute(
      'data-mpkr-south-korea-map-chrome',
    )).toBe(false);
    expect(secondDocument.querySelectorAll(
      'style[data-mpkr-south-korea-map-chrome="styles"]',
    )).toHaveLength(1);
  });

  it('leaves the parent Area sidebar untouched during map interactions', () => {
    const areaSidebar = document.querySelector<HTMLElement>('.left-nav')!;
    const mainContent = document.querySelector<HTMLElement>('.main-content')!;
    const sidebarClass = areaSidebar.getAttribute('class');
    const sidebarStyle = areaSidebar.getAttribute('style');
    const sidebarId = areaSidebar.getAttribute('id');
    const mainClass = mainContent.getAttribute('class');
    const mainStyle = mainContent.getAttribute('style');
    const embed = createEmbed();
    const iframe = openMap(embed);
    const frameWindow = connectFrame(iframe);
    const mapContainer = frameWindow.document.createElement('div');
    mapContainer.id = 'ap-map-container';
    const mapControl = frameWindow.document.createElement('button');
    mapContainer.append(mapControl);
    frameWindow.document.body.append(mapContainer);

    mapControl.dispatchEvent(new frameWindow.Event('pointerdown', { bubbles: true }));
    mapControl.dispatchEvent(new frameWindow.Event('click', { bubbles: true }));
    mapControl.dispatchEvent(
      new frameWindow.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
    mapControl.dispatchEvent(new frameWindow.WheelEvent('wheel', { bubbles: true }));

    document.querySelector<HTMLElement>(
      '.mpkr-south-korea-map__toggle',
    )!.click();

    expect(areaSidebar.getAttribute('class')).toBe(sidebarClass);
    expect(areaSidebar.getAttribute('style')).toBe(sidebarStyle);
    expect(areaSidebar.getAttribute('id')).toBe(sidebarId);
    expect(mainContent.getAttribute('class')).toBe(mainClass);
    expect(mainContent.getAttribute('style')).toBe(mainStyle);
    expect(document.querySelector('.mpkr-south-korea-map__sidebar-toggle')).toBeNull();
  });

  it('opens existing and dynamic Mountain Project detail links in a protected new tab', async () => {
    const embed = createEmbed();
    const iframe = openMap(embed);
    const frameWindow = new HappyDOMWindow({ url: SOUTH_KOREA_MAP_URL });
    frameWindows.push(frameWindow);
    const frameDocument = frameWindow.document as unknown as Document;
    frameDocument.body.innerHTML = `
      <a id="existing-route" href="/route/123/a-route" target="_self" rel="bookmark"><span>Route</span></a>
      <div id="details-popup">
        <a id="area-details-btn" href="/area/123/an-area" target="map-frame">Area details</a>
        <a id="other-detail" href="/weather/area/123">Area weather</a>
        <a id="popup-close" href="#">Close</a>
      </div>
      <a id="photo-link" href="/photo/456/a-photo">Photo</a>
      <a id="profile-link" href="/user/789/a-user">Profile</a>
      <a id="route-guide" href="/route-guide">Route guide</a>
      <a id="map-link" href="/map/123/another-map">Another map</a>
      <a id="auth-link" href="/auth/login">Login</a>
      <a id="external-route" href="https://example.com/route/123/external">External</a>
    `;
    Object.defineProperty(iframe, 'contentDocument', {
      configurable: true,
      value: frameDocument,
    });
    Object.defineProperty(iframe, 'contentWindow', {
      configurable: true,
      value: frameWindow,
    });
    iframe.dispatchEvent(new Event('load'));

    const existingRoute = frameDocument.querySelector<HTMLAnchorElement>(
      '#existing-route',
    )!;
    const areaLink = frameDocument.querySelector<HTMLAnchorElement>('#area-details-btn')!;
    expect(existingRoute.target).toBe('_blank');
    expect(existingRoute.rel).toBe('noopener noreferrer');
    expect(areaLink.target).toBe('_blank');
    expect(areaLink.rel).toBe('noopener noreferrer');
    expect(frameDocument.querySelector('#other-detail')?.getAttribute('target'))
      .toBe('_blank');
    expect(frameDocument.querySelector('#photo-link')?.getAttribute('target'))
      .toBe('_blank');
    expect(frameDocument.querySelector('#profile-link')?.getAttribute('target'))
      .toBe('_blank');
    expect(frameDocument.querySelector('#route-guide')?.getAttribute('target'))
      .toBe('_blank');
    expect(frameDocument.querySelector('#popup-close')?.hasAttribute('target'))
      .toBe(false);
    expect(frameDocument.querySelector('#map-link')?.hasAttribute('target'))
      .toBe(false);
    expect(frameDocument.querySelector('#auth-link')?.hasAttribute('target'))
      .toBe(false);
    expect(frameDocument.querySelector('#external-route')?.hasAttribute('target'))
      .toBe(false);

    const dynamicRoute = frameDocument.createElement('a');
    dynamicRoute.href = '/route/456/dynamic-route';
    dynamicRoute.innerHTML = '<span>Dynamic route</span>';
    dynamicRoute.addEventListener('click', (event) => event.preventDefault());
    frameDocument.body.append(dynamicRoute);
    dynamicRoute.querySelector('span')!.dispatchEvent(
      new frameWindow.MouseEvent(
        'click',
        { bubbles: true, cancelable: true },
      ) as unknown as Event,
    );

    expect(dynamicRoute.target).toBe('_blank');
    expect(dynamicRoute.rel).toBe('noopener noreferrer');

    dynamicRoute.href = '/map/456/dynamic-map';
    await frameWindow.happyDOM.whenAsyncComplete();
    expect(dynamicRoute.hasAttribute('target')).toBe(false);
    expect(dynamicRoute.hasAttribute('rel')).toBe(false);

    embed.destroy();
    expect(existingRoute.target).toBe('_self');
    expect(existingRoute.rel).toBe('bookmark');
    expect(areaLink.target).toBe('map-frame');
    expect(areaLink.hasAttribute('rel')).toBe(false);

    const afterDestroyRoute = frameDocument.createElement('a');
    afterDestroyRoute.href = '/route/789/after-destroy';
    afterDestroyRoute.addEventListener('click', (event) => event.preventDefault());
    frameDocument.body.append(afterDestroyRoute);
    afterDestroyRoute.click();
    expect(afterDestroyRoute.hasAttribute('target')).toBe(false);
    expect(afterDestroyRoute.hasAttribute('rel')).toBe(false);
  });

  it('preserves native GET submission and opens navigation buttons without hijacking map controls', async () => {
    const embed = createEmbed();
    const iframe = openMap(embed);
    const frameWindow = connectFrame(iframe);
    const frameDocument = frameWindow.document as unknown as Document;
    const openSpy = vi.fn(() => null);
    Object.defineProperty(frameWindow, 'open', {
      configurable: true,
      value: openSpy,
    });
    frameDocument.body.innerHTML = `
      <div id="details-popup">
        <button id="area-button" data-href="/area/123/an-area">Details</button>
        <button id="photo-button" onclick="window.location.href='/photo/456/a-photo'">Photo</button>
        <form id="profile-form" method="get" action="/user/789/a-user?old=query" target="profile" rel="external opener">
          <input name="tab" value="ticks">
          <input name="source" value="map">
          <button id="profile-submit" type="submit" name="source" value="map">Profile</button>
        </form>
      </div>
      <button id="zoom-in" type="button">Zoom</button>
      <button id="layer-toggle" data-url="/map/106225629/south-korea?layer=sat">Layer</button>
      <form id="filter-form" method="get" action="/map/106225629/south-korea">
        <button id="filter-submit" type="submit">Filter</button>
      </form>
      <form id="post-form" method="post" action="/area/123/an-area">
        <button id="post-submit" type="submit">Save</button>
      </form>
    `;

    const areaEvent = new frameWindow.MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    });
    frameDocument.querySelector('#area-button')!.dispatchEvent(
      areaEvent as unknown as Event,
    );
    expect(areaEvent.defaultPrevented).toBe(true);
    expect(openSpy).toHaveBeenLastCalledWith(
      'https://www.mountainproject.com/area/123/an-area',
      '_blank',
      'noopener,noreferrer',
    );

    const photoEvent = new frameWindow.MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    });
    frameDocument.querySelector('#photo-button')!.dispatchEvent(
      photoEvent as unknown as Event,
    );
    expect(photoEvent.defaultPrevented).toBe(true);
    expect(openSpy).toHaveBeenLastCalledWith(
      'https://www.mountainproject.com/photo/456/a-photo',
      '_blank',
      'noopener,noreferrer',
    );

    const profileForm = frameDocument.querySelector<HTMLFormElement>(
      '#profile-form',
    )!;
    const profileSubmit = frameDocument.querySelector<HTMLButtonElement>(
      '#profile-submit',
    )!;
    const profileEvent = new frameWindow.SubmitEvent('submit', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(profileEvent, 'submitter', { value: profileSubmit });
    const siteSubmit = vi.fn();
    const siteFormData = vi.fn();
    profileForm.addEventListener('submit', siteSubmit);
    frameDocument.addEventListener('formdata', siteFormData);
    const originalForm = profileForm.outerHTML;
    expect(profileForm.dispatchEvent(profileEvent as unknown as Event)).toBe(true);
    expect(profileEvent.defaultPrevented).toBe(false);
    expect(siteSubmit).toHaveBeenCalledOnce();
    expect(profileForm.outerHTML).toBe(originalForm);
    // Happy DOM does not implement the browser's native formdata/default-action sequence.
    const formDataEvent = new frameWindow.Event('formdata', { bubbles: true });
    expect(profileForm.dispatchEvent(formDataEvent as unknown as Event)).toBe(true);
    expect(siteFormData).toHaveBeenCalledOnce();
    expect(formDataEvent.defaultPrevented).toBe(false);
    expect(profileForm.target).toBe('_blank');
    expect(profileForm.getAttribute('rel')).toBe('external opener noopener');
    expect(profileForm.getAttribute('action')).toBe('/user/789/a-user?old=query');
    expect(openSpy).toHaveBeenCalledTimes(2);
    await Promise.resolve();
    expect(profileForm.target).toBe('_blank');
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(profileForm.outerHTML).toBe(originalForm);

    const openCount = openSpy.mock.calls.length;
    frameDocument.querySelector<HTMLButtonElement>('#zoom-in')!.click();
    frameDocument.querySelector<HTMLButtonElement>('#layer-toggle')!.click();
    for (const id of ['filter-form', 'post-form']) {
      const form = frameDocument.querySelector<HTMLFormElement>(`#${id}`)!;
      const original = form.outerHTML;
      expect(form.dispatchEvent(new frameWindow.SubmitEvent('submit', {
        bubbles: true,
        cancelable: true,
      }) as unknown as Event)).toBe(true);
      form.dispatchEvent(new frameWindow.Event('formdata', { bubbles: true }) as unknown as Event);
      expect(form.outerHTML).toBe(original);
    }
    expect(openSpy).toHaveBeenCalledTimes(openCount);
  });

  it('honors submitter overrides and restores temporary formtarget on destroy', () => {
    const embed = createEmbed();
    const frameWindow = connectFrame(openMap(embed));
    const frameDocument = frameWindow.document as unknown as Document;
    frameDocument.head.innerHTML = '<base href="https://www.mountainproject.com/user/">';
    frameDocument.body.innerHTML = `
      <form method="post" action="/ajax/save" target="original" rel="noreferrer">
        <button formmethod="GET" formaction="789/a-user" formtarget="chosen">Profile</button>
      </form>
    `;
    const form = frameDocument.querySelector('form')!;
    const submitter = form.querySelector('button')!;
    const original = form.outerHTML;
    const submit = (): void => {
      const event = new frameWindow.SubmitEvent('submit', { bubbles: true, cancelable: true });
      Object.defineProperty(event, 'submitter', { value: submitter });
      expect(form.dispatchEvent(event as unknown as Event)).toBe(true);
      form.dispatchEvent(new frameWindow.Event('formdata', { bubbles: true }) as unknown as Event);
    };
    submit();
    expect(form.target).toBe('original');
    expect(submitter.getAttribute('formtarget')).toBe('_blank');
    expect(form.getAttribute('rel')).toBe('noreferrer noopener');
    submit();
    embed.destroy();
    expect(form.outerHTML).toBe(original);
    submit();
    expect(form.outerHTML).toBe(original);
  });

  it('leaves unknown popup forms and submitter POST/map overrides untouched', () => {
    const frameWindow = connectFrame(openMap(createEmbed()));
    const frameDocument = frameWindow.document as unknown as Document;
    frameDocument.body.innerHTML = `
      <div id="details-popup">
        <form action="/search"><button>Search</button></form>
        <form action="/user/789/a-user"><button formmethod="post">Save</button></form>
        <form action="/user/789/a-user"><button formaction="/map/106225629/south-korea">Filter</button></form>
      </div>
    `;
    for (const form of frameDocument.querySelectorAll('form')) {
      const original = form.outerHTML;
      const event = new frameWindow.SubmitEvent('submit', { bubbles: true, cancelable: true });
      Object.defineProperty(event, 'submitter', { value: form.querySelector('button') });
      expect(form.dispatchEvent(event as unknown as Event)).toBe(true);
      form.dispatchEvent(new frameWindow.Event('formdata', { bubbles: true }) as unknown as Event);
      expect(form.outerHTML).toBe(original);
    }
  });

  it('preserves node identity, order, classes and inline styles through destroy', () => {
    const areaSidebar = document.querySelector<HTMLElement>('.left-nav')!;
    const mainContent = document.querySelector<HTMLElement>('.main-content')!;
    const layoutRow = areaSidebar.parentElement!;
    const originalOrder = Array.from(layoutRow.children);
    const sidebarClass = areaSidebar.getAttribute('class');
    const sidebarStyle = areaSidebar.getAttribute('style');
    const mainClass = mainContent.getAttribute('class');
    const mainStyle = mainContent.getAttribute('style');
    const originalPreview = document.querySelector('.map-preview');
    const embed = createEmbed();
    const iframe = openMap(embed);
    const frameWindow = connectFrame(iframe);
    const mapContainer = frameWindow.document.createElement('div');
    mapContainer.id = 'ap-map-container';
    frameWindow.document.body.append(mapContainer);
    mapContainer.dispatchEvent(new frameWindow.Event('click', { bubbles: true }));

    embed.destroy();

    expect(document.querySelector('.left-nav')).toBe(areaSidebar);
    expect(document.querySelector('.main-content')).toBe(mainContent);
    expect(document.querySelector('.map-preview')).toBe(originalPreview);
    expect(Array.from(layoutRow.children)).toEqual(originalOrder);
    expect(areaSidebar.getAttribute('class')).toBe(sidebarClass);
    expect(areaSidebar.getAttribute('style')).toBe(sidebarStyle);
    expect(areaSidebar.hasAttribute('id')).toBe(false);
    expect(mainContent.getAttribute('class')).toBe(mainClass);
    expect(mainContent.getAttribute('style')).toBe(mainStyle);
    expect(document.querySelector('[data-mp-korea-south-korea-map]')).toBeNull();
    expect(document.querySelector('style[data-mp-korea-south-korea-map]')).toBeNull();
  });

  it('keeps the full-page fallback usable when iframe DOM access is unavailable', () => {
    const embed = createEmbed();
    const iframe = openMap(embed);
    Object.defineProperty(iframe, 'contentDocument', {
      configurable: true,
      value: null,
    });
    Object.defineProperty(iframe, 'contentWindow', {
      configurable: true,
      value: null,
    });

    iframe.dispatchEvent(new Event('load'));

    const link = document.querySelector<HTMLAnchorElement>(
      '.mpkr-south-korea-map__external',
    )!;
    expect(document.querySelector('iframe')).toBe(iframe);
    expect(link.href).toBe(SOUTH_KOREA_MAP_URL);
    expect(link.target).toBe('_blank');
    expect(link.rel).toBe('noopener noreferrer');
    const status = document.querySelector<HTMLElement>(
      '.mpkr-south-korea-map__status',
    )!;
    expect(status.dataset.state).toBe('loaded-limited');
    expect(status.hidden).toBe(true);
    expect(status.textContent).toBe('');
    expect(status.hasAttribute('role')).toBe(false);
  });

  it('keeps an explicit original-page fallback available during timeout failure', () => {
    vi.useFakeTimers();
    const embed = createEmbed();
    openMap(embed);

    const link = document.querySelector<HTMLAnchorElement>(
      '.mpkr-south-korea-map__external',
    )!;
    const status = document.querySelector<HTMLElement>(
      '.mpkr-south-korea-map__status',
    )!;
    expect(link.href).toBe(SOUTH_KOREA_MAP_URL);
    expect(status.hidden).toBe(true);

    vi.advanceTimersByTime(15_000);
    expect(status.dataset.state).toBe('failed');
    expect(status.hidden).toBe(false);
    expect(status.textContent).toContain('원본 지도 링크');
    expect(status.getAttribute('role')).toBe('status');
  });

  it('mounts on a South Korea descendant from its breadcrumb and prefers that area map', () => {
    const childAreaUrl = new URL(
      'https://www.mountainproject.com/area/119631691/jeju-island',
    );
    const childMapUrl = 'https://www.mountainproject.com/map/119631691/jeju-island';
    document.querySelector<HTMLAnchorElement>('#original-map-link')!.href = childMapUrl;
    document.querySelector('#area-heading')!.insertAdjacentHTML('afterbegin', `
      <div class="mb-half small text-warm">
        <a href="/route-guide">All Locations</a> &gt;
        <a href="/area/106225629/south-korea">South Korea</a> &gt; Jeju Island
      </div>
    `);
    const embed = createEmbed();

    expect(embed.mount(document, childAreaUrl)).toBe(true);
    expect(document.querySelector<HTMLAnchorElement>(
      '.mpkr-south-korea-map__external',
    )?.href).toBe(childMapUrl);
    document.querySelector<HTMLElement>('.mpkr-south-korea-map__toggle')!.click();
    expect(document.querySelector<HTMLIFrameElement>(
      '.mpkr-south-korea-map__frame',
    )?.src).toBe(childMapUrl);
  });

  it('derives the current descendant map when no map link is present', () => {
    const childAreaUrl = new URL(
      'https://www.mountainproject.com/area/119631691/jeju-island',
    );
    document.querySelector('#area-heading')!.insertAdjacentHTML('afterbegin', `
      <nav aria-label="breadcrumb">
        <a href="/area/106225629/south-korea">South Korea</a> &gt; Jeju Island
      </nav>
    `);
    document.querySelector('#original-map-link')?.remove();
    const embed = createEmbed();

    expect(embed.mount(document, childAreaUrl)).toBe(true);
    expect(document.querySelector<HTMLAnchorElement>(
      '.mpkr-south-korea-map__external',
    )?.href).toBe('https://www.mountainproject.com/map/119631691/jeju-island');
  });

  it('is a no-op on other countries and when the Area layout is absent', () => {
    const embed = createEmbed();

    expect(embed.mount(
      document,
      new URL('https://www.mountainproject.com/area/119631691/jeju-island'),
    )).toBe(false);
    expect(document.querySelector('[data-mp-korea-south-korea-map]')).toBeNull();

    document.querySelector('.main-content')?.remove();
    expect(embed.mount(document, SOUTH_KOREA_AREA_URL)).toBe(false);
    expect(document.querySelector('[data-mp-korea-south-korea-map]')).toBeNull();
    expect(document.querySelector('style[data-mp-korea-south-korea-map]')).toBeNull();
  });
});
