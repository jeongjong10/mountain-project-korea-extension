import asiaFixture from '../../../fixtures/mountain-project/asia-area.html?raw';
import { locateAreaPage } from '@/sites/mountain-project/dom/area-page';

const ASIA_URL = new URL('https://www.mountainproject.com/area/106661515/asia');

describe('locateAreaPage', () => {
  beforeEach(() => {
    document.head.innerHTML = '<base href="https://www.mountainproject.com/">';
    document.body.innerHTML = '';
  });

  it('locates the live Asia Area structure by route and semantic landmarks', () => {
    document.body.innerHTML = asiaFixture;

    const result = locateAreaPage(document, ASIA_URL);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.value.page.id).toBe('climb-area-page');
    expect(result.value.title.textContent).toContain('Asia');
  });

  it('tolerates wrapper and layout-class variations', () => {
    document.body.innerHTML = `
      <article id="climb-area-page">
        <header class="custom-header"><h1>Example Area Climbing</h1></header>
        <section class="custom-copy"><div class="fr-view">Authored copy</div></section>
      </article>
    `;

    const result = locateAreaPage(
      document,
      new URL('https://www.mountainproject.com/area/123456789/example-area'),
    );

    expect(result.ok).toBe(true);
  });

  it('does not require optional sidebar, photo, or route-list landmarks', () => {
    document.body.innerHTML = `
      <div id="climb-area-page">
        <h1>Minimal Area</h1>
        <table class="description-details"><tr><td>Elevation</td><td>100 m</td></tr></table>
      </div>
    `;

    const result = locateAreaPage(
      document,
      new URL('https://www.mountainproject.com/area/123456780/minimal-area'),
    );

    expect(result.ok).toBe(true);
  });

  it('rejects a non-Area URL and an Area root without semantic landmarks', () => {
    document.body.innerHTML = '<div id="climb-area-page"><h1>Looks Like an Area</h1></div>';

    expect(locateAreaPage(
      document,
      new URL('https://www.mountainproject.com/route/123456789/example-route'),
    ).ok).toBe(false);
    expect(locateAreaPage(
      document,
      new URL('https://www.mountainproject.com/area/123456789/example-area'),
    ).ok).toBe(false);
  });
});
