import { DirectPageLocalizer } from '@/localization/direct-page-localizer';

const flush = () => new Promise(resolve => setTimeout(resolve, 0));

describe('public search forum controls', () => {
  const originalUrl = window.location.href;
  let localizer: DirectPageLocalizer;
  beforeEach(() => {
    window.location.href = 'https://www.mountainproject.com/search?q=rope';
    localizer = new DirectPageLocalizer();
    document.body.innerHTML = `<div id="onx-search"><div class="filters">
      <div><div>Show All</div><div>1,234</div></div><div><div>Forums</div><div>123</div></div>
      </div><input type="search" name="q" value="rope" placeholder="Search...">
      <button type="button">Search</button><h2>Forums</h2>
      <button id="sort" type="button">Sort By: <span>Default</span></button>
      <a href="/forum/topic/123/example"><h3>General Climbing</h3>
        <div>By: Fixture Author | Sep 29, 2026</div><div>Search</div></a>
      <div class="snippet">General Climbing</div><button type="button">Load More</button></div>`;
  });
  afterEach(() => {
    localizer.restore(); document.body.innerHTML = ''; window.location.href = originalUrl;
  });

  it('translates category/count controls without changing authored results or search values', () => {
    const original = document.body.innerHTML;
    const card = document.querySelector('a')!;
    const cardHtml = card.innerHTML;
    const click = vi.fn(); document.querySelector('button')!.addEventListener('click', click);
    localizer.apply(); localizer.apply();
    expect(document.querySelector('.filters')!.textContent?.trim()).toBe('전체 보기1,234포럼123');
    expect(document.querySelector('#sort')!.textContent).toBe('정렬: 기본 순');
    expect(card.innerHTML).toBe(cardHtml);
    expect(document.querySelector('.snippet')!.textContent).toBe('General Climbing');
    expect(document.querySelector('input')!.value).toBe('rope');
    expect(document.querySelector('input')!.placeholder).toBe('검색...');
    document.querySelector('button')!.click(); expect(click).toHaveBeenCalledOnce();
    localizer.restore(); expect(document.body.innerHTML).toBe(original);
  });

  it('translates category labels before asynchronous result counts arrive', async () => {
    document.querySelector('.filters')!.innerHTML = '<div><div>Show All</div><div></div></div><div><div>Forums</div><div>Loading...</div></div>';
    localizer.apply();
    expect(document.querySelector('.filters')!.textContent).toBe('전체 보기포럼Loading...');
    document.querySelectorAll('.filters > div > div:last-child').forEach((count, index) => {
      count.textContent = String(index + 2);
    });
    await flush();
    expect(document.querySelector('.filters')!.textContent).toBe('전체 보기2포럼3');
  });

  it('handles filter updates and dynamically inserted sort menus without recursion', async () => {
    localizer.apply();
    document.querySelector('.filters')!.innerHTML = '<div><div>Routes</div><div>42</div></div><div><div>Forums</div><div>5</div></div>';
    document.body.insertAdjacentHTML('beforeend', '<ul role="menu"><li role="menuitem">Relevance</li><li role="menuitem">Longest</li><li role="menuitem">Shortest</li></ul>');
    await flush();
    expect(document.querySelector('.filters')!.textContent?.trim()).toBe('루트42포럼5');
    expect([...document.querySelectorAll('[role="menuitem"]')].map(item => item.textContent)).toEqual(['관련도 순', '긴 순', '짧은 순']);
    const result = document.body.innerHTML;
    await flush(); expect(document.body.innerHTML).toBe(result);
  });
});
