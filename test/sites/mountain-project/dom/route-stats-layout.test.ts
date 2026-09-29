import {
  locateRouteStatsLayout,
  locateStatsFrameLandmarks,
} from '@/sites/mountain-project/dom/route-stats-layout';

const ROUTE_URL = new URL(
  'https://www.mountainproject.com/route/106232568/chouinard-b',
);
const STATS_PATH = '/route/stats/106232568/chouinard-b';
const STATS_URL = `https://www.mountainproject.com${STATS_PATH}`;

function summaryAndAction(): string {
  return `
    <div class="small mb-1" id="summary">
      <table class="description-details">
        <tr><td>Type</td><td>Trad</td></tr>
        <tr><td>Pitches</td><td>6</td></tr>
      </table>
    </div>
    <div id="you-and-route">
      <a href="${STATS_PATH}" id="stats-link">View Stats</a>
    </div>
  `;
}

function exactMarkup(): string {
  return `
    <div id="route-page">
      <main class="main-content">
        <div class="row" id="route-layout">
          <section class="col-lg-7 col-md-6" id="overview">
            ${summaryAndAction()}
          </section>
          <aside class="col-lg-5 col-md-6" id="onx-region">
            <div class="onx-explore"></div>
          </aside>
          <aside class="col-lg-5 col-md-6 hidden-sm-down" id="photo-region">
            <div id="photo-carousel"></div>
          </aside>
        </div>
      </main>
    </div>
  `;
}

describe('Mountain Project route-stats semantic locator', () => {
  beforeEach(() => {
    document.head.innerHTML = '<base href="https://www.mountainproject.com/">';
    document.body.innerHTML = '';
  });

  it('uses the current route layout as its preferred candidate', () => {
    document.body.innerHTML = exactMarkup();

    const result = locateRouteStatsLayout(document, ROUTE_URL);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.metadata).toMatchObject({
      component: 'route-stats-embed',
      key: 'route-layout',
      candidate: 'bootstrap-v4',
      fallback: false,
    });
    expect(result.value.row.id).toBe('route-layout');
    expect(result.value.overview.id).toBe('overview');
    expect(result.value.auxiliaryRegions.map(({ id }) => id))
      .toEqual(['onx-region', 'photo-region']);
    expect(result.value.statsHref).toBe(STATS_PATH);
    expect(result.value.statsUrl.href).toBe(STATS_URL);
  });

  it('survives changed Bootstrap column classes through semantic landmarks', () => {
    document.body.innerHTML = `
      <div id="route-page">
        <main class="main-content">
          <div class="route-grid" id="semantic-layout">
            <section class="route-overview" id="overview">${summaryAndAction()}</section>
            <aside class="route-aside" id="onx-region"><div class="onx-explore"></div></aside>
            <aside class="route-aside" id="photo-region"><div id="photo-carousel"></div></aside>
          </div>
        </main>
      </div>
    `;

    const result = locateRouteStatsLayout(document, ROUTE_URL);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.metadata.fallback).toBe(true);
    expect(result.metadata.candidate).toBe('semantic-landmarks');
    expect(result.value.row.id).toBe('semantic-layout');
  });

  it('finds distinct regions when wrappers are added around every landmark', () => {
    document.body.innerHTML = `
      <div id="route-page">
        <main class="main-content">
          <div class="route-shell" id="wrapped-layout">
            <div class="overview-wrapper" id="overview-wrapper">
              <section class="route-overview">${summaryAndAction()}</section>
            </div>
            <div class="onx-wrapper" id="onx-wrapper">
              <aside><div class="onx-explore"></div></aside>
            </div>
            <div class="photo-wrapper" id="photo-wrapper">
              <aside><div id="photo-carousel"></div></aside>
            </div>
          </div>
        </main>
      </div>
    `;

    const result = locateRouteStatsLayout(document, ROUTE_URL);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.metadata.fallback).toBe(true);
    expect(result.value.row.id).toBe('wrapped-layout');
    expect(result.value.overview.id).toBe('overview-wrapper');
    expect(result.value.auxiliaryRegions.map(({ id }) => id))
      .toEqual(['onx-wrapper', 'photo-wrapper']);
  });

  it('returns attempted exact and semantic contracts when a landmark is missing', () => {
    document.body.innerHTML = exactMarkup();
    document.querySelector('.onx-explore')?.remove();

    const result = locateRouteStatsLayout(document, ROUTE_URL);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.diagnostic).toMatchObject({
      component: 'route-stats-embed',
      key: 'auxiliary-regions',
      reason: 'onX landmark is missing.',
      page: ROUTE_URL.href,
    });
    expect(result.diagnostic.attemptedSelectors).toHaveLength(2);
    expect(result.attempts.map(({ candidate, outcome }) => [candidate, outcome])).toEqual([
      ['bootstrap-v4', 'invalid'],
      ['semantic-landmarks', 'missing'],
    ]);
  });

  it('reports an invalid or missing stats action as a structured failure', () => {
    document.body.innerHTML = exactMarkup();
    document.querySelector('#stats-link')?.setAttribute('href', '/route/106232568/chouinard-b');

    const result = locateRouteStatsLayout(document, ROUTE_URL);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.diagnostic).toMatchObject({
      component: 'route-stats-embed',
      key: 'stats-link',
      reason: 'Route stats link is missing or invalid',
      page: ROUTE_URL.href,
    });
    expect(result.diagnostic.attemptedSelectors).toEqual(['a[href*="/route/stats/"]']);
  });

  it('requires stats content, but not removable page chrome, inside the iframe', () => {
    document.body.innerHTML = `
      <section id="route-stats">
        <div class="onx-stats-table"></div>
      </section>
    `;

    const result = locateStatsFrameLandmarks(document, STATS_URL);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.stats.id).toBe('route-stats');

    document.body.innerHTML = '<div class="onx-stats-table" id="stats-fallback"></div>';
    const fallback = locateStatsFrameLandmarks(document, STATS_URL);
    expect(fallback.ok).toBe(true);
    if (!fallback.ok) return;
    expect(fallback.metadata.fallback).toBe(true);
    expect(fallback.value.stats.id).toBe('stats-fallback');

    document.body.innerHTML = '';
    const missing = locateStatsFrameLandmarks(document, STATS_URL);
    expect(missing.ok).toBe(false);
    if (missing.ok) return;
    expect(missing.diagnostic).toMatchObject({
      component: 'route-stats-frame',
      key: 'frame-landmarks',
      reason: 'Required Mountain Project landmark was not found.',
      page: STATS_URL,
    });
    expect(missing.diagnostic.attemptedSelectors).toEqual([
      '#route-stats',
      '.onx-stats-table',
    ]);
  });
});
