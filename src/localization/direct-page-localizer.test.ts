import { DirectPageLocalizer } from './direct-page-localizer';

describe('DirectPageLocalizer', () => {
  beforeEach(() => {
    document.head.innerHTML = '<base href="https://www.mountainproject.com/">';
    document.body.innerHTML = '';
  });

  it('translates fixed UI in place without replacing functional nodes', () => {
    document.body.innerHTML = `
      <header>
        <nav><a href="/route-guide">Route Guide</a></nav>
        <a class="sign-in" href="/auth/login">Sign In</a>
        <input id="search" placeholder="Search Mountain Project">
      </header>
      <form id="routeFinderForm" action="/route-finder">
        <input id="submit" type="submit" value="Find Routes">
      </form>
      <h2>Description</h2>
      <article><p id="user-content">Description of my favorite route.</p></article>
    `;

    const routeGuide = document.querySelector<HTMLAnchorElement>('nav a')!;
    const search = document.querySelector<HTMLInputElement>('#search')!;
    const form = document.querySelector<HTMLFormElement>('#routeFinderForm')!;
    let clicks = 0;
    routeGuide.addEventListener('click', (event) => {
      event.preventDefault();
      clicks += 1;
    });

    const localizer = new DirectPageLocalizer();
    localizer.apply(document);

    expect(document.querySelector('nav a')).toBe(routeGuide);
    expect(routeGuide.textContent).toBe('루트 가이드');
    expect(routeGuide.getAttribute('href')).toBe('/route-guide');
    expect(search.placeholder).toBe('Mountain Project 검색');
    expect(form.getAttribute('action')).toBe('/route-finder');
    expect(document.querySelector('#submit')?.getAttribute('value')).toBe('루트 찾기');
    expect(document.querySelector('h2')?.textContent).toBe('설명');
    expect(document.querySelector('#user-content')?.textContent)
      .toBe('Description of my favorite route.');

    routeGuide.click();
    expect(clicks).toBe(1);
    localizer.restore();
  });

  it('restores every translated value on disable', () => {
    document.body.innerHTML = `
      <header><a href="/route-guide">Route Guide</a></header>
      <h3>Protection</h3>
      <input id="search" placeholder="Search...">
    `;
    const anchor = document.querySelector<HTMLAnchorElement>('a')!;
    const localizer = new DirectPageLocalizer();

    localizer.apply(document);
    localizer.restore();

    expect(document.querySelector('a')).toBe(anchor);
    expect(anchor.textContent).toBe('Route Guide');
    expect(document.querySelector('h3')?.textContent).toBe('Protection');
    expect(document.querySelector<HTMLInputElement>('#search')?.placeholder)
      .toBe('Search...');
  });

  it('translates fixed UI added after initial application', async () => {
    const localizer = new DirectPageLocalizer();
    localizer.apply(document);

    const heading = document.createElement('h3');
    heading.textContent = 'Location';
    document.body.append(heading);
    const search = document.createElement('input');
    search.placeholder = 'Search...';
    document.body.append(search);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(heading.textContent).toBe('위치');
    expect(search.placeholder).toBe('검색...');
    localizer.restore();
    expect(heading.textContent).toBe('Location');
    expect(search.placeholder).toBe('Search...');
  });

  it('tracks in-place site rewrites and restores the latest source values', async () => {
    document.body.innerHTML = `
      <h3 id="section">Location</h3>
      <img id="action" title="Suggest Change" alt="Rating">
      <input id="search" placeholder="Search...">
    `;
    const localizer = new DirectPageLocalizer();
    const section = document.querySelector<HTMLElement>('#section')!;
    const sectionText = section.firstChild as Text;
    const action = document.querySelector<HTMLImageElement>('#action')!;
    const search = document.querySelector<HTMLInputElement>('#search')!;
    localizer.apply(document);

    sectionText.nodeValue = 'Protection';
    action.setAttribute('title', 'View Stats');
    action.setAttribute('alt', 'Drop down');
    search.setAttribute('placeholder', 'Search Mountain Project');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(section.textContent).toBe('보호 장비');
    expect(action.title).toBe('통계 보기');
    expect(action.alt).toBe('펼치기');
    expect(search.placeholder).toBe('Mountain Project 검색');

    localizer.restore();
    expect(section.textContent).toBe('Protection');
    expect(action.title).toBe('View Stats');
    expect(action.alt).toBe('Drop down');
    expect(search.placeholder).toBe('Search Mountain Project');
  });

  it('does not localize or revisit extension-owned translation controls', async () => {
    document.body.innerHTML = `
      <button id="page-control" title="View Stats">Close</button>
      <div class="mpkr-machine-translation">
        <button id="extension-control" title="View Stats">Close</button>
        <input id="extension-input" placeholder="Search...">
      </div>
    `;
    const localizer = new DirectPageLocalizer();
    const extensionControl = document.querySelector<HTMLButtonElement>('#extension-control')!;
    const extensionInput = document.querySelector<HTMLInputElement>('#extension-input')!;
    localizer.apply(document);

    expect(document.querySelector('#page-control')?.textContent).toBe('닫기');
    expect(extensionControl.textContent).toBe('Close');
    expect(extensionControl.title).toBe('View Stats');
    expect(extensionInput.placeholder).toBe('Search...');

    extensionControl.firstChild!.nodeValue = 'Sign In';
    extensionControl.setAttribute('title', 'Suggest Change');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(extensionControl.textContent).toBe('Sign In');
    expect(extensionControl.title).toBe('Suggest Change');
    localizer.restore();
  });

  it('translates current main page labels while preserving nested spans and icons', () => {
    document.body.innerHTML = `
      <h1>Yosemite Valley Climbing</h1>
      <h2 id="classic">Top <span>10</span> Classic Climbs</h2>
      <h2 id="description">Description <a href="/edit"><img alt="edit"></a></h2>
      <h3>362,020 Routes Shared by Climbers Like You</h3>
      <div id="favorites-copy" class="small">Tell us what you like, we'll tell you what to climb!</div>
      <a id="route" href="/route/105924807/the-nose">The Nose</a>
    `;
    const classic = document.querySelector<HTMLElement>('#classic')!;
    const count = classic.querySelector('span')!;
    const icon = document.querySelector<HTMLImageElement>('#description img')!;
    const route = document.querySelector<HTMLAnchorElement>('#route')!;
    const localizer = new DirectPageLocalizer();

    localizer.apply(document);

    expect(document.querySelector('h1')?.textContent).toBe('Yosemite Valley 클라이밍');
    expect(classic.textContent?.replace(/\s+/g, ' ').trim()).toBe('대표 10 클래식 루트');
    expect(classic.querySelector('span')).toBe(count);
    expect(document.querySelector('#description img')).toBe(icon);
    expect(document.querySelector('#description')?.textContent?.trim()).toBe('설명');
    expect(document.querySelector('h3')?.textContent)
      .toBe('362,020개 루트를 클라이머들이 공유했습니다');
    expect(document.querySelector('#favorites-copy')?.textContent)
      .toBe('선호 조건에 맞는 루트를 찾아보세요!');
    expect(route.textContent).toBe('The Nose');

    localizer.restore();
    expect(classic.textContent?.replace(/\s+/g, ' ').trim()).toBe('Top 10 Classic Climbs');
    expect(classic.querySelector('span')).toBe(count);
    expect(document.querySelector('#description img')).toBe(icon);
  });

  it('translates Area and Route UI patterns without changing user content', () => {
    document.body.innerHTML = `
      <h3>Areas in Yosemite Valley</h3>
      <h2>1,908 Total Climbs</h2>
      <h2>Classic Climbing Routes at Yosemite Valley</h2>
      <h2>69 Comments</h2>
      <button>Show 133 More Photos</button>
      <article>
        <p id="description-copy">Description</p>
        <p id="route-copy">This route has 31 pitches.</p>
      </article>
    `;
    const localizer = new DirectPageLocalizer();

    localizer.apply(document);

    const headings = Array.from(document.querySelectorAll('h2, h3'))
      .map((element) => element.textContent);
    expect(headings).toEqual([
      'Yosemite Valley의 지역',
      '총 1,908개 루트',
      'Yosemite Valley의 클래식 루트',
      '댓글 69개',
    ]);
    expect(document.querySelector('button')?.textContent).toBe('사진 133장 더 보기');
    expect(document.querySelector('#description-copy')?.textContent).toBe('Description');
    expect(document.querySelector('#route-copy')?.textContent)
      .toBe('This route has 31 pitches.');

    localizer.restore();
  });
});
