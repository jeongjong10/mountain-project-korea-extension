import { Window as HappyDOMWindow } from 'happy-dom';

import { RouteStatsPresentation } from '@/ui/route-stats-presentation';
import { PIGEON_ROUTE_STATS_FIXTURE } from '../fixtures/mountain-project/pigeon-route-stats';

function statsSection(sourceHeading: string): HTMLElement {
  const heading = Array.from(document.querySelectorAll<HTMLHeadingElement>('.onx-stats-table h3'))
    .find((candidate) => candidate.textContent?.includes(sourceHeading));
  return heading?.parentElement as HTMLElement;
}

function setRowHeights(section: HTMLElement, heights: readonly number[]): void {
  Array.from(section.querySelectorAll<HTMLTableRowElement>('tbody > tr')).forEach((row, index) => {
    vi.spyOn(row, 'getBoundingClientRect').mockReturnValue({
      height: heights[index] ?? heights.at(-1) ?? 0,
    } as DOMRect);
  });
}

function setScrollGeometry(
  viewport: HTMLElement,
  geometry: { clientHeight: number; scrollHeight: number; scrollTop: number },
): void {
  Object.defineProperties(viewport, {
    clientHeight: { configurable: true, value: geometry.clientHeight },
    scrollHeight: { configurable: true, value: geometry.scrollHeight },
    scrollTop: { configurable: true, value: geometry.scrollTop, writable: true },
  });
}

function ticksLayoutItem(root: ParentNode = document): HTMLElement {
  return root.querySelector<HTMLElement>('tr[id^="ticks."]')!
    .closest<HTMLElement>('.max-height')!;
}

