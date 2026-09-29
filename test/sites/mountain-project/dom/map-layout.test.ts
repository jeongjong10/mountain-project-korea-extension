import {
  locateAreaMapLayout,
  locateMapFrameLandmarks,
} from '@/sites/mountain-project/dom/map-layout';

const AREA_URL = new URL(
  'https://www.mountainproject.com/area/106225629/south-korea',
);
const MAP_URL = 'https://www.mountainproject.com/map/106225629/south-korea';
const ASIA_AREA_URL = new URL('https://www.mountainproject.com/area/106661515/asia');

function exactMarkup(): string {
  return `
    <div id="climb-area-page">
      <div class="row pt-main-content" id="layout">
        <aside class="col-md-3 left-nav" id="sidebar">
          <div class="mp-sidebar">
            <a href="/map/106225629/south-korea" id="map-link">
              <span class="map-preview">Map</span>
            </a>
          </div>
        </aside>
        <main class="col-md-9 main-content" id="content"></main>
      </div>
    </div>
  `;
}

describe('Mountain Project area-map semantic locator', () => {
  beforeEach(() => {
    document.head.innerHTML = '<base href="https://www.mountainproject.com/">';
    document.body.innerHTML = '';
  });

  it('uses the current Bootstrap layout as its preferred candidate', () => {
    document.body.innerHTML = exactMarkup();

    const result = locateAreaMapLayout(document, AREA_URL);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.metadata).toMatchObject({
      component: 'south-korea-map',
      key: 'area-layout',
      candidate: 'bootstrap-v4',
      fallback: false,
    });
    expect(result.value.layoutRow.id).toBe('layout');
    expect(result.value.areaSidebar.id).toBe('sidebar');
    expect(result.value.mainContent.id).toBe('content');
    expect(result.value.mapUrl).toBe(MAP_URL);
  });

  it('survives changed Bootstrap column classes through semantic landmarks', () => {
    document.body.innerHTML = `
      <div id="climb-area-page">
        <section class="area-layout" id="semantic-layout">
          <aside class="left-nav" id="sidebar">
            <div class="mp-sidebar">
              <a href="/map/106225629/south-korea" id="map-link">Map</a>
            </div>
          </aside>
          <main class="main-content" id="content"></main>
        </section>
      </div>
    `;

    const result = locateAreaMapLayout(document, AREA_URL);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.metadata.fallback).toBe(true);
    expect(result.metadata.candidate).toBe('semantic-fallback');
    expect(result.value.layoutRow.id).toBe('semantic-layout');
    expect(result.value.mapLink?.id).toBe('map-link');
  });

  it('finds a safe common layout when wrappers are added around both regions', () => {
    document.body.innerHTML = `
      <div id="climb-area-page">
        <section class="area-shell" id="wrapped-layout">
          <div class="sidebar-wrapper">
            <aside class="left-nav" id="sidebar">
              <div class="mp-sidebar">
                <a href="/map/106225629/south-korea">Map</a>
              </div>
            </aside>
          </div>
          <div class="content-wrapper">
            <main class="main-content" id="content"></main>
          </div>
        </section>
      </div>
    `;

    const result = locateAreaMapLayout(document, AREA_URL);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.metadata.fallback).toBe(true);
    expect(result.value.layoutRow.id).toBe('wrapped-layout');
    expect(result.value.areaSidebar.id).toBe('sidebar');
    expect(result.value.mainContent.id).toBe('content');
  });

  it('derives the current Asia map without falling back to South Korea', () => {
    document.body.innerHTML = exactMarkup();
    document.querySelector('#map-link')?.remove();

    const result = locateAreaMapLayout(document, ASIA_AREA_URL);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.mapUrl).toBe('https://www.mountainproject.com/map/106661515/asia');
    expect(result.value.mapUrl).not.toBe(MAP_URL);
  });

  it.each([
    '',
    'https://www.mountainproject.com/map/106225629/south-korea',
    'https://example.com/map/105833388/yosemite-valley',
    'https://www.mountainproject.com/map/105833388/yosemite-valley?view=satellite',
  ])('resolves a non-Asia Area with map link %s', (href) => {
    document.body.innerHTML = exactMarkup();
    document.querySelector('#map-link')!.setAttribute('href', href);
    const result = locateAreaMapLayout(document, new URL('https://www.mountainproject.com/area/105833388/yosemite-valley'));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.mapUrl).toBe(
      'https://www.mountainproject.com/map/105833388/yosemite-valley'
      + (href.endsWith('?view=satellite') ? '?view=satellite' : ''),
    );
  });

  it('returns an actionable structured diagnostic when main content is missing', () => {
    document.body.innerHTML = exactMarkup();
    document.querySelector('#content')?.remove();

    const result = locateAreaMapLayout(document, AREA_URL);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.diagnostic).toMatchObject({
      component: 'south-korea-map',
      key: 'main-content',
      reason: 'Required Mountain Project landmark was not found.',
      page: AREA_URL.href,
    });
    expect(result.diagnostic.attemptedSelectors).toEqual([
      '#climb-area-page .row.pt-main-content > .col-md-9.main-content',
      '#climb-area-page .main-content',
    ]);
    expect(result.attempts.every(({ outcome }) => outcome === 'missing')).toBe(true);
  });

  it('requires map content, but not removable page chrome, inside the iframe', () => {
    document.body.innerHTML = `
      <div id="map-and-ride-finder-container">
        <div id="ap-map-container"></div>
      </div>
    `;

    const result = locateMapFrameLandmarks(document, MAP_URL);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.map.id).toBe('ap-map-container');
    expect(result.metadata.fallback).toBe(false);

    document.querySelector('#map-and-ride-finder-container')?.remove();
    const missing = locateMapFrameLandmarks(document, MAP_URL);
    expect(missing.ok).toBe(false);
    if (missing.ok) return;
    expect(missing.diagnostic).toMatchObject({
      component: 'south-korea-map-frame',
      key: 'frame-landmarks',
      reason: 'map landmark missing.',
      page: MAP_URL,
    });
  });
});
