import { UI } from './design-tokens';
import { DirectoryCounts, areaId } from '../sites/mountain-project/dom/directory-counts';
import { isMountainProjectUrl } from '../sites/mountain-project/contract/origins';
import { ASIA_DIRECTORY_COUNTRIES, EUROPE_DIRECTORY_COUNTRIES, DIRECTORY_SELECTORS, KOREA_DIRECTORY_LINKS } from '../sites/mountain-project/contract/directory';
import { SOUTH_KOREA_AREA_URL } from '../sites/mountain-project/contract/regions/south-korea';

const CSS = `
.mpkr-directory{color:inherit;font:inherit}
.mpkr-directory-toolbar{display:flex;align-items:baseline;flex-wrap:wrap;gap:.5rem 1rem;margin-bottom:1rem}
.mpkr-directory-tabs{display:flex;gap:1rem}
.mpkr-directory-load{margin-left:auto;display:inline-flex;align-items:center;gap:.35rem;border:1px solid ${UI.color.buttonBorder};border-radius:${UI.radius.control};background:${UI.color.buttonSurface};padding:.3rem .65rem;color:${UI.color.link};font:inherit;font-size:.9em;font-weight:600;line-height:1.5;cursor:pointer}
.mpkr-directory-load:hover:not(:disabled){background:${UI.color.buttonHover};border-color:${UI.color.buttonBorderHover}}
.mpkr-directory-load:active:not(:disabled){background:${UI.color.buttonActive}}
.mpkr-directory-load:disabled{cursor:default;opacity:.65;text-decoration:none}
.mpkr-directory-status{font-size:.8em;color:inherit}
.mpkr-directory-load:focus-visible{outline:2px solid currentColor;outline-offset:3px}
.mpkr-directory-tabs button{appearance:none;border:0;border-bottom:2px solid transparent;border-radius:0;background:none;padding:0 0 .2rem;font:inherit;color:inherit;cursor:pointer}
.mpkr-directory-tabs button[aria-selected=true]{border-bottom-color:currentColor;font-weight:bold}
.mpkr-directory-tabs button:focus-visible{outline:2px solid currentColor;outline-offset:3px}
.mpkr-directory-countries{column-count:4;column-gap:30px}
.mpkr-directory-country{break-inside:avoid;page-break-inside:avoid}
.mpkr-directory [hidden]{display:none!important}
@media(max-width:991px){.mpkr-directory-countries{column-count:2}}
@media(max-width:543px){.mpkr-directory-countries{column-count:1}}
`;
interface Shortcut { label: string; url: string; countSourceUrl?: string }
interface Country extends Shortcut { regions: Shortcut[] }

