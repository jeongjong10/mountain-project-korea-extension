import { DirectoryCounts, readDirectoryCounts } from '@/sites/mountain-project/dom/directory-counts';
const url = 'https://www.mountainproject.com/area/123/example';
const html = '<h2>1,200 Total Climbs</h2><div class="lef-nav-row"><a href="/area/456/child">Child</a><span class="lef-nav-Sport">99</span><span class="text-warm">0</span></div>';
afterEach(() => vi.unstubAllGlobals());
it('reads totals and child totals, preserving genuine zero and ignoring sport subtotals', () => {
  expect([...readDirectoryCounts(html, url)]).toEqual([['456', 0], ['123', 1200]]);
  expect(readDirectoryCounts('<h2>Access denied</h2>', url).size).toBe(0);
  expect(readDirectoryCounts(html.replace('text-warm">0', 'text-warm">unknown'), url).has('456')).toBe(false);
});
it('deduplicates a parent page, requests fresh HTML without credentials and handles HTTP failure', async () => {
  const fetcher = vi.fn().mockResolvedValue(new Response(html, {headers:{'content-type':'text/html'}}));vi.stubGlobal('fetch', fetcher);
  const loader = new DirectoryCounts('https://mountainproject.com');
  const [a,b] = await Promise.all([loader.read(url),loader.read(url)]);
  expect(a).toBe(b); expect(a.get('123')).toBe(1200); expect(fetcher).toHaveBeenCalledTimes(1);
  expect(fetcher.mock.calls[0]![0]).toBe('https://mountainproject.com/area/123/example');
  expect(fetcher.mock.calls[0]![1]).toMatchObject({credentials:'omit',cache:'no-cache'});
  fetcher.mockResolvedValue(new Response('denied',{status:403}));
  expect((await loader.read(url.replace('123','789'))).size).toBe(0);loader.destroy();
});
it('limits concurrent requests and cancels queued work on OFF', async () => {
  const pending: ((response: Response) => void)[] = [];
  const fetcher = vi.fn((_url, options) => new Promise<Response>((resolve,reject) => {
    pending.push(resolve); options.signal.addEventListener('abort',()=>reject(new Error('aborted')));
  }));vi.stubGlobal('fetch',fetcher);
  const loader=new DirectoryCounts('https://www.mountainproject.com');
  const requests=[1,2,3,4].map(id=>loader.read(url.replace('123',String(id))));
  expect(fetcher).toHaveBeenCalledTimes(2);loader.destroy();
  expect((await Promise.all(requests)).every(value=>value.size===0)).toBe(true);
  expect(fetcher).toHaveBeenCalledTimes(2);
});
