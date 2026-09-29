import fixture from './fixtures/region-directory.html?raw';
import { RegionDirectory } from '@/ui/region-directory';
import { ASIA_DIRECTORY_COUNTRIES, EUROPE_DIRECTORY_COUNTRIES } from '@/sites/mountain-project/contract/directory';
let presentation: RegionDirectory;
beforeEach(() => { document.head.innerHTML = '<base href="https://www.mountainproject.com/">'; document.body.innerHTML = fixture; });
afterEach(() => presentation?.destroy());
it('keeps all original nodes in place and restores the exact original on OFF', () => {
  const original = document.querySelector<HTMLElement>('#route-guide')!;
  const before = document.body.innerHTML; const parent = original.parentNode;
  const source = original.querySelector('a')!; const click = vi.fn((e: Event) => e.preventDefault()); source.addEventListener('click', click);
  presentation = new RegionDirectory(); presentation.mount(); presentation.mount();
  expect(document.querySelectorAll('.mpkr-directory')).toHaveLength(1);
  expect(original.parentNode).toBe(parent);
  expect(original.hidden).toBe(true);
  const buttons = document.querySelectorAll<HTMLButtonElement>('[role=tab]'); buttons[2]!.click();
  expect(original.hidden).toBe(false);
  expect(original.outerHTML).toBe(new DOMParser().parseFromString(fixture, 'text/html').querySelector('#route-guide')!.outerHTML);
  source.click(); expect(click).toHaveBeenCalledTimes(1);
  presentation.destroy(); expect(document.body.innerHTML).toBe(before); expect(document.querySelector('#route-guide a')).toBe(source);
});
it('uses native MP list markup for all reviewed destinations with Korea first', () => {
  presentation = new RegionDirectory(); presentation.mount();
  const panels = document.querySelectorAll('[role=tabpanel]');
  expect(panels[0]!.querySelector('strong a')!.textContent).toBe('대한민국');
  for (const [index, countries] of [[0, ASIA_DIRECTORY_COUNTRIES], [1, EUROPE_DIRECTORY_COUNTRIES]] as const) {
    const urls = [...panels[index]!.querySelectorAll<HTMLAnchorElement>('.ml-half a')].map(a => a.href);
    for (const entry of countries.flatMap(c => c.regions)) expect(urls).toContain(entry.url);
  }
  expect(document.querySelectorAll('.mpkr-directory .ml-half a')).toHaveLength(71);
  expect([...document.querySelectorAll('.mpkr-directory .number')].every(el => el.textContent === '')).toBe(true);
  expect(document.querySelector('.mpkr-directory details')).toBeNull();
});
it('switches panels with click and keyboard without navigating country links', () => {
  presentation = new RegionDirectory(); presentation.mount();
  const tabs = [...document.querySelectorAll<HTMLButtonElement>('[role=tab]')];
  tabs[0]!.dispatchEvent(new KeyboardEvent('keydown', {key:'ArrowRight',bubbles:true}));
  expect(tabs[1]!.getAttribute('aria-selected')).toBe('true'); expect(document.activeElement).toBe(tabs[1]);
  expect(document.querySelectorAll<HTMLElement>('[role=tabpanel]')[0]!.hidden).toBe(true);
  tabs[1]!.dispatchEvent(new KeyboardEvent('keydown', {key:'End',bubbles:true}));
  expect(document.querySelector<HTMLElement>('#route-guide')!.hidden).toBe(false);
});
it('preserves unknown source links and the original hidden state', () => {
  const original = document.querySelector<HTMLElement>('#route-guide')!; original.hidden = true;
  original.insertAdjacentHTML('beforeend','<a href="/unexpected">Unknown</a>'); const before = document.body.innerHTML;
  presentation = new RegionDirectory(); presentation.mount(); presentation.destroy(); expect(document.body.innerHTML).toBe(before);
  document.body.innerHTML = '<p>No directory</p>'; presentation.mount(); expect(document.body.innerHTML).toBe('<p>No directory</p>');
});

it('makes no requests on load or tab changes; loads only after an explicit click', async () => {
  const originalUrl = location.href;
  window.location.href = 'https://www.mountainproject.com/';
  const fetcher = vi.fn(async () => new Response('<h2>487 Total Climbs</h2>', { headers: { 'content-type': 'text/html' } }));
  vi.stubGlobal('fetch', fetcher);
  try {
    presentation = new RegionDirectory(); presentation.mount();
    const tabs = [...document.querySelectorAll<HTMLButtonElement>('[role=tab]')];
    tabs[1]!.click(); tabs[2]!.click(); tabs[0]!.click();
    expect(fetcher).not.toHaveBeenCalled();
    const button = document.querySelector<HTMLButtonElement>('.mpkr-directory-load')!;
    button.click(); button.click();
    expect(button.disabled).toBe(true);
    await vi.waitFor(() => expect(button.textContent).toBe('미조회 수 다시 불러오기'));
    const requests = fetcher.mock.calls.length;
    const counts = [...document.querySelectorAll('[role=tabpanel]')];
    expect(counts[0]!.querySelector('strong .number')!.textContent).toBe('487');
    expect([...counts[1]!.querySelectorAll('.number')].every(el => el.textContent === '')).toBe(true);
    tabs[1]!.click(); expect(button.textContent).toBe('등록 수 불러오기');
    tabs[0]!.click(); expect(fetcher).toHaveBeenCalledTimes(requests);
    button.click(); await vi.waitFor(() => expect(button.disabled).toBe(false));
    expect(fetcher.mock.calls.length).toBeGreaterThan(requests);
    tabs[2]!.click(); expect(button.hidden).toBe(true);
  } finally { presentation.destroy(); vi.unstubAllGlobals(); window.location.href = originalUrl; }
});
