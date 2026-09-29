import asiaFixture from '../fixtures/mountain-project/asia-area.html?raw';
import { DirectPageLocalizer } from '@/localization/direct-page-localizer';
import { AreaPagePresentation } from '@/ui/area-page-presentation';
import { AreaPageSectionPresentation } from '@/ui/area-page-section-presentation';
import { LeftSidebarToggle } from '@/ui/left-sidebar-toggle';
import { RouteListPresentation } from '@/ui/route-list-presentation';
import { SouthKoreaClassicRouteGrouping } from '@/ui/south-korea-classic-route-grouping';
import { AreaMapEmbed } from '@/ui/area-map-embed';

const ASIA_URL = new URL('https://www.mountainproject.com/area/106661515/asia');

describe('generic Area-page behavior', () => {
  beforeEach(() => {
    (window as unknown as { happyDOM: { settings: { disableIframePageLoading: boolean } } })
      .happyDOM.settings.disableIframePageLoading = true;
    document.head.innerHTML = '<base href="https://www.mountainproject.com/">';
    document.body.innerHTML = asiaFixture;
  });

  it.each([ASIA_URL, new URL('https://www.mountainproject.com/area/105833388/yosemite-valley')])('mounts shared Area behavior and the Area map while excluding Korea-only features on %s', (currentUrl) => {
    const originalBody = document.body.innerHTML;
    const localizer = new DirectPageLocalizer();
    const photo = new AreaPagePresentation();
    const sections = new AreaPageSectionPresentation();
    const sidebar = new LeftSidebarToggle();
    const routes = new RouteListPresentation();
    const map = new AreaMapEmbed();
    const grouping = new SouthKoreaClassicRouteGrouping();

    localizer.apply(document);
    expect(photo.mount(document)).toBe(true);
    expect(sections.mount(document)).toBe(true);
    expect(sidebar.mount(document)).toBe(1);
    expect(routes.mount(document)).toBe(true);
    expect(map.mount(document, currentUrl)).toBe(true);
    expect(grouping.mount(document, currentUrl)).toBe(false);

    expect(document.querySelector('.mpkr-area-photo')).not.toBeNull();
    expect(document.querySelector('.mpkr-left-sidebar-rail')).not.toBeNull();
    expect(document.querySelector('#asia-route-one')?.classList.contains('mpkr-route-list-row'))
      .toBe(true);
    expect(document.querySelector('#asia-route-one .mpkr-route-list-primary-expanded'))
      .not.toBeNull();

    const headings = Array.from(
      document.querySelectorAll<HTMLHeadingElement>('.mpkr-area-section-heading'),
    );
    const bodies = Array.from(
      document.querySelectorAll<HTMLElement>('.mpkr-area-section-body'),
    );
    expect(headings).toHaveLength(4);
    expect(headings.map((heading) => heading.getAttribute('aria-expanded')))
      .toEqual(['false', 'false', 'false', 'false']);
    expect(bodies).toHaveLength(4);
    expect(bodies.every((body) => body.hidden)).toBe(true);
    expect(bodies.some((body) => body.querySelector('#asia-description'))).toBe(true);
    expect(bodies.some((body) => body.querySelector('#asia-access'))).toBe(true);

    expect(document.querySelector('#travel-info')).not.toBeNull();
    expect(document.querySelector('#helpful-hints')).not.toBeNull();
    expect(document.querySelector('#passport-copy')?.closest('.mpkr-area-section-body')).not.toBeNull();
    expect(document.querySelector('#hint-copy')?.closest('.mpkr-area-section-body')).not.toBeNull();
    expect(document.body.textContent).toContain('여행 정보');
    expect(document.body.textContent).toContain('유용한 팁');

    expect(document.body.textContent).toContain('Asia의 지역');
    expect(document.body.textContent).toContain('모든 루트 표시');
    expect(document.querySelector<HTMLAnchorElement>('.mpkr-south-korea-map__external')?.href)
      .toBe(currentUrl.href.replace('/area/', '/map/'));
    document.querySelector<HTMLElement>('.mpkr-south-korea-map__toggle')!.click();
    expect(document.querySelector<HTMLIFrameElement>('iframe')?.src)
      .toBe(currentUrl.href.replace('/area/', '/map/'));
    expect(map.mount(document, currentUrl)).toBe(true);
    expect(document.querySelectorAll('iframe')).toHaveLength(1);
    expect(document.querySelector('[data-mpkr-area-route-group]')).toBeNull();
    expect(document.querySelector('#south-korea-row a')?.textContent).toBe('South Korea');
    expect(Array.from(document.querySelectorAll('.lef-nav-row')).map((row) => row.id))
      .toEqual(['japan-row', 'south-korea-row']);

    routes.destroy();
    sidebar.destroy();
    sections.destroy();
    photo.destroy();
    grouping.destroy();
    map.destroy();
    localizer.restore();

    expect(document.body.innerHTML).toBe(originalBody);
  });
});
