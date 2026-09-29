import { MountainProjectPageAdapter } from '@/sites/mountain-project/dom/page-adapter';

describe('MountainProjectPageAdapter', () => {
  beforeEach(() => {
    document.head.innerHTML = '<base href="https://www.mountainproject.com/">';
    document.body.innerHTML = '';
  });

  it('scopes the root and descendants through the South Korea breadcrumb', () => {
    const adapter = new MountainProjectPageAdapter();

    expect(adapter.isSouthKoreaPage(
      new URL('https://www.mountainproject.com/area/106225629/south-korea'),
    )).toBe(true);

    document.body.innerHTML = `
      <div class="breadcrumbs">
        <a href="/area/106225629/south-korea">S Korea</a>
        <a href="/area/106225638/insu-bong-bukhansan">Insu-bong</a>
      </div>
    `;
    expect(adapter.isSouthKoreaPage(
      new URL('https://www.mountainproject.com/route/106232568/chouinard-b'),
    )).toBe(true);

    document.body.innerHTML = '<a href="/area/105833388/yosemite-valley">Yosemite</a>';
    expect(adapter.isSouthKoreaPage(
      new URL('https://www.mountainproject.com/route/105924807/the-nose'),
    )).toBe(false);
  });

  it('scopes Route Finder authored translation to supported South Korea selections', () => {
    const adapter = new MountainProjectPageAdapter();

    expect(adapter.isSouthKoreaPage(new URL(
      'https://www.mountainproject.com/route-finder?selectedIds=106225629&type=rock',
    ))).toBe(true);
    expect(adapter.isSouthKoreaPage(new URL(
      'https://www.mountainproject.com/route-finder?selectedIds=119456750&type=rock',
    ))).toBe(true);
    expect(adapter.isSouthKoreaPage(new URL(
      'https://www.mountainproject.com/route-finder?selectedIds=105833388&type=rock',
    ))).toBe(false);

    document.body.innerHTML = `
      <form id="routeFinderForm">
        <input name="selectedIds" value="119456790">
        <span id="single-area-picker-name">Gangwon-do (Northeast Korea)</span>
      </form>
    `;
    expect(adapter.isSouthKoreaPage(new URL(
      'https://www.mountainproject.com/route-finder?type=rock',
    ))).toBe(true);
  });

  it('collects South Korea photo title, description, caption, and comments from the live DOM shape', () => {
    document.body.innerHTML = `
      <button id="all-photos" class="carousel-photos-button"
        onclick="return photoClicked(112102756);">All Photos</button>
      <div id="photo-popup-body">
        <div class="small pt-1 pb-2">
          <a href="/route-guide">All Locations</a> &gt;
          <a href="/area/105907743/international">International</a> &gt;
          <a href="/area/106661515/asia">Asia</a> &gt;
          <a href="/area/106225629/south-korea">S Korea</a>
        </div>
        <div class="row photo-core">
          <img id="original-photo" class="main-photo" src="/photo.jpg" alt="Original photo">
          <h1 class="photo-title">A granite wall above Seoul.</h1>
          <p class="photo-description">The southern face catches afternoon sun.</p>
          <div class="photo-caption">
            <a id="original-photo-link" href="/photo/112102756/original-caption">
              Climbers follow the long corner system.
            </a>
          </div>
        </div>
        <div class="comment-list">
          <table class="main-comment">
            <tr><td><div class="comment-body">
              <a class="author" href="/user/1/test-user">Test User</a>
              <span id="77-full">The upper pitches stay dry after light rain.</span>
              <time datetime="2026-09-18">September 18, 2026</time>
              <span class="comment-time"><a href="#Comment-77">Sep 18, 2026</a></span>
            </div></td></tr>
          </table>
        </div>
      </div>
    `;
    const adapter = new MountainProjectPageAdapter();
    const popup = document.querySelector<HTMLElement>('#photo-popup-body')!;
    const photo = document.querySelector('#original-photo');
    const link = document.querySelector<HTMLAnchorElement>('#original-photo-link')!;
    const button = document.querySelector<HTMLButtonElement>('#all-photos')!;
    const targets = adapter.collectCommentTargets(popup);

    expect(targets.map((target) => [target.category, target.semanticSource ?? target.source])).toEqual([
      ['description', 'A granite wall above Seoul.'],
      ['description', 'The southern face catches afternoon sun.'],
      ['description', 'Climbers follow the long corner system.'],
      ['comment', 'The upper pitches stay dry after light rain.'],
    ]);
    expect(targets[3]?.sourceElements).toEqual([
      document.getElementById('77-full'),
    ]);
    expect(targets.some((target) => target.source.includes('Test User'))).toBe(false);
    expect(targets.some((target) => target.source.includes('September 18'))).toBe(false);
    expect(document.querySelector('#original-photo')).toBe(photo);
    expect(document.querySelector('#original-photo-link')).toBe(link);
    expect(link.getAttribute('href')).toBe('/photo/112102756/original-caption');
    expect(document.querySelector('#all-photos')).toBe(button);
    expect(button.getAttribute('onclick')).toBe('return photoClicked(112102756);');
  });

  it.each([true, false])('collects non-Korea photos with breadcrumb=%s without enabling Korea features', (breadcrumb) => {
    document.body.innerHTML = `
      <div id="photo-popup-body">
        <div class="small pt-1 pb-2">
          <a href="/route-guide">All Locations</a> &gt;
          <a href="/area/105833388/yosemite-valley">Yosemite Valley</a>
        </div>
        <div class="photo-core">
          <span class="photo-title">A classic wall in Yosemite Valley.</span>
        </div>
      </div>
      <footer><a href="/area/106225629/south-korea">South Korea guide</a></footer>
    `;
    if (!breadcrumb) document.querySelector('#photo-popup-body > .small')?.remove();
    const adapter = new MountainProjectPageAdapter();
    const photoUrl = new URL(
      'https://www.mountainproject.com/photo/105924807/a-classic-wall-in-yosemite-valley',
    );

    expect(adapter.isSouthKoreaPage(photoUrl)).toBe(false);
    expect(adapter.collectCommentTargets().map((target) => target.source))
      .toEqual(['A classic wall in Yosemite Valley.']);
  });

  it('collects shared Area and Route text-section structures without replacing nodes', () => {
    document.body.innerHTML = `
      <div class="max-height">
        <h2 class="mt-2">Description <a href="#edit"><img alt="edit"></a></h2>
        <div class="fr-view">
          <p id="description">A classic granite line with sustained hand cracks.</p>
          <p><a href="https://example.com">https://example.com</a></p>
        </div>
      </div>
      <div class="max-height">
        <h2>Getting There</h2>
        <div class="fr-view"><p id="access">Take the subway and walk to the park entrance.</p></div>
      </div>
      <div class="max-height">
        <h2>Protection</h2>
        <div class="fr-view"><p id="safety">Bring cams and a sixty meter rope.</p></div>
      </div>
    `;
    const adapter = new MountainProjectPageAdapter();
    const description = document.querySelector<HTMLElement>('#description')!;
    const targets = adapter.collectPageTargets();

    expect(targets.map((target) => target.category)).toEqual([
      'description',
      'access',
      'safety',
    ]);
    expect(targets[0]?.sourceElements[0]).toBe(description);
    expect(targets.some((target) => target.source.startsWith('https://'))).toBe(false);
  });

  it('collects free-form legacy Area headings as inline targets and restores their DOM', () => {
    document.body.innerHTML = `
      <div id="climb-area-page">
        <div class="list-group mt-2">
          <div class="list-group-item">
            <h2 class="list-group-item-heading" data-toggle="collapse" data-target="#food-beta">
              Food Beta
              <a href="#edit"><strong>Edit</strong></a>
              <span class="expander"><img src="expand.svg"></span>
            </h2>
            <div id="food-beta" class="list-group-item-text">
              <div class="fr-view"><p>Try the bakery near the harbor.</p></div>
            </div>
          </div>
          <div class="list-group-item">
            <h2 class="list-group-item-heading" data-toggle="collapse" data-target="#guidebook">
              Guidebooks
            </h2>
            <div id="guidebook" class="list-group-item-text">
              <div class="fr-view"><p>Buy the local guidebook.</p></div>
            </div>
          </div>
        </div>
      </div>`;
    const before = document.body.innerHTML;
    const adapter = new MountainProjectPageAdapter();
    const heading = document.querySelector<HTMLHeadingElement>('.list-group-item-heading')!;
    const expander = heading.querySelector('.expander');
    const editLink = heading.querySelector('a');
    const sourceWhitespace = Array.from(heading.childNodes)
      .find((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.includes('Food Beta'))
      ?.textContent;
    const targets = adapter.collectPageTargets(document.querySelector('.list-group')!);

    expect(targets.map(({ source, renderMode }) => [source, renderMode])).toEqual([
      ['Food Beta', 'inline'],
      ['Try the bakery near the harbor.', undefined],
      ['Buy the local guidebook.', undefined],
    ]);
    const wrapper = document.querySelector<HTMLElement>('.mpkr-area-heading-source')!;
    expect(wrapper.textContent?.trim()).toBe('Food Beta');
    expect(wrapper.textContent).toBe(sourceWhitespace);
    expect(wrapper.children).toHaveLength(0);
    expect(heading.querySelector('.expander')).toBe(expander);
    expect(heading.querySelector('a')).toBe(editLink);
    expect(editLink?.querySelector('strong')?.textContent).toBe('Edit');

    adapter.restore();
    expect(document.body.innerHTML).toBe(before);
  });

  it('collects the live South Korea Getting There paragraph structure', () => {
    document.body.innerHTML = `
      <div class="mt-2 max-height max-height-xs-400 max-height-md-600">
        <h2>Getting There <a href="#"><img alt="Suggest change"></a></h2>
        <div class="fr-view">
          <p id="flights"><strong>Flights</strong></p>
          <p id="airport">Korea has two international airports on the peninsula.</p>
          <p id="trains"><strong>Trains</strong></p>
          <p id="rail">The KTX and SRT trains are comfortable and efficient.</p>
        </div>
      </div>
    `;
    const adapter = new MountainProjectPageAdapter();
    const targets = adapter.collectPageTargets();

    expect(targets.map((target) => target.semanticSource ?? target.source)).toEqual([
      'Flights',
      'Korea has two international airports on the peninsula.',
      'Trains',
      'The KTX and SRT trains are comfortable and efficient.',
    ]);
    expect(targets.every((target) => target.category === 'access')).toBe(true);
    expect(targets[0]?.sourceElements[0]).toBe(document.querySelector('#flights'));
    expect(targets[0]?.insertBefore).toBe(document.querySelector('#flights')?.nextSibling);
  });

  it('collects direct, div, and br-based editor content without nested duplicates or metadata', () => {
    document.body.innerHTML = `
      <section>
        <h2>Description</h2>
        <div class="fr-view" id="direct-description">
          Granite climbing above the city.<br>
          Expect long approaches in summer.
          <span class="author">Hidden Author</span>
          <time datetime="2026-09-18">September 18, 2026</time>
        </div>
      </section>
      <section>
        <h2>Getting There</h2>
        <div class="fr-view">
          <div class="editor-wrapper">
            <div id="div-access">Take the first bus.<br>Walk uphill from the last stop.</div>
          </div>
        </div>
      </section>
      <section>
        <h2>Location</h2>
        <div class="fr-view">
          <div class="layout-only"><p id="location">The cliff is north of the visitor center.</p></div>
          <div class="comment-body">
            <span class="author">Example User</span>
            <time datetime="2026-09-18">September 18, 2026</time>
          </div>
        </div>
      </section>
    `;
    const adapter = new MountainProjectPageAdapter();
    const targets = adapter.collectPageTargets();

    expect(targets.map((target) => target.semanticSource ?? target.source)).toEqual([
      'Granite climbing above the city. Expect long approaches in summer.',
      'Take the first bus. Walk uphill from the last stop.',
      'The cliff is north of the visitor center.',
    ]);
    expect(targets.map((target) => target.sourceElements[0]?.id)).toEqual([
      'direct-description',
      'div-access',
      'location',
    ]);
    expect(targets.some((target) => target.source.includes('Example User'))).toBe(false);
    expect(targets.some((target) => target.source.includes('September 18'))).toBe(false);
  });

  it('uses the full dynamic comment text while preserving author and date elements', () => {
    document.body.innerHTML = `
      <div class="comment-list">
        <table class="main-comment">
          <tr><td><a class="author">Karl Heine</a></td><td>
            <div class="comment-body">
              <span id="12-trimmed">The flake felt unstable... <a>more</a></span>
              <span id="12-full" style="display:none">The flake felt unstable near the end of pitch two.</span>
              <span class="comment-time"><a>May 24, 2014</a></span>
            </div>
          </td></tr>
        </table>
      </div>
    `;
    const adapter = new MountainProjectPageAdapter();
    const targets = adapter.collectCommentTargets();

    expect(targets).toHaveLength(1);
    expect(targets[0]?.source).toBe('The flake felt unstable near the end of pitch two.');
    expect(targets[0]?.sourceElements).toHaveLength(2);
    expect(document.querySelector('.author')?.textContent).toBe('Karl Heine');
    expect(document.querySelector('.comment-time')?.textContent).toBe('May 24, 2014');
  });
});