async function flushMutations(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('RouteStatsPresentation', () => {
  beforeEach(() => {
    document.head.innerHTML = '<base href="https://www.mountainproject.com/">';
    document.body.innerHTML = PIGEON_ROUTE_STATS_FIXTURE;
  });

  it.each(['Star Ratings', 'Suggested Ratings', 'On To-Do Lists'])('shows arriving %s rows after an empty initial render with zero geometry', async (heading) => {
    const section = statsSection(heading);
    const body = section.querySelector('tbody')!;
    body.replaceChildren();
    const presentation = new RouteStatsPresentation();
    presentation.mount();
    for (let index = 0; index < 12; index++) {
      body.insertRow().insertCell().textContent = `Person ${index}`;
    }
    await flushMutations();
    const viewport = section.querySelector<HTMLElement>('.mpkr-route-stats-list-viewport')!;
    expect(body.querySelectorAll('tr:not([hidden])')).toHaveLength(5);
    expect(Number.parseFloat(viewport.style.getPropertyValue('--mpkr-stats-five-row-height'))).toBeGreaterThan(0);
    expect(viewport.hidden).toBe(false);
    presentation.destroy();
    expect(body.querySelectorAll('tr:not([hidden])')).toHaveLength(12);
  });

  it('keeps compact section heights synchronized while preserving native loading', async () => {
    const todo = statsSection('On To-Do Lists');
    const button = todo.querySelector<HTMLButtonElement>('button')!;
    const click = vi.fn();
    button.addEventListener('click', click);
    setRowHeights(todo, [30, 30, 30, 30, 30]);
    const presentation = new RouteStatsPresentation();
    presentation.mount();
    const viewport = todo.querySelector<HTMLElement>('.mpkr-route-stats-list-viewport')!;
    const peers = [...document.querySelectorAll<HTMLElement>('.mpkr-route-stats-list-viewport')].filter((item) => item !== viewport);
    expect(peers.map((item) => item.style.getPropertyValue('--mpkr-stats-five-row-height')))
      .toEqual(['150px', '150px']);
    expect(viewport.style.getPropertyValue('--mpkr-stats-five-row-height')).toBe('150px');
    button.click();
    button.click();
    expect(viewport.style.getPropertyValue('--mpkr-stats-five-row-height')).toBe('150px');
    viewport.dispatchEvent(new WheelEvent('wheel', { deltaY: 40 }));
    await vi.waitFor(() => expect(viewport.style.getPropertyValue('--mpkr-stats-five-row-height')).toBe('300px'));
    await flushMutations();
    expect(click).toHaveBeenCalledTimes(2);
    expect(viewport.style.getPropertyValue('--mpkr-stats-five-row-height')).toBe('300px');
    expect(peers.map((item) => item.style.getPropertyValue('--mpkr-stats-five-row-height')))
      .toEqual(['300px', '300px']);
    presentation.mount();
    expect(viewport.style.getPropertyValue('--mpkr-stats-five-row-height')).toBe('300px');
    presentation.destroy();
    expect(todo.querySelector('.mpkr-route-stats-list-viewport')).toBeNull();
    button.click();
    expect(click).toHaveBeenCalledTimes(3);
  });

  it('finds the real ID-less React columns and visibly applies the improved headings', () => {
    const presentation = new RouteStatsPresentation();

    expect(presentation.mount(document)).toBe(true);

    const headings = Array.from(document.querySelectorAll('.onx-stats-table h3'))
      .map((heading) => heading.textContent?.replace(/\s+/g, ' ').trim());
    expect(headings).toContain('체감 난이도 1');
    expect(headings).toContain('사용자 별점 3');
    expect(headings).toContain('등반 예정자 9');
    expect(document.querySelector('#suggested-ratings-column')).toBeNull();
  });

  it('moves the original structural Ticks column below compact groups at full width', () => {
    const ticks = ticksLayoutItem();
    const parent = ticks.parentElement!;
    const originalNextSibling = ticks.nextSibling;
    const originalClass = ticks.getAttribute('class');
    const originalStyle = ticks.getAttribute('style');
    const heading = ticks.querySelector<HTMLHeadingElement>('h3')!;
    const link = ticks.querySelector<HTMLAnchorElement>('a')!;
    heading.classList.add('title-with-border-bottom');
    heading.firstChild!.nodeValue = '등반 기록 ';
    let clicks = 0;
    link.addEventListener('click', (event) => {
      event.preventDefault();
      clicks += 1;
    });
    const presentation = new RouteStatsPresentation();

    presentation.mount(document);

    expect(parent.lastElementChild).toBe(ticks);
    expect(ticks.classList.contains('mpkr-route-stats-ticks-column')).toBe(true);
    expect(heading.classList.contains('title-with-border-bottom')).toBe(true);
    expect(heading.textContent?.replace(/\s+/g, ' ').trim()).toBe('등반 기록 7');
    const ticksViewport = ticks.querySelector<HTMLElement>('.mpkr-route-stats-ticks-viewport')!;
    expect(ticksViewport.querySelector('table')).not.toBeNull();
    expect(ticksViewport.querySelectorAll('tbody > tr')).toHaveLength(7);
    expect(ticksViewport.getAttribute('role')).toBe('region');
    expect(ticksViewport.getAttribute('aria-label')).toBe('등반 기록 목록');
    const ticksMore = ticks.querySelector<HTMLButtonElement>('button')!;
    expect(ticksMore.parentElement?.classList.contains('mpkr-route-stats-ticks-more-hidden'))
      .toBe(false);
    link.click();
    expect(clicks).toBe(1);

    const style = document.querySelector<HTMLStyleElement>(
      'style[data-mpkr-route-stats-presentation="styles"]',
    )!;
    expect(style.textContent).toContain('flex: 0 0 100% !important');
    expect(style.textContent).toContain('width: 100% !important');
    expect(style.textContent).toContain('max-width: none !important');
    expect(style.textContent).toContain('max-height: 500px !important');
    expect(style.textContent).toContain('max-height: 200px !important');
    expect(style.textContent).toContain('overflow-y: auto !important');
    expect(style.textContent).not.toContain('.mpkr-route-stats-ticks-more-hidden');
    expect(style.textContent).not.toContain('display: table-row');
    expect(style.textContent).not.toContain('visibility: visible');
    expect(document.querySelectorAll('.mpkr-route-stats-ticks-column')).toHaveLength(1);

    presentation.destroy();

    expect(ticks.parentElement).toBe(parent);
    expect(ticks.nextSibling).toBe(originalNextSibling);
    expect(ticks.getAttribute('class')).toBe(originalClass);
    expect(ticks.getAttribute('style')).toBe(originalStyle);
    expect(ticks.querySelector('.mpkr-route-stats-ticks-viewport')).toBeNull();
    expect(ticks.querySelector('table')).not.toBeNull();
    expect(ticksMore.parentElement?.classList.contains('mpkr-route-stats-ticks-more-hidden'))
      .toBe(false);
    link.click();
    expect(clicks).toBe(2);
  });

  it('lets the three remaining first-row sections share the available width equally', () => {
    const ticks = ticksLayoutItem();
    const row = ticks.parentElement!;
    const presentation = new RouteStatsPresentation();

    presentation.mount(document);

    const compactColumns = Array.from(row.children).filter(
      (column): column is HTMLElement => (
        column instanceof HTMLElement
        && column.classList.contains('mpkr-route-stats-compact-column')
      ),
    );
    expect(compactColumns).toHaveLength(3);
    expect(compactColumns.map((column) => (
      column.querySelector('h3')?.textContent?.replace(/\s+/g, ' ').trim()
    ))).toEqual([
      '체감 난이도 1',
      '사용자 별점 3',
      '등반 예정자 9',
    ]);

    const style = document.querySelector<HTMLStyleElement>(
      'style[data-mpkr-route-stats-presentation="styles"]',
    )!;
    expect(style.textContent).toContain('flex: 1 1 33.333333% !important');
    expect(style.textContent).toContain('max-width: 33.333333% !important');
    expect(style.textContent).toContain('flex: 0 0 100% !important');
    expect(style.textContent).toContain('max-width: 100% !important');
    expect(row.lastElementChild).toBe(ticks);
  });

  it('keeps the user name and partner-finder label in one row with name-first truncation', async () => {
    const todo = statsSection('On To-Do Lists');
    const body = todo.querySelector('tbody')!;
    body.innerHTML = `
      <tr id="partner-row"><td><a href="/user/900000012">A Very Long User Name</a><div class="small text-warm">In Partner Finder</div></td></tr>
      <tr id="plain-row"><td><a href="/user/900000013">Plain To-Do User</a></td></tr>
    `;
    const presentation = new RouteStatsPresentation();

    presentation.mount(document);

    const cell = todo.querySelector<HTMLTableCellElement>('#partner-row td')!;
    const name = cell.querySelector<HTMLAnchorElement>('a')!;
    const label = cell.querySelector<HTMLElement>('.small.text-warm')!;
    const plainCell = todo.querySelector<HTMLTableCellElement>('#plain-row td')!;
    const style = document.querySelector<HTMLStyleElement>(
      'style[data-mpkr-route-stats-presentation="styles"]',
    )!;
    expect(cell.classList.contains('mpkr-route-stats-partner-finder-cell')).toBe(true);
    expect(name.classList.contains('mpkr-route-stats-partner-finder-name')).toBe(true);
    expect(label.classList.contains('mpkr-route-stats-partner-finder-label')).toBe(true);
    expect(plainCell.classList.contains('mpkr-route-stats-partner-finder-cell')).toBe(false);
    expect(style.textContent).toContain('display: flex');
    expect(style.textContent).toContain('gap: 0.375rem');
    expect(style.textContent).toContain('flex: 1 1 auto');
    expect(style.textContent).toContain('flex: 0 0 auto');
    expect(style.textContent).toContain('white-space: nowrap');
    expect(style.textContent).toContain('text-overflow: ellipsis');
    expect(style.textContent).toContain('font-size: 0.75rem');
    expect(style.textContent).toContain('min-width: 0');

    body.innerHTML = '<tr id="translated-row"><td><a href="/user/900000014">동적으로 갱신된 긴 사용자 이름</a><div class="small text-warm">파트너 찾기에 등록됨</div></td></tr>';
    await flushMutations();
    const translatedCell = todo.querySelector<HTMLTableCellElement>('#translated-row td')!;
    expect(translatedCell.classList.contains('mpkr-route-stats-partner-finder-cell')).toBe(true);
    expect(translatedCell.querySelector('a')?.classList.contains(
      'mpkr-route-stats-partner-finder-name',
    )).toBe(true);
    expect(translatedCell.querySelector('.small.text-warm')?.classList.contains(
      'mpkr-route-stats-partner-finder-label',
    )).toBe(true);

    presentation.destroy();
    expect(translatedCell.getAttribute('class')).toBeNull();
    expect(translatedCell.querySelector('a')?.getAttribute('class')).toBeNull();
    expect(translatedCell.querySelector('.small.text-warm')?.getAttribute('class'))
      .toBe('small text-warm');
  });

  it('uses one measured height for all three compact summary viewports', () => {
    const sections = ['Suggested Ratings', 'Star Ratings', 'On To-Do Lists']
      .map((heading) => statsSection(heading));
    for (const [sectionIndex, section] of sections.entries()) {
      const body = section.querySelector<HTMLTableSectionElement>('tbody')!;
      while (body.children.length < 6) {
        body.insertRow().insertCell().textContent = `Person ${body.children.length + 1}`;
      }
      setRowHeights(section, Array.from({ length: 6 }, () => 28 + sectionIndex * 4));
    }
    const presentation = new RouteStatsPresentation();

    presentation.mount(document);

    const viewports = sections.map((section) => (
      section.querySelector<HTMLElement>('.mpkr-route-stats-list-viewport')!
    ));
    expect(viewports.map((viewport) => (
      viewport.style.getPropertyValue('--mpkr-stats-five-row-height')
    ))).toEqual(['180px', '180px', '180px']);
    expect(viewports.every((viewport) => (
      viewport.classList.contains('mpkr-route-stats-list-viewport--scrollable')
    ))).toBe(true);
  });

  it('uses structural Ticks landmarks instead of translated heading text alone', () => {
    const ticks = ticksLayoutItem();
    ticks.querySelector('h3')!.firstChild!.nodeValue = '구조로 찾는 기록 ';
    const fake = document.createElement('div');
    fake.id = 'not-ticks';
    fake.innerHTML = `
      <h3>등반 기록 <span>99</span></h3>
      <table><tbody><tr><td>Unrelated</td></tr></tbody></table>
    `;
    ticks.parentElement!.append(fake);
    const presentation = new RouteStatsPresentation();

    presentation.mount(document);

    expect(ticks.classList.contains('mpkr-route-stats-ticks-column')).toBe(true);
    expect(fake.classList.contains('mpkr-route-stats-ticks-column')).toBe(false);
    expect(ticks.parentElement?.lastElementChild).toBe(ticks);
  });

  it('creates a five-row viewport with More at the scrollable end', () => {
    const todo = statsSection('On To-Do Lists');
    setRowHeights(todo, [30, 32, 34, 36, 38, 40, 42, 44, 46]);
    const more = todo.querySelector<HTMLButtonElement>('button')!;
    const presentation = new RouteStatsPresentation();

    presentation.mount(document);

    const viewport = todo.querySelector<HTMLElement>('.mpkr-route-stats-list-viewport')!;
    expect(viewport).not.toBeNull();
    expect(viewport.classList.contains('mpkr-route-stats-list-viewport--scrollable')).toBe(true);
    expect(viewport.style.getPropertyValue('--mpkr-stats-five-row-height')).toBe('170px');
    expect(viewport.getAttribute('tabindex')).toBe('0');
    expect(viewport.getAttribute('role')).toBe('region');
    expect(viewport.getAttribute('aria-label')).toContain('추가 항목이 있으며 5명씩 스크롤 가능');
    const affordance = viewport.querySelector<HTMLElement>(
      '.mpkr-route-stats-scroll-affordance',
    )!;
    expect(affordance.hidden).toBe(false);
    expect(affordance.getAttribute('aria-hidden')).toBe('true');
    expect(affordance.textContent).toContain('더 있음');
    expect(viewport.querySelectorAll('tbody > tr')).toHaveLength(9);
    expect(viewport.contains(more)).toBe(true);
    expect(viewport.querySelectorAll('tr:not([hidden])')).toHaveLength(5);
    expect(more.parentElement?.classList.contains('mpkr-route-stats-more')).toBe(true);
  });

  it.each([
    ['Suggested Ratings', 1],
    ['Star Ratings', 3],
  ])('keeps short %s lists aligned within the shared summary height', (sourceHeading, count) => {
    const section = statsSection(sourceHeading);
    const presentation = new RouteStatsPresentation();

    presentation.mount(document);

    const viewport = section.querySelector<HTMLElement>('.mpkr-route-stats-list-viewport')!;
    expect(viewport).not.toBeNull();
    expect(viewport.classList.contains('mpkr-route-stats-list-viewport--scrollable')).toBe(false);
    expect(viewport.style.getPropertyValue('--mpkr-stats-five-row-height')).toBe('180px');
    expect(viewport.hasAttribute('tabindex')).toBe(false);
    expect(viewport.querySelector<HTMLElement>(
      '.mpkr-route-stats-scroll-affordance',
    )?.hidden).toBe(true);
    expect(viewport.querySelectorAll('tbody > tr')).toHaveLength(count);
  });

  it('shows no additional-items affordance for exactly five rows', () => {
    const section = statsSection('Suggested Ratings');
    const body = section.querySelector<HTMLTableSectionElement>('tbody')!;
    body.replaceChildren();
    for (let index = 0; index < 5; index++) {
      body.insertRow().insertCell().textContent = `Person ${index + 1}`;
    }
    const presentation = new RouteStatsPresentation();

    presentation.mount(document);

    const viewport = section.querySelector<HTMLElement>('.mpkr-route-stats-list-viewport')!;
    const affordance = viewport.querySelector<HTMLElement>(
      '.mpkr-route-stats-scroll-affordance',
    )!;
    expect(viewport.classList.contains('mpkr-route-stats-list-viewport--scrollable')).toBe(false);
    expect(viewport.hasAttribute('aria-label')).toBe(false);
    expect(affordance.hidden).toBe(true);
  });

  it('hides the additional-items affordance at the end and restores it above the end', () => {
    const todo = statsSection('On To-Do Lists');
    const presentation = new RouteStatsPresentation();
    presentation.mount(document);
    const viewport = todo.querySelector<HTMLElement>('.mpkr-route-stats-list-viewport')!;
    const affordance = viewport.querySelector<HTMLElement>(
      '.mpkr-route-stats-scroll-affordance',
    )!;
    setScrollGeometry(viewport, { clientHeight: 180, scrollHeight: 360, scrollTop: 180 });

    viewport.dispatchEvent(new Event('scroll'));

    expect(affordance.classList.contains(
      'mpkr-route-stats-scroll-affordance--hidden',
    )).toBe(true);

    viewport.scrollTop = 72;
    viewport.dispatchEvent(new Event('scroll'));

    expect(affordance.classList.contains(
      'mpkr-route-stats-scroll-affordance--hidden',
    )).toBe(false);
  });

  it('removes the affordance DOM and its scroll listener on destroy without duplication', () => {
    const todo = statsSection('On To-Do Lists');
    const presentation = new RouteStatsPresentation();
    presentation.mount(document);
    presentation.mount(document);
    const viewport = todo.querySelector<HTMLElement>('.mpkr-route-stats-list-viewport')!;
    const affordance = viewport.querySelector<HTMLElement>(
      '.mpkr-route-stats-scroll-affordance',
    )!;
    expect(viewport.querySelectorAll('.mpkr-route-stats-scroll-affordance')).toHaveLength(1);
    setScrollGeometry(viewport, { clientHeight: 180, scrollHeight: 360, scrollTop: 180 });
    viewport.dispatchEvent(new Event('scroll'));
    expect(affordance.classList.contains(
      'mpkr-route-stats-scroll-affordance--hidden',
    )).toBe(true);

    presentation.destroy();
    viewport.scrollTop = 0;
    viewport.dispatchEvent(new Event('scroll'));

    expect(document.querySelector('.mpkr-route-stats-scroll-affordance')).toBeNull();
    expect(affordance.classList.contains(
      'mpkr-route-stats-scroll-affordance--hidden',
    )).toBe(true);
  });

  it('keeps a five-row viewport when Show More appends rows dynamically', async () => {
    const todo = statsSection('On To-Do Lists');
    setRowHeights(todo, [28, 30, 32, 34, 36, 38, 40, 42, 44]);
    const presentation = new RouteStatsPresentation();
    presentation.mount(document);
    const viewport = todo.querySelector<HTMLElement>('.mpkr-route-stats-list-viewport')!;
    const body = todo.querySelector<HTMLTableSectionElement>('tbody')!;

    const appended = document.createElement('tr');
    appended.innerHTML = '<td><a href="/user/10">Person 10</a></td>';
    body.append(appended);
    await flushMutations();

    expect(viewport.style.getPropertyValue('--mpkr-stats-five-row-height')).toBe('160px');
    expect(viewport.querySelectorAll('tbody > tr')).toHaveLength(10);
    expect(todo.querySelector('button')?.closest('.mpkr-route-stats-list-viewport')).toBe(viewport);
  });

  it('reapplies the full-width layout to an AJAX replacement and restores its exact position', async () => {
    const original = ticksLayoutItem();
    const replacement = original.cloneNode(true) as HTMLElement;
    replacement.setAttribute('class', 'replacement col-lg-3');
    replacement.setAttribute('style', 'color: rgb(1, 2, 3)');
    replacement.querySelectorAll<HTMLElement>('tr[id^="ticks."]').forEach((row, index) => {
      row.id = `ticks.dynamic-${index}`;
    });
    const parent = original.parentElement!;
    const presentation = new RouteStatsPresentation();
    presentation.mount(document);

    original.remove();
    const originalFirstChild = parent.firstChild;
    parent.insertBefore(replacement, originalFirstChild);
    await flushMutations();

    expect(parent.lastElementChild).toBe(replacement);
    expect(replacement.classList.contains('mpkr-route-stats-ticks-column')).toBe(true);
    expect(document.querySelectorAll('.mpkr-route-stats-ticks-column')).toHaveLength(1);

    presentation.destroy();

    expect(parent.firstChild).toBe(replacement);
    expect(replacement.nextSibling).toBe(originalFirstChild);
    expect(replacement.getAttribute('class')).toBe('replacement col-lg-3');
    expect(replacement.getAttribute('style')).toBe('color: rgb(1, 2, 3)');
  });

  it('applies the same transform inside an iframe stats document without duplicate ownership', () => {
    const frameWindow = new HappyDOMWindow({
      url: 'https://www.mountainproject.com/route/stats/127049143/pigeon',
    });
    const frameDocument = frameWindow.document as unknown as Document;
    frameDocument.body.innerHTML = PIGEON_ROUTE_STATS_FIXTURE;
    const frameTodoHeading = Array.from(
      frameDocument.querySelectorAll<HTMLHeadingElement>('.onx-stats-table h3'),
    ).find((heading) => heading.textContent?.includes('On To-Do Lists'))!;
    frameTodoHeading.parentElement!.querySelector('td')!.insertAdjacentHTML(
      'beforeend',
      '<div class="small text-warm">In Partner Finder</div>',
    );
    const primary = new RouteStatsPresentation();
    const duplicate = new RouteStatsPresentation();

    expect(primary.mount(frameDocument)).toBe(true);
    expect(duplicate.mount(frameDocument)).toBe(true);

    const ticks = ticksLayoutItem(frameDocument);
    expect(ticks.parentElement?.lastElementChild).toBe(ticks);
    expect(ticks.classList.contains('mpkr-route-stats-ticks-column')).toBe(true);
    expect(frameDocument.querySelectorAll(
      'style[data-mpkr-route-stats-presentation="styles"]',
    )).toHaveLength(1);
    const frameStyle = frameDocument.querySelector<HTMLStyleElement>(
      'style[data-mpkr-route-stats-presentation="styles"]',
    )!;
    expect(frameStyle.textContent).toContain('max-height: 500px !important');
    expect(frameStyle.textContent).toContain('max-height: 200px !important');
    expect(frameDocument.querySelector(
      '.mpkr-route-stats-partner-finder-label',
    )?.textContent).toBe('In Partner Finder');
    expect(frameDocument.querySelector(
      '.mpkr-route-stats-partner-finder-cell > .mpkr-route-stats-partner-finder-name + .mpkr-route-stats-partner-finder-label',
    )).not.toBeNull();
    expect(Array.from(frameDocument.querySelectorAll<HTMLElement>(
      '.mpkr-route-stats-list-viewport',
    )).map((viewport) => (
      viewport.style.getPropertyValue('--mpkr-stats-five-row-height')
    ))).toEqual(['180px', '180px', '180px']);
    expect(frameDocument.querySelectorAll('.mpkr-route-stats-ticks-viewport')).toHaveLength(1);
    expect(frameDocument.querySelector(
      '.mpkr-route-stats-ticks-column .mpkr-route-stats-ticks-more-hidden',
    )).toBeNull();
    expect(frameDocument.querySelectorAll('.mpkr-route-stats-list-viewport')).toHaveLength(3);

    duplicate.destroy();
    expect(ticks.classList.contains('mpkr-route-stats-ticks-column')).toBe(true);
    primary.destroy();
    expect(ticks.classList.contains('mpkr-route-stats-ticks-column')).toBe(false);
    expect(frameDocument.querySelector('.mpkr-route-stats-ticks-viewport')).toBeNull();
    expect(frameDocument.querySelector('.mpkr-route-stats-ticks-more-hidden')).toBeNull();
    frameWindow.close();
  });

  it('preserves the Ticks row-expansion control and compact list controls', () => {
    const ticks = ticksLayoutItem();
    const ticksMore = ticks.querySelector<HTMLButtonElement>('button')!;
    const todo = statsSection('On To-Do Lists');
    const todoMore = todo.querySelector<HTMLButtonElement>('button')!;
    const presentation = new RouteStatsPresentation();

    presentation.mount(document);

    expect(ticksMore.parentElement?.classList.contains('mpkr-route-stats-ticks-more-hidden'))
      .toBe(false);
    expect(todoMore.parentElement?.classList.contains('mpkr-route-stats-ticks-more-hidden'))
      .toBe(false);
    expect(todoMore.parentElement?.classList.contains('mpkr-route-stats-more')).toBe(true);
    expect(ticks.querySelectorAll('.mpkr-route-stats-ticks-viewport tbody > tr')).toHaveLength(7);

    presentation.destroy();

    expect(ticksMore.parentElement?.classList.contains('mpkr-route-stats-ticks-more-hidden'))
      .toBe(false);
    expect(todoMore.parentElement?.classList.contains('mpkr-route-stats-more')).toBe(false);
  });

  it('uses a mobile-safe owned scroll wrapper instead of ineffective tbody overflow', () => {
    const todo = statsSection('On To-Do Lists');
    const presentation = new RouteStatsPresentation();
    presentation.mount(document);
    const style = document.querySelector('style[data-mpkr-route-stats-presentation="styles"]')!;
    const body = todo.querySelector('tbody')!;

    expect(body.classList.contains('mpkr-route-stats-list--scrollable')).toBe(false);
    expect(todo.querySelector('.mpkr-route-stats-list-viewport > table')).not.toBeNull();
    expect(style.textContent).toContain('overflow-y: auto');
    expect(style.textContent).toContain('overflow-x: auto');
    expect(style.textContent).toContain('touch-action: pan-y');
    expect(style.textContent).toContain('.mpkr-route-stats-more');
    expect(style.textContent).toContain('@media (max-width: 767px)');
  });

  it('is idempotent and restores headings, table placement, classes, and More presentation', () => {
    const todo = statsSection('On To-Do Lists');
    const table = todo.querySelector<HTMLTableElement>('table')!;
    const originalParent = table.parentElement;
    const originalColumnClass = originalParent?.parentElement?.getAttribute('class');
    const more = todo.querySelector<HTMLButtonElement>('button')!.parentElement!;
    const originalMoreClass = more.getAttribute('class');
    const presentation = new RouteStatsPresentation();

    presentation.mount(document);
    presentation.mount(document);
    expect(document.querySelectorAll('.mpkr-route-stats-list-viewport')).toHaveLength(3);

    presentation.destroy();

    expect(todo.querySelector('h3')?.textContent?.replace(/\s+/g, ' ').trim())
      .toBe('On To-Do Lists 9');
    expect(table.parentElement).toBe(originalParent);
    expect(originalParent?.parentElement?.getAttribute('class')).toBe(originalColumnClass);
    expect(more.getAttribute('class')).toBe(originalMoreClass);
    expect(document.querySelector('.mpkr-route-stats-list-viewport')).toBeNull();
    expect(document.querySelector('.mpkr-route-stats-ticks-viewport')).toBeNull();
    expect(document.querySelector('.mpkr-route-stats-ticks-more-hidden')).toBeNull();
    expect(document.querySelector('[data-mpkr-route-stats-presentation]')).toBeNull();
    expect(table.querySelectorAll('tbody > tr')).toHaveLength(9);
  });
});
