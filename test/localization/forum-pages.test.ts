import { DirectPageLocalizer } from '@/localization/direct-page-localizer';
import { detectPage } from '@/sites/mountain-project/contract/routes';
import { forumHome, forumListing, forumTopic, forumForm, forumReplyForm, forumEditForm } from '../fixtures/mountain-project/forum';

describe('common forum UI family', () => {
  let localizer: DirectPageLocalizer;
  const originalUrl = window.location.href;
  beforeEach(() => { localizer = new DirectPageLocalizer(); });
  afterEach(() => { localizer.restore(); document.body.innerHTML = ''; window.location.href = originalUrl; });

  it.each([
    ['/forum', 'forum', forumHome, 'Mountain Project 포럼'],
    ['/forum/latest?page=2', 'forum', forumListing, '새 글 작성'],
    ['/forum/103989405/general-climbing?page=2', 'forum', forumListing, '클라이밍 일반'],
    ['/forum/topic/123/example?page=2', 'forum-topic', forumTopic, '답글 작성'],
    ['/forum/topic/123/example?page=2#reply', 'forum-topic', forumTopic, '답글 작성'],
    ['/add/forum-topic/103989405', 'forum-form', forumForm, '글 제목'],
    ['/add/forum-message/123', 'forum-form', forumReplyForm, '내 답글'],
    ['/edit/forum-message/456', 'forum-form', forumEditForm, '저장'],
    ['/edit/forum-message/0?replyToId=123&quoteId=456', 'forum-form', forumReplyForm, '답글 작성'],
  ])('localizes %s and restores the exact DOM', (path, kind, fixture, expected) => {
    window.location.href = `https://www.mountainproject.com${path}`;
    document.body.innerHTML = fixture;
    const before = document.body.innerHTML;
    const hrefs = [...document.querySelectorAll('a')].map(a => a.getAttribute('href'));
    expect(detectPage(new URL(window.location.href))).toBe(kind);
    localizer.apply(); localizer.apply();
    expect(document.body.textContent).toContain(expected);
    expect([...document.querySelectorAll('a')].map(a => a.getAttribute('href'))).toEqual(hrefs);
    localizer.restore();
    expect(document.body.innerHTML).toBe(before);
  });

  it('keeps topic titles, authored format, signatures, usernames and dates unchanged', () => {
    window.location.href = 'https://www.mountainproject.com/forum/topic/123/example';
    document.body.innerHTML = forumTopic;
    const title = document.querySelector('h1')!.innerHTML;
    const body = document.querySelector('.fr-view')!.outerHTML;
    const bio = document.querySelector('.bio')!.outerHTML;
    localizer.apply();
    expect(document.querySelector('h1')!.innerHTML).toBe(title);
    expect(document.querySelector('.fr-view')!.outerHTML).toBe(body);
    expect(document.querySelector('.bio')!.outerHTML).toBe(bio);
    expect(document.querySelector('label')!.textContent).toContain('이메일');
  });

  it('translates forum names and descriptions while retaining author names and date data', () => {
    window.location.href = 'https://www.mountainproject.com/forum';
    document.body.innerHTML = forumHome;
    localizer.apply();
    expect(document.querySelector('a[href$="/climbing-gear-discussion"]')!.textContent).toBe('클라이밍 장비 토론');
    expect(document.querySelector('a[href$="/climbing-gear-reviews"]')!.textContent).toBe('클라이밍 장비 리뷰');
    expect(document.body.textContent).toContain('MountainProject.com 사이트');
    expect(document.body.textContent).toContain('클라이밍 장비에 관해 자유롭게 이야기하는 공간입니다.');
    expect(document.body.textContent).toContain('최근 글: Sep 15, 2026');
    expect(document.querySelector('a[href^="/user/"]')!.textContent).toBe('General');
  });

  it('retains relative last-post metadata instead of applying general UI date rules', () => {
    window.location.href = 'https://www.mountainproject.com/forum';
    document.body.innerHTML = forumHome;
    const metadata = document.querySelector('td.text-nowrap.text-xs-right')!;
    const original = metadata.innerHTML;
    localizer.apply();
    expect(metadata.innerHTML).toBe(original);
    expect(metadata.textContent).toContain('23 mins ago');
  });

  it('preserves submission contracts and handlers while translating form labels', () => {
    window.location.href = 'https://www.mountainproject.com/add/forum-topic/103989405';
    document.body.innerHTML = forumForm;
    const form = document.querySelector('form')!;
    const values = [...new FormData(form).entries()];
    const button = document.querySelector('button')!;
    const listener = vi.fn(); button.addEventListener('click', listener);
    localizer.apply();
    expect([...new FormData(form).entries()]).toEqual(values);
    expect(form.getAttribute('action')).toBe('/add/forum-topic/103989405');
    expect(document.querySelector('textarea')!.value).toBe('Do not translate my draft.');
    expect([...document.querySelectorAll('[contenteditable]')].map(editor => editor.textContent))
      .toEqual(['General Climbing', 'General Climbing', 'General Climbing']);
    expect(document.querySelector('input[name="title"]')!.getAttribute('placeholder')).toBe('글 제목');
    expect(button.textContent).toBe('미리보기');
    button.click(); expect(listener).toHaveBeenCalledOnce();
  });

  it.each([
    ['/add/forum-message/123', forumReplyForm, '답글 작성'],
    ['/edit/forum-message/456', forumEditForm, '저장'],
  ])('preserves the draft and submission contract on %s', (path, fixture, submitText) => {
    window.location.href = `https://www.mountainproject.com${path}`;
    document.body.innerHTML = fixture;
    const form = document.querySelector('form')!;
    const values = [...new FormData(form).entries()];
    const action = form.getAttribute('action');
    const draft = document.querySelector('textarea')!.value;
    const editor = document.querySelector('[contenteditable]')!.innerHTML;
    const submit = document.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    const submitValue = submit.value;
    localizer.apply();
    expect([...new FormData(form).entries()]).toEqual(values);
    expect(form.getAttribute('action')).toBe(action);
    expect(document.querySelector('textarea')!.value).toBe(draft);
    expect(document.querySelector('[contenteditable]')!.innerHTML).toBe(editor);
    expect(document.querySelector('textarea')!.placeholder).toBe('답글 작성');
    expect(submit.value).toBe(submitValue);
    expect(submit.textContent).toBe(submitText);
  });

  it('translates reply entry points and the login prompt without rewriting their links', () => {
    window.location.href = 'https://www.mountainproject.com/forum/topic/123/example';
    document.body.innerHTML = forumTopic;
    document.querySelector('#topic-guts')!.insertAdjacentHTML('beforeend', `
      <a id="reply-anchor" class="btn btn-primary btn-sm" href="#reply">Post Reply</a>
      <a id="login-reply" class="btn btn-primary btn-padded" href="#">Log In to Reply</a>
      <a id="reply-page" class="btn btn-primary btn-sm" href="/forum/topic/123/example?page=2#reply">Post Reply</a>
      <div id="reply"><a class="btn btn-primary btn-padded" href="/auth/login">Log In to Reply</a></div>`);
    const links = [...document.querySelectorAll('a')].map(anchor => anchor.getAttribute('href'));
    localizer.apply();
    expect(document.querySelector('#reply-anchor')!.textContent).toBe('답글 작성');
    expect(document.querySelector('#login-reply')!.textContent).toBe('로그인 후 답글 작성');
    expect(document.querySelector('#reply-page')!.textContent).toBe('답글 작성');
    expect(document.querySelector('#reply a')!.textContent).toBe('로그인 후 답글 작성');
    expect([...document.querySelectorAll('a')].map(anchor => anchor.getAttribute('href'))).toEqual(links);
  });

  it('does not localize hidden or password field attributes in forum login forms', () => {
    window.location.href = 'https://www.mountainproject.com/forum/topic/123/example#reply';
    document.body.innerHTML = `<div id="reply"><form action="/auth/login">
      <input type="hidden" name="csrf" value="synthetic-token" title="Message" aria-label="Message" placeholder="Search forums">
      <input type="password" name="password" value="synthetic-test-data" title="Message" aria-label="Message" placeholder="Search forums">
      <button type="button">Log In to Reply</button>
    </form></div>`;
    const fields = [...document.querySelectorAll('input')].map(input => input.outerHTML);
    localizer.apply();
    expect([...document.querySelectorAll('input')].map(input => input.outerHTML)).toEqual(fields);
    expect(document.querySelector('button')!.textContent).toBe('로그인 후 답글 작성');
  });

  it('localizes search and filter controls while preserving the query and selected filter values', () => {
    window.location.href = 'https://www.mountainproject.com/forum/latest?q=General+Climbing&sort=new';
    document.body.innerHTML = `<form class="forum-search" action="/forum/latest" method="get">
      <label>Search Forums<input name="q" value="General Climbing" placeholder="Search forums"></label>
      <label>Sort by:<select name="sort"><option value="new" selected>Newest</option><option value="old">Oldest</option></select></label>
      <select name="topic"><option selected>General Climbing</option></select>
      <button type="submit">Search</button><button type="button">Clear Filters</button>
      <p role="status">No results found.</p>
    </form>${forumListing}`;
    const form = document.querySelector('form')!;
    const values = [...new FormData(form).entries()];
    const before = document.body.innerHTML;
    localizer.apply();
    expect(form.textContent).toContain('포럼 검색');
    expect(form.textContent).toContain('최신 순');
    expect(form.textContent).toContain('필터 초기화');
    expect(form.textContent).toContain('검색 결과가 없습니다.');
    expect(document.querySelector<HTMLInputElement>('input[name="q"]')!.placeholder).toBe('포럼 검색');
    expect([...new FormData(form).entries()]).toEqual(values);
    expect(document.querySelector('a[href="/forum/topic/123/example"]')!.textContent).toBe('General Climbing');
    localizer.restore();
    expect(document.body.innerHTML).toBe(before);
  });

  it('handles dynamically loaded modal/filter/page UI once and ignores iframe contents', async () => {
    window.location.href = 'https://www.mountainproject.com/forum/latest';
    document.body.innerHTML = '<main></main>';
    localizer.apply();
    const host = document.querySelector('main')!;
    host.innerHTML = '<div role="dialog"><h2>Sign Up or Log In</h2><button>Close</button><label>Sort by:<select name="sort"><option value="new">Newest</option></select></label><p role="status">No results found.</p></div><iframe></iframe>';
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(host.textContent).toContain('회원가입 또는 로그인');
    expect(host.textContent).toContain('검색 결과가 없습니다.');
    expect(document.querySelector('option')!.value).toBe('new');
    const translated = host.innerHTML;
    localizer.apply(host);
    expect(host.innerHTML).toBe(translated);
    document.querySelector('h2')!.firstChild!.nodeValue = 'Loading...';
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(document.querySelector('h2')!.textContent).toBe('불러오는 중...');
  });
});