// Match MP's clearfix / float / dashed-b markup, letting the site own its appearance.
function line(item: Shortcut): HTMLElement {
  const row = document.createElement('div'); row.className = 'clearfix';
  const content = document.createElement('div');
  const count = document.createElement('small'); count.className = 'number float-xs-right';
  count.dataset.areaUrl = item.url; count.dataset.sourceUrl = item.countSourceUrl ?? item.url;
  content.append(count);
  const anchor = document.createElement('a'); anchor.className = 'text-truncate float-xs-left';
  anchor.style.maxWidth = '70%'; anchor.href = item.url; anchor.textContent = item.label; anchor.title = item.label;
  content.append(anchor);
  const dashes = document.createElement('div'); dashes.className = 'dashes';
  const hr = document.createElement('hr'); hr.className = 'dashed-b'; dashes.append(hr);
  row.append(content, dashes); return row;
}
function country(item: Country): HTMLElement {
  const group = document.createElement('div'); group.className = 'mb-half mpkr-directory-country';
  const title = document.createElement('strong'); title.append(line(item)); group.append(title);
  for (const region of item.regions) {
    const child = document.createElement('div'); child.className = 'ml-half'; child.append(line(region)); group.append(child);
  }
  return group;
}
let sequence = 0;
export class RegionDirectory {
  private style?: HTMLStyleElement;
  private counts?: DirectoryCounts;
  private async populate(panel: HTMLElement): Promise<boolean> {
    const loader = this.counts ??= new DirectoryCounts(location.origin);
    const sources = new Map<string, HTMLElement[]>();
    for (const element of panel.querySelectorAll<HTMLElement>('[data-source-url]')) {
      if (element.textContent) continue;
      const url = element.dataset.sourceUrl!;
      sources.set(url, [...(sources.get(url) ?? []), element]);
    }
    await Promise.all([...sources].map(async ([url, elements]) => {
      const counts = await loader.read(url, panel.dataset.countState === 'partial');
      for (const element of elements) {
        if (!element.isConnected) continue;
        const id = areaId(element.dataset.areaUrl!); const value = id ? counts.get(id) : undefined;
        if (value === undefined) continue;
        element.textContent = value.toLocaleString('en-US'); element.title = `MP 조회 · ${new Date().toLocaleString('ko-KR')}`;
      }
    }));
    return [...panel.querySelectorAll('[data-source-url]')].every(element => !!element.textContent);
  }
  private readonly mounted = new Map<HTMLElement, { section: HTMLElement; hidden: HTMLElement['hidden'] }>();
  mount(root: ParentNode = document): void {
    for (const original of root.querySelectorAll<HTMLElement>(DIRECTORY_SELECTORS.root)) {
      if (this.mounted.has(original)) continue;
      if (!this.style) { this.style = document.createElement('style'); this.style.textContent = CSS; document.head.append(this.style); }
      const section = document.createElement('section'); section.className = 'mpkr-directory';
      const tabs = document.createElement('div'); tabs.className = 'mpkr-directory-tabs'; tabs.setAttribute('role', 'tablist'); tabs.setAttribute('aria-label', '지역 가이드 대륙');
      const id = `mpkr-directory-${++sequence}`;
      const buttons: HTMLButtonElement[] = []; const panels: HTMLElement[] = [];
      let selected = 0;
      const toolbar = document.createElement('div'); toolbar.className = 'mpkr-directory-toolbar';
      const load = document.createElement('button'); load.type = 'button'; load.className = 'mpkr-directory-load';
      load.title = '선택한 대륙의 MP 등록 수를 조회합니다';
      const status = document.createElement('span'); status.className = 'mpkr-directory-status'; status.setAttribute('role', 'status');
      const renderLoad = () => {
        load.hidden = status.hidden = selected === 2;
        const state = panels[selected]?.dataset.countState;
        load.disabled = state === 'loading' || state === 'done';
        load.textContent = state === 'loading' ? '불러오는 중…' : state === 'done' ? '등록 수 불러옴' : state === 'partial' ? '미조회 수 다시 불러오기' : '등록 수 불러오기';
        status.textContent = state === 'partial' ? '일부 등록 수를 확인하지 못했습니다.' : '';
      };
      load.addEventListener('click', () => {
        const panel = panels[selected];
        if (!panel || selected === 2 || load.disabled) return;
        if (!isMountainProjectUrl(new URL(location.href))) { status.textContent = 'MP 사이트에서 사용할 수 있습니다.'; return; }
        const request = this.populate(panel);
        panel.dataset.countState = 'loading'; panel.setAttribute('aria-busy', 'true'); renderLoad();
        void request.then(complete => {
          if (!panel.isConnected) return;
          panel.dataset.countState = complete ? 'done' : 'partial'; panel.removeAttribute('aria-busy'); renderLoad();
        });
      });
      const groups: Country[][] = [
        [{ label: '대한민국', url: SOUTH_KOREA_AREA_URL, regions: KOREA_DIRECTORY_LINKS.map(item => ({ ...item, countSourceUrl: SOUTH_KOREA_AREA_URL })) }, ...ASIA_DIRECTORY_COUNTRIES],
        EUROPE_DIRECTORY_COUNTRIES,
      ];
      const select = (index: number) => {
        buttons.forEach((button, i) => { button.setAttribute('aria-selected', String(i === index)); button.tabIndex = i === index ? 0 : -1; panels[i]!.hidden = i !== index; });
        original.hidden = index !== 2;
        selected = index; renderLoad();
      };
      ['아시아', '유럽', '아메리카'].forEach((label, index) => {
        const button = document.createElement('button'); button.type = 'button'; button.textContent = label;
        button.id = `${id}-tab-${index}`; button.setAttribute('role', 'tab'); button.setAttribute('aria-controls', `${id}-panel-${index}`);
        const panel = document.createElement('div'); panel.id = `${id}-panel-${index}`;
        panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', button.id);
        if (index < 2) {
          panel.className = 'mpkr-directory-countries'; groups[index]!.forEach((entry) => panel.append(country(entry)));
        } else { panel.setAttribute('aria-owns', original.id); }
        button.addEventListener('click', () => select(index));
        button.addEventListener('keydown', (event) => {
          const next = event.key === 'ArrowRight' ? (index + 1) % 3 : event.key === 'ArrowLeft' ? (index + 2) % 3 : event.key === 'Home' ? 0 : event.key === 'End' ? 2 : -1;
          if (next < 0) return; event.preventDefault(); select(next); buttons[next]!.focus();
        });
        buttons.push(button); panels.push(panel); tabs.append(button);
      });
      toolbar.append(tabs, load, status);
      section.append(toolbar, ...panels); original.before(section);
      this.mounted.set(original, { section, hidden: original.hidden }); select(0);
    }
  }
  destroy(): void {
    for (const [original, { section, hidden }] of this.mounted) { original.hidden = hidden; section.remove(); }
    this.counts?.destroy(); this.counts = undefined;
    this.mounted.clear(); this.style?.remove(); this.style = undefined;
  }
}
