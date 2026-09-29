import fixture from './fixtures/south-korea-area-list.html?raw';
import { SouthKoreaAreaList } from '@/ui/south-korea-area-list';

function rows(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('.lef-nav-row'));
}

function ids(): string[] {
  return rows().map((row) => row.querySelector('a')!.href.match(/\/area\/(\d+)/)![1]!);
}

describe('SouthKoreaAreaList', () => {
  let list: SouthKoreaAreaList;

  beforeEach(() => {
    document.head.innerHTML = '<base href="https://www.mountainproject.com/">';
    document.body.innerHTML = fixture;
    list = new SouthKoreaAreaList();
  });

  afterEach(() => {
    list.destroy();
  });

  it('shows confirmed names in Korean only and sorts by displayed total descending', () => {
    expect(list.mount()).toBe(true);

    expect(rows().map((row) => row.querySelector('.text-warm')!.textContent!.trim()))
      .toEqual(['194', '140', '91', '28', '26', '7', '1']);
    expect(rows().map((row) => row.querySelector('a')!.textContent!.trim())).toEqual([
      '서울/경기도(한국 북서부)',
      '경상북도/경상남도(한국 동부/남동부)',
      '강원도(한국 북동부)',
      '전라북도/전라남도(한국 남서부)',
      '충청북도/충청남도(한국 중서부/서부)',
      '제주도',
      '감악산(새벽벽), 파주시, 경기도(설마12교)',
    ]);
  });

  it('keeps the original order for tied totals and leaves unmapped proper names unchanged', () => {
    const container = document.querySelector<HTMLElement>('.max-height')!;
    const originalGangwon = rows()[1]!;
    const originalJeolla = rows()[5]!;
    originalJeolla.querySelector<HTMLElement>('.text-warm')!.textContent = '91';
    container.insertAdjacentHTML('afterbegin', `
      <div class="lef-nav-row"><a href="/area/999999999/unmapped-peak">Unmapped Peak</a>
      <span class="text-nowrap small"><span class="text-warm">500</span></span></div>
    `);

    list.mount();

    expect(rows()[0]!.querySelector('a')!.textContent).toBe('Unmapped Peak');
    const tied = rows().filter((row) => row.querySelector('.text-warm')!.textContent!.trim() === '91');
    expect(tied).toEqual([originalGangwon, originalJeolla]);
  });

  it('preserves row and anchor identity, hrefs, and attached events', () => {
    const originalRows = rows();
    const originalAnchors = originalRows.map((row) => row.querySelector<HTMLAnchorElement>('a')!);
    const originalHrefs = originalAnchors.map((anchor) => anchor.href);
    let clicks = 0;
    originalAnchors[0]!.addEventListener('click', (event) => {
      event.preventDefault();
      clicks += 1;
    });

    list.mount();

    expect(new Set(rows())).toEqual(new Set(originalRows));
    expect(new Set(rows().map((row) => row.querySelector('a')))).toEqual(new Set(originalAnchors));
    expect(originalAnchors.map((anchor) => anchor.href)).toEqual(originalHrefs);
    originalAnchors[0]!.click();
    expect(clicks).toBe(1);
  });

  it('restores exact names and original DOM order on destroy without reapply drift', () => {
    const originalIds = ids();
    const originalNames = rows().map((row) => row.querySelector('a')!.textContent);
    list.mount();
    list.mount();
    list.destroy();

    expect(ids()).toEqual(originalIds);
    expect(rows().map((row) => row.querySelector('a')!.textContent)).toEqual(originalNames);

    list.mount();
    expect(rows().map((row) => row.querySelector('.text-warm')!.textContent!.trim()))
      .toEqual(['194', '140', '91', '28', '26', '7', '1']);
  });

  it('reapplies after a dynamic rerender and remains idempotent', async () => {
    list.mount();
    const container = document.querySelector<HTMLElement>('.max-height')!;
    const fixtureContainer = document.createElement('div');
    fixtureContainer.innerHTML = fixture;
    container.innerHTML = fixtureContainer.firstElementChild!.innerHTML;

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(rows().map((row) => row.querySelector('.text-warm')!.textContent!.trim()))
      .toEqual(['194', '140', '91', '28', '26', '7', '1']);
    expect(rows().every((row) => !row.querySelector('a')!.textContent!.includes(' ('))).toBe(true);
    const orderedRows = rows();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(rows()).toEqual(orderedRows);
  });

  it('does not touch similarly named route lists', () => {
    document.body.innerHTML = `
      <div class="lef-nav-row"><a href="/route/123/example">Example Route</a>
      <span class="text-nowrap small"><span class="text-warm">999</span></span></div>
    `;

    expect(list.mount()).toBe(false);
    expect(document.body.textContent).toContain('Example Route');
  });
});
