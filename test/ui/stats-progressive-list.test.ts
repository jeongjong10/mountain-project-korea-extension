import { StatsProgressiveList } from '@/ui/stats-progressive-list';

describe('StatsProgressiveList', () => {
  let frames: FrameRequestCallback[];
  beforeEach(() => {
    frames = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    document.body.innerHTML = '<section><div id="viewport"><table><tbody></tbody></table></div><div id="more"><button>Show More</button></div></section>';
  });
  afterEach(() => vi.restoreAllMocks());
  const flush = () => frames.splice(0).forEach((callback) => callback(0));
  function setup(count: number, compact = false) {
    const viewport = document.querySelector<HTMLElement>('#viewport')!;
    const table = viewport.querySelector('table')!;
    const more = document.querySelector<HTMLElement>('#more')!;
    for (let i = 0; i < count; i++) table.insertRow().insertCell().textContent = `${i}`;
    const expand = vi.fn();
    const list = new StatsProgressiveList(table, viewport, compact, expand);
    list.refresh(more);
    const visible = () => table.querySelectorAll('tr:not([hidden])').length;
    const scroll = () => {
      viewport.scrollTop += 100;
      viewport.dispatchEvent(new Event('scroll'));
      flush();
    };
    return { list, viewport, table, more, expand, visible, scroll };
  }

  it('reveals 250 ticks in 20-row batches, throttles, and restores native controls', () => {
    const { list, viewport, table, more, visible, scroll } = setup(250);
    const clicked = vi.fn();
    more.querySelector('button')!.addEventListener('click', clicked);
    expect(visible()).toBe(20);
    expect(more.hidden).toBe(true);
    for (let i = 0; i < 50; i++) {
      viewport.scrollTop += 1;
      viewport.dispatchEvent(new Event('scroll'));
    }
    expect(frames).toHaveLength(1);
    flush();
    expect(visible()).toBe(40);
    for (let i = 0; i < 11; i++) scroll();
    expect(visible()).toBe(250);
    expect(more.hidden).toBe(false);
    more.querySelector('button')!.click();
    expect(clicked).toHaveBeenCalledOnce();
    for (let i = 0; i < 50; i++) table.insertRow().insertCell().textContent = 'new';
    list.refresh(more);
    expect(visible()).toBe(250);
    expect(more.hidden).toBe(true);
    scroll();
    expect(visible()).toBe(270);
    list.destroy();
    expect(visible()).toBe(300);
    expect(more.parentElement?.tagName).toBe('SECTION');
    expect(more.hidden).toBe(false);
  });

  it('expands five compact rows on first wheel intent and exposes ten at a time', () => {
    const { list, viewport, more, visible, expand, scroll } = setup(35, true);
    expect(visible()).toBe(5);
    viewport.dispatchEvent(new WheelEvent('wheel', { deltaY: 10 }));
    flush();
    expect(visible()).toBe(10);
    expect(expand).toHaveBeenCalledOnce();
    scroll();
    expect(visible()).toBe(20);
    scroll();
    expect(visible()).toBe(30);
    scroll();
    expect(visible()).toBe(35);
    expect(more.hidden).toBe(false);
    expect(expand).toHaveBeenCalledOnce();
    list.destroy();
  });

  it.each([true, false])('reveals arriving rows after an empty loading table (compact=%s)', (compact) => {
    const { list, table, more, visible } = setup(0, compact);
    list.refresh();
    for (let i = 0; i < 30; i++) table.insertRow().insertCell().textContent = `${i}`;
    list.refresh(more);
    expect(visible()).toBe(compact ? 5 : 20);
    expect(more.hidden).toBe(true);
    list.destroy();
    expect(visible()).toBe(30);
  });

  it.each([1, 4, 5])('retains the five-row budget when %i rows arrive first without More', (count) => {
    const { list, table, visible } = setup(count, true);
    list.refresh();
    expect(visible()).toBe(count);
    for (let i = count; i < 12; i++) table.insertRow().insertCell().textContent = `${i}`;
    list.refresh();
    expect(visible()).toBe(5);
    list.destroy();
  });

  it('keeps original hidden attributes and ignores queued work after destroy', () => {
    const { list, viewport, table, more } = setup(30);
    list.destroy();
    table.rows[25]!.setAttribute('hidden', 'until-found');
    const next = new StatsProgressiveList(table, viewport, false, () => {});
    next.refresh(more);
    viewport.scrollTop = 100;
    viewport.dispatchEvent(new Event('scroll'));
    next.destroy();
    flush();
    expect(table.rows[25]!.getAttribute('hidden')).toBe('until-found');
    expect(table.rows[26]!.hasAttribute('hidden')).toBe(false);
  });
});
