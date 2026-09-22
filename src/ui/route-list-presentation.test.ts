import areaFixture from './fixtures/south-korea-area-priority.html?raw';
import routeFinderFixture from '../test-fixtures/south-korea-route-finder';
import { RouteListPresentation } from './route-list-presentation';

async function flushMutations(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('RouteListPresentation', () => {
  beforeEach(() => {
    document.head.innerHTML = '<base href="https://www.mountainproject.com/">';
  });

  it('decorates classic and finder route rows without changing navigation or secondary controls', () => {
    document.body.innerHTML = `${areaFixture}${routeFinderFixture}`;
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
    primary.click();
    areaLink.click();
    expect(primaryClicks).toBe(1);
    expect(secondaryClicks).toBe(1);

    const styles = document.querySelector<HTMLStyleElement>('style[data-mpkr-route-list-presentation]')!.textContent!;
    expect(styles).toContain('tr.mpkr-route-list-row:hover > td');
    expect(styles).toContain('.mpkr-route-list-primary:focus-visible');
    expect(styles).not.toContain('::before');
    expect(styles).not.toContain('position: absolute');

    presentation.destroy();
    expect(primary.classList.contains('mpkr-route-list-primary')).toBe(false);
    expect(document.querySelector('.mpkr-route-list-row')).toBeNull();
    expect(document.querySelector('style[data-mpkr-route-list-presentation]')).toBeNull();
  });

  it('supports dynamically inserted rows and excludes ratings, buttons, and secondary links from expansion', async () => {
    document.body.innerHTML = '<table class="route-table"><tbody id="routes"></tbody></table>';
    const presentation = new RouteListPresentation();
    presentation.mount();

    document.querySelector('#routes')!.insertAdjacentHTML('beforeend', `
      <tr class="route-row" id="late-route">
        <td><a id="late-primary" href="/route/999/late">Late Route</a></td>
        <td><a id="late-area" href="/area/123/area">Area Name</a></td>
        <td><a id="late-rating" class="rating" href="/route/999/late?rate=1">Rate</a></td>
        <td><button id="late-action" type="button">Menu</button></td>
      </tr>
    `);
    await flushMutations();

    expect(document.querySelector('#late-route')?.classList.contains('mpkr-route-list-row')).toBe(true);
    expect(document.querySelector('#late-primary')?.classList.contains('mpkr-route-list-primary-expanded')).toBe(true);
    expect(document.querySelector('#late-area')?.classList.contains('mpkr-route-list-primary')).toBe(false);
    expect(document.querySelector('#late-rating')?.classList.contains('mpkr-route-list-primary')).toBe(false);
    expect(document.querySelector('#late-action')?.className).toBe('');
  });
});
