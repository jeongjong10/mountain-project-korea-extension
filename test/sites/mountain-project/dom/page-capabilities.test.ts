import { resolveMountainProjectPageCapabilities } from '@/sites/mountain-project/dom/page-capabilities';

const resolve = (path: string) => resolveMountainProjectPageCapabilities(
  new URL(path, 'https://www.mountainproject.com'),
);

describe('global page capabilities', () => {
  beforeEach(() => {
    document.head.innerHTML = '<base href="https://www.mountainproject.com/">';
    document.body.innerHTML = '';
  });

  it.each([
    ['106225629/south-korea', true, true],
    ['106661515/asia', true, false],
    ['105833388/yosemite-valley', false, false],
  ])('enables valid Area %s', (area, asiaScope, southKoreaEnhancements) => {
    document.body.innerHTML = '<div id="climb-area-page"><h1>Area</h1><div class="fr-view">Description</div></div>';
    expect(resolve(`/area/${area}`)).toMatchObject({
      pageKind: 'area', asiaScope, southKoreaEnhancements,
      authoredTranslation: true, areaMap: true, routeSectionPresentation: false,
    });
  });

  it.each([
    ['106225629/south-korea', true, true],
    ['106661515/asia', true, false],
    ['105833388/yosemite-valley', false, false],
  ])('enables valid Route under %s', (area, asiaScope, southKoreaEnhancements) => {
    document.body.innerHTML = `<div id="route-page"><nav aria-label="breadcrumb"><a href="/route-guide">All Locations</a>${asiaScope ? '<a href="/area/106661515/asia">Asia</a>' : ''}<a href="/area/${area}">Location</a></nav></div>`;
    expect(resolve('/route/105924807/the-nose')).toMatchObject({
      pageKind: 'route', asiaScope, southKoreaEnhancements,
      authoredTranslation: true, routeSectionPresentation: true, areaMap: false,
    });
  });

  it.each(['106225629', '106661515', '105833388'])('enables Finder selection %s', (id) => {
    expect(resolve(`/route-finder?selectedIds=${id}`).authoredTranslation).toBe(true);
    document.body.innerHTML = `<form id="routeFinderForm"><input name="selectedIds" value="${id}"></form>`;
    expect(resolve('/route-finder').authoredTranslation).toBe(true);
  });

  it('enables a Finder form without a selected region and Photo without breadcrumbs', () => {
    document.body.innerHTML = '<form id="routeFinderForm"></form>';
    expect(resolve('/route-finder').authoredTranslation).toBe(true);
    document.body.innerHTML = '<div class="photo-core"><img src="/photo.jpg"><p class="photo-caption">Granite wall</p></div>';
    expect(resolve('/photo/105924807/wall')).toMatchObject({
      authoredTranslation: true, asiaScope: false, southKoreaEnhancements: false,
    });
  });

  it.each(['/area/106661515/asia', '/route/105924807/the-nose', '/photo/123/wall', '/route-finder?selectedIds=invalid'])('rejects missing DOM/context on %s', (path) => {
    expect(resolve(path)).toMatchObject({ authoredTranslation: false, areaMap: false, routeSectionPresentation: false });
  });

  it.each([
    ['/help', '<div id="help-page"></div>', 'help'],
    ['/help/999/future-topic', '<div id="help-page"></div>', 'help'],
    ['/help-hub', '<div id="help-hub-page"></div>', 'help-hub'],
    ['/about', '<div id="about-page"></div>', 'about'],
    ['/name-review-process', '<div id="name-review-process"></div>', 'name-review'],
  ])('enables structurally valid Help content at %s', (path, html, pageKind) => {
    document.body.innerHTML = html;
    expect(resolve(path)).toMatchObject({ pageKind, authoredTranslation: true });
  });

  it.each(['/user/123/name', '/user/123/name/community', '/user/123/name/contributions', '/contact-user/123', '/forum', '/help', '/help-hub', '/about', '/name-review-process', '/route/stats/123/name'])('does not expand authored capabilities to %s without its landmark', (path) => {
    document.body.innerHTML = '<div id="route-page"><div class="photo-core"></div></div>';
    expect(resolve(path).authoredTranslation).toBe(false);
  });

  it.each(['/forum', '/forum/latest', '/forum/123/section?page=2', '/forum/topic/456/topic?page=2#reply'])('enables authored forum content with its landmark at %s', (path) => {
    document.body.innerHTML = '<table id="forum-table"></table>';
    expect(resolve(path).authoredTranslation).toBe(true);
  });

  it.each(['/forum/topic/456/topic', '/add/forum-topic/123', '/add/forum-message/456', '/edit/forum-message/789'])('leaves missing posts and private editor content outside authored translation at %s', (path) => {
    document.body.innerHTML = '<form><div class="fr-view" contenteditable="true">Private draft</div></form>';
    expect(resolve(path).authoredTranslation).toBe(false);
  });

  it('enables forum search title translation only with the search landmark', () => {
    expect(resolve('/search?q=rope').authoredTranslation).toBe(false);
    document.body.innerHTML = '<div id="onx-search"></div>';
    expect(resolve('/search?q=rope').authoredTranslation).toBe(true);
  });

  it('rejects other origins even with valid DOM', () => {
    document.body.innerHTML = '<div id="route-page"></div>';
    expect(resolveMountainProjectPageCapabilities(new URL('https://example.com/route/123/name')).authoredTranslation).toBe(false);
  });
});
