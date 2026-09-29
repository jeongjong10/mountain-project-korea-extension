import fixture from './fixtures/south-korea-area-priority.html?raw';
import { SouthKoreaClassicRouteGrouping } from '@/ui/south-korea-classic-route-grouping';

const SOUTH_KOREA_URL = new URL(
  'https://www.mountainproject.com/area/106225629/south-korea',
);
const ASIA_URL = new URL('https://www.mountainproject.com/area/106661515/asia');

function groupLabels(table: HTMLTableElement): string[] {
  return Array.from(table.children)
    .filter((child): child is HTMLTableSectionElement => (
      child instanceof HTMLTableSectionElement && Boolean(child.dataset.mpkrAreaRouteGroup)
    ))
    .map((wrapper) => wrapper.querySelector<HTMLElement>(
      '.mpkr-area-route-group-heading',
    )!.textContent!.trim());
}

function groupRouteIds(table: HTMLTableElement, label: string): string[] {
  const wrapper = Array.from(table.children)
    .find((candidate) => candidate instanceof HTMLTableSectionElement
      && candidate.dataset.mpkrAreaRouteGroup === label)!;
  return Array.from(wrapper.children)
    .filter((child): child is HTMLTableRowElement => (
      child instanceof HTMLTableRowElement && child.classList.contains('route-row')
    ))
    .map((row) => row.id);
}

describe('SouthKoreaClassicRouteGrouping', () => {
  beforeEach(() => {
    document.head.innerHTML = '<base href="https://www.mountainproject.com/">';
    document.body.innerHTML = fixture;
  });

  it('groups Korea classic routes by their first explicit parent Area', () => {
    const grouping = new SouthKoreaClassicRouteGrouping();

    expect(grouping.mount(document, SOUTH_KOREA_URL)).toBe(true);
    const [mobile, desktop] = Array.from(
      document.querySelectorAll<HTMLTableElement>('table.route-table'),
    );

    expect(groupLabels(mobile!)).toEqual([
      '서울/경기도(한국 북서부)',
      '강원도(한국 북동부)',
      '지역 미표시',
    ]);
    expect(groupRouteIds(mobile!, '서울/경기도(한국 북서부)'))
      .toEqual(['mobile-seoul-one', 'mobile-seoul-two']);
    expect(groupLabels(desktop!)).toEqual([
      '서울/경기도(한국 북서부)',
      '강원도(한국 북동부)',
    ]);
  });

  it('does not inject Korea grouping on an unrelated Area URL', () => {
    const originalRows = Array.from(document.querySelectorAll('tr.route-row'));

    expect(new SouthKoreaClassicRouteGrouping().mount(document, ASIA_URL)).toBe(false);
    expect(document.querySelector('[data-mpkr-area-route-group]')).toBeNull();
    expect(Array.from(document.querySelectorAll('tr.route-row'))).toEqual(originalRows);
  });

  it('preserves route nodes and restores exact order on destroy', () => {
    const grouping = new SouthKoreaClassicRouteGrouping();
    const tables = Array.from(document.querySelectorAll<HTMLTableElement>('table.route-table'));
    const originalRows = tables.map((table) => (
      Array.from(table.querySelectorAll<HTMLTableRowElement>('tr.route-row'))
    ));
    const routeLink = document.querySelector<HTMLAnchorElement>('#mobile-seoul-one a')!;
    let clicks = 0;
    routeLink.addEventListener('click', (event) => {
      event.preventDefault();
      clicks += 1;
    });

    grouping.mount(document, SOUTH_KOREA_URL);
    grouping.mount(document, SOUTH_KOREA_URL);
    routeLink.click();
    expect(clicks).toBe(1);

    grouping.destroy();
    expect(document.querySelector('[data-mpkr-area-route-group]')).toBeNull();
    expect(document.querySelector('style[data-mpkr-south-korea-route-grouping]')).toBeNull();
    tables.forEach((table, index) => {
      expect(Array.from(table.querySelectorAll('tr.route-row'))).toEqual(originalRows[index]);
    });
  });
});
