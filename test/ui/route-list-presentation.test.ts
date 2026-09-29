import areaFixture from './fixtures/south-korea-area-priority.html?raw';
import { RouteListPresentation } from '@/ui/route-list-presentation';
import { SOUTH_KOREA_ROUTE_FINDER_FIXTURE } from '../fixtures/mountain-project/south-korea-route-finder';

async function flushMutations(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('RouteListPresentation', () => {
  beforeEach(() => {
    document.head.innerHTML = '<base href="https://www.mountainproject.com/">';
  });

  it('decorates classic and finder route rows without changing navigation or secondary controls', () => {
    document.body.innerHTML = `${areaFixture}${SOUTH_KOREA_ROUTE_FINDER_FIXTURE}`;
    const primary = document.querySelector<HTMLAnchorElement>('#desktop-seoul-one a[href*="/route/"]')!;
    const areaLink = document.querySelector<HTMLAnchorElement>('#desktop-seoul-one a[href*="/area/"]')!;
    const href = primary.getAttribute('href');
    let primaryClicks = 0;
    let secondaryClicks = 0;
    primary.addEventListener('click', (event) => { event.preventDefault(); primaryClicks += 1; });
    areaLink.addEventListener('click', (event) => { event.preventDefault(); secondaryClicks += 1; });
    const presentation = new RouteListPresentation();

    expect(presentation.mount()).toBe(true);

    expect(document.querySelector('#desktop-seoul-one')?.classList.contains('mpkr-route-list-row')).toBe(true);
    expect(primary.classList.contains('mpkr-route-list-primary')).toBe(true);
    expect(primary.classList.contains('mpkr-route-list-primary-expanded')).toBe(true);
    expect(areaLink.classList.contains('mpkr-route-list-primary')).toBe(false);
    expect(primary.getAttribute('href')).toBe(href);

    const styles = Array.from(document.head.querySelectorAll('style'))
      .find((style) => style.hasAttribute('data-mpkr-route-list-presentation'))!.textContent!;
    expect(styles).toContain('tr.mpkr-route-list-row:hover > td');
    expect(styles).toContain('.mpkr-route-list-primary:focus-visible');
    expect(styles).not.toContain('::before');
    expect(styles).not.toContain('position: absolute');

    primary.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    areaLink.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(primaryClicks).toBe(1);
    expect(secondaryClicks).toBe(1);

    presentation.destroy();
    expect(primary.classList.contains('mpkr-route-list-primary')).toBe(false);
    expect(document.querySelector('.mpkr-route-list-row')).toBeNull();
    expect(document.querySelector('style[data-mpkr-route-list-presentation]')).toBeNull();
  });

  it('preserves inline ranks and metadata while expanding standalone route links', () => {
    // Route Guide desktop rows put the rank outside the route anchor.
    document.body.innerHTML = `<table class="route-table"><tbody>
      <tr class="route-row"><td>1. <a id="ranked" href="/route/105798994/high-exposure">High Exposure</a></td><td>5.6</td></tr>
      <tr class="route-row"><td><span>2. <a id="wrapped" href="/route/105835705/southeast-buttress">Southeast Buttress</a></span></td></tr>
      <tr class="route-row"><td><a id="badge" href="/route/3/three">Three</a> <span>New</span></td></tr>
      <tr class="route-row"><td> <!-- placeholder --> <a id="standalone" href="/route/4/four">Four</a> </td></tr>
    </tbody></table>`;
    const original = document.body.innerHTML;
    const presentation = new RouteListPresentation();
    presentation.mount();
    for (const id of ['ranked', 'wrapped', 'badge']) {
      const link = document.getElementById(id)!;
      expect(link.classList.contains('mpkr-route-list-primary')).toBe(true);
      expect(link.classList.contains('mpkr-route-list-primary-expanded')).toBe(false);
    }
    expect(document.getElementById('standalone')!.classList.contains('mpkr-route-list-primary-expanded')).toBe(true);
    presentation.destroy();
    expect(document.body.innerHTML).toBe(original);
  });

  it('supports dynamically inserted rows and excludes ratings, buttons, and secondary links from expansion', async () => {
    document.body.innerHTML = '<table class="route-table"><tbody id="routes"></tbody></table>';
    const presentation = new RouteListPresentation();
    presentation.mount();

    const row = document.createElement('tr');
    row.className = 'route-row';
    row.id = 'late-route';
    row.innerHTML = `
        <td><a id="late-primary" href="/route/999/late">Late Route</a></td>
        <td><a id="late-area" href="/area/123/area">Area Name</a></td>
        <td><a id="late-rating" class="rating" href="/route/999/late?rate=1">Rate</a></td>
        <td><button id="late-action" type="button">Menu</button></td>
    `;
    document.querySelector('#routes')!.append(row);
    await flushMutations();

    expect(document.querySelector('#late-route')?.classList.contains('mpkr-route-list-row')).toBe(true);
    expect(document.querySelector('#late-primary')?.classList.contains('mpkr-route-list-primary-expanded')).toBe(true);
    expect(document.querySelector('#late-area')?.classList.contains('mpkr-route-list-primary')).toBe(false);
    expect(document.querySelector('#late-rating')?.classList.contains('mpkr-route-list-primary')).toBe(false);
    expect(document.querySelector('#late-action')?.className).toBe('');
  });
});
