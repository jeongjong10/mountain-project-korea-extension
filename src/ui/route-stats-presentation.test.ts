import { PIGEON_ROUTE_STATS_FIXTURE } from '../test-fixtures/pigeon-route-stats';
import { RouteStatsPresentation } from './route-stats-presentation';

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

async function flushMutations(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('RouteStatsPresentation', () => {
  beforeEach(() => {
    document.head.innerHTML = '<base href="https://www.mountainproject.com/">';
    document.body.innerHTML = PIGEON_ROUTE_STATS_FIXTURE;
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

  it('creates a real viewport using exactly five measured rows and keeps More outside', () => {
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
    expect(viewport.getAttribute('aria-label')).toContain('5명씩 스크롤');
    expect(viewport.querySelectorAll('tbody > tr')).toHaveLength(9);
    expect(viewport.contains(more)).toBe(false);
    expect(more.parentElement?.classList.contains('mpkr-route-stats-more')).toBe(true);
  });

  it.each([
    ['Suggested Ratings', 1],
    ['Star Ratings', 3],
  ])('lets the %s list with %i rows shrink naturally', (sourceHeading, count) => {
    const section = statsSection(sourceHeading);
    const presentation = new RouteStatsPresentation();

    presentation.mount(document);

    const viewport = section.querySelector<HTMLElement>('.mpkr-route-stats-list-viewport')!;
    expect(viewport).not.toBeNull();
    expect(viewport.classList.contains('mpkr-route-stats-list-viewport--scrollable')).toBe(false);
    expect(viewport.style.getPropertyValue('--mpkr-stats-five-row-height')).toBe('');
    expect(viewport.hasAttribute('tabindex')).toBe(false);
    expect(viewport.querySelectorAll('tbody > tr')).toHaveLength(count);
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
    expect(todo.querySelector('button')?.closest('.mpkr-route-stats-list-viewport')).toBeNull();
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
    expect(document.querySelector('[data-mpkr-route-stats-presentation]')).toBeNull();
    expect(table.querySelectorAll('tbody > tr')).toHaveLength(9);
  });
});
