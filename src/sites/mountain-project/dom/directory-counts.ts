import { isMountainProjectUrl } from '../contract/origins';
import { parseAreaPath } from '../contract/routes';

export function areaId(url: string): string | undefined {
  try { const parsed = new URL(url); return isMountainProjectUrl(parsed) ? parseAreaPath(parsed.pathname)?.id : undefined; } catch { return; }
}
export function readDirectoryCounts(html: string, url: string): Map<string, number> {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const counts = new Map<string, number>();
  const number = (value: string | null | undefined) => {
    const text = value?.trim(); return text && /^(?:\d+|\d{1,3}(?:,\d{3})+)$/.test(text) ? Number(text.replaceAll(',', '')) : undefined;
  };
  for (const row of doc.querySelectorAll('.lef-nav-row')) {
    const href = row.querySelector('a[href]')?.getAttribute('href');
    const id = href ? areaId(new URL(href, url).href) : undefined;
    const count = number(row.querySelector('.text-warm')?.textContent);
    if (id && count !== undefined) counts.set(id, count);
  }
  const id = areaId(url);
  for (const heading of doc.querySelectorAll('h2')) {
    const match = heading.textContent?.trim().match(/^([\d,]+) Total Climbs$/);
    const count = number(match?.[1]);
    if (id && count !== undefined) counts.set(id, count);
  }
  return counts;
}

/** User-triggered reads only. Cache for this mount; explicit retries may re-read failed sources. */
export class DirectoryCounts {
  private readonly controller = new AbortController();
  private readonly pages = new Map<string, Promise<Map<string, number>>>();
  private readonly queue: (() => void)[] = [];
  private active = 0;
  constructor(private readonly origin: string) {}
  private pump(): void {
    while (this.active < 2 && this.queue.length) this.queue.shift()!();
  }
  read(source: string, retry = false): Promise<Map<string, number>> {
    if (this.controller.signal.aborted || !areaId(source)) return Promise.resolve(new Map());
    const url = new URL(source); url.protocol = new URL(this.origin).protocol; url.host = new URL(this.origin).host;
    if (!isMountainProjectUrl(url)) return Promise.resolve(new Map());
    if (retry) this.pages.delete(url.href);
    const existing = this.pages.get(url.href); if (existing) return existing;
    const promise = new Promise<Map<string, number>>((resolve) => {
      this.queue.push(() => {
        if (this.controller.signal.aborted) { resolve(new Map()); return; }
        this.active++;
        const controller = new AbortController();
        const abort = () => controller.abort(); this.controller.signal.addEventListener('abort', abort, { once: true });
        const timer = setTimeout(abort, 10000);
        void fetch(url.href, { signal: controller.signal, credentials: 'omit', cache: 'no-cache' })
          .then(async response => {
            if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) return new Map<string, number>();
            return readDirectoryCounts(await response.text(), url.href);
          }).catch(() => new Map<string, number>()).then(resolve).finally(() => {
            clearTimeout(timer); this.controller.signal.removeEventListener('abort', abort); this.active--; this.pump();
          });
      });
    });
    this.pages.set(url.href, promise); this.pump(); return promise;
  }
  destroy(): void { this.controller.abort(); this.pump(); this.pages.clear(); }
}
