import { DirectPageLocalizer } from '@/localization/direct-page-localizer';
import { MountainProjectPageAdapter } from '@/sites/mountain-project/dom/page-adapter';
import { detectPage } from '@/sites/mountain-project/contract/routes';
import { resolveMountainProjectPageCapabilities } from '@/sites/mountain-project/dom/page-capabilities';
import { OriginalPreservingRenderer } from '@/rendering/original-preserving-renderer';

const cases = [
  ['/route-guide', 'route-guide', '<h1>Rock Climbing Guide</h1><form id="routeFinderForm"><label>Quality:</label><select name="quality"><option value="0">All star ratings</option></select></form>', '암벽등반 가이드'],
  ['/gyms', 'gyms', '<div id="climbing-gyms"><h1>Climbing Gym Directory</h1><div class="gym-count">38 Gyms</div></div>', '클라이밍 짐 찾기'],
  ['/gyms/louisiana', 'gyms', '<div id="climbing-gyms"><div class="row pt-main-content"><h1>Louisiana Climbing Gym Directory</h1></div><div class="add-gym-cta"><h3>Have a favorite gym?</h3><p>Mountain Project can\'t be a complete community resource without climbing gyms. Please help us keep our gym database up to date.</p><a href="/edit/gym/0">Add Missing Gym</a></div><table><tr><td><a href="/gym/1/risen-rock">Risen Rock Climbing Gym</a></td><td class="text-xs-right">Bossier City</td></tr></table></div>', 'Louisiana 클라이밍 짐 찾기'],
  ['/gym/117113100/risen-rock-climbing-gym', 'gym', '<div id="climbing-gyms"><div class="row pt-main-content"><h1>Risen Rock Climbing Gym</h1></div><div class="gym-overview"><div class="gym-info"><strong>Gym Information:</strong><div><a href="https://risenrockclimbing.com/">risenrockclimbing.com</a></div><div>(318) 393-1655</div></div><div class="gym-rating"><strong>Rate This Gym:</strong></div></div><h2 class="photos">Photos of Risen Rock Climbing Gym</h2><div class="improve-gym-cta"><h3>Have you climbed here?</h3><p>Add details to help others learn more about this gym.</p><a href="#">Make a Suggestion</a></div></div>', '클라이밍 짐 정보:'],
  ['/whats-new', 'whats-new', '<div id="whats-new"><h1>What\'s New</h1><div>Within: <a href="?days=1">1 Day</a></div></div>', '새 소식'],
  ['/partner-finder', 'partner-finder', '<div id="partner-finder"><h1>Partner Finder</h1><form action="/partner-finder/results"><label>Age</label><select name="test"><option>Follow</option></select><input name="location" value="Boulder"><button>Find Partners</button></form></div>', '등반 파트너 찾기'],
  ['/forum/105083612/colorado-partners', 'forum', '<table id="forum-table"><thead><tr><th>Topic</th><th>Replies</th></tr></thead><tbody><tr><td><a href="/forum/topic/123/title">Follow</a></td></tr></tbody></table><a>Start New Topic</a>', '새 글 작성'],
  ['/forum/topic/203871747/example', 'forum-topic', '<div id="topic-guts"><h1>Follow</h1><strong>Follow topic:</strong><label><input type="checkbox" value="byEmail"> Email</label><a>Post Reply</a></div>', '답글 작성'],
] as const;

describe('directory and community page localization', () => {
  const initialUrl = window.location.href;
  let localizer: DirectPageLocalizer;
  beforeEach(() => { localizer = new DirectPageLocalizer(); });
  afterEach(() => { localizer.restore(); document.body.innerHTML = ''; window.location.href = initialUrl; });

  it.each(cases)('localizes %s while retaining names and navigation', (path, kind, html, translated) => {
    window.location.href = `https://www.mountainproject.com${path}`;
    document.body.innerHTML = `${html}<a id="name" href="/user/123/person"><strong>Follow</strong></a>`;
    const before = document.body.innerHTML;
    const originalHrefs = [...document.querySelectorAll('a')].map((anchor) => anchor.getAttribute('href'));
    const option = document.querySelector('option');
    const value = option?.value;
    const input = document.querySelector<HTMLInputElement>('input[name="location"]');
    const listener = vi.fn();
    document.querySelector('button')?.addEventListener('click', listener);
    expect(detectPage(new URL(window.location.href))).toBe(kind);
    localizer.apply();
    localizer.apply();
    expect(document.body.textContent).toContain(translated);
    if (document.querySelector('.gym-count')) {
      expect(document.querySelector('.gym-count')?.textContent).toBe('클라이밍 짐 38곳');
    }
    expect(document.querySelector('#name')?.textContent).toBe('Follow');
    expect([...document.querySelectorAll('a')].map((anchor) => anchor.getAttribute('href'))).toEqual(originalHrefs);
    if (option) expect(option.value).toBe(value);
    if (input) expect(input.value).toBe('Boulder');
    document.querySelector('button')?.click();
    if (document.querySelector('button')) expect(listener).toHaveBeenCalledOnce();
    localizer.restore();
    expect(document.body.innerHTML).toBe(before);
  });

  it('preserves forum quoted/code content and collects only authored comment fragments', () => {
    window.location.href = 'https://www.mountainproject.com/forum/topic/123/example';
    document.body.innerHTML = '<table id="forum-table"><tbody><tr class="message-row"><td><div class="bio"><a href="/user/1/person">Alex</a></div><div class="fr-view"><p>Looking for a climbing partner this weekend.</p><blockquote><p>Quoted English sentence.</p></blockquote><pre>code example</pre><div class="signature">My signature</div></div></td></tr></tbody></table>';
    const adapter = new MountainProjectPageAdapter();
    const targets = adapter.collectCommentTargets();
    expect(targets).toHaveLength(1);
    expect(targets[0]?.category).toBe('comment');
    expect(targets[0]?.semanticSource).toContain('Looking for a climbing partner this weekend.');
    expect(adapter.collectCommentTargets()[0]?.id).toBe(targets[0]?.id);
    expect(resolveMountainProjectPageCapabilities(new URL(window.location.href)).authoredTranslation).toBe(true);
    localizer.apply();
    expect(document.querySelector('blockquote')?.textContent).toBe('Quoted English sentence.');
    const renderer = new OriginalPreservingRenderer();
    renderer.render(targets[0]!, targets[0]!.source
      .replace('Looking for a climbing partner this weekend.', '이번 주말 등반 파트너를 찾습니다.'));
    expect(Array.from(document.querySelector('.bio > a')!.nextElementSibling!.classList).sort())
      .toEqual(['mpkr-original-toggle-host', 'mpkr-translation-actions']);
    expect(document.querySelector('blockquote')?.textContent).toBe('Quoted English sentence.');
    renderer.destroy();
    adapter.restore();
  });

  it('collects activity comment text without swallowing the view link or author', () => {
    window.location.href = 'https://www.mountainproject.com/whats-new?type=comments';
    document.body.innerHTML = '<div id="whats-new"><table><tbody><tr class="comment-row"><td><a href="/user/1/alex">Alex</a><div class="row"><div class="col-md-12"><span class="new-indicator">*</span> Good route with nice climbing. <a href="/route/1/example#Comment-2"><strong>View Comment</strong></a></div></div></td></tr></tbody></table></div>';
    const before = document.body.innerHTML;
    const adapter = new MountainProjectPageAdapter();
    const targets = adapter.collectCommentTargets();
    expect(targets).toHaveLength(1);
    expect(targets[0]?.semanticSource).toBe('Good route with nice climbing.');
    expect(targets[0]?.category).toBe('comment');
    localizer.apply();
    expect(document.body.textContent).toContain('댓글 보기');
    localizer.restore();
    adapter.restore();
    expect(document.body.innerHTML).toBe(before);
  });

  it('translates authored gym descriptions and comments while preserving gym contact data', () => {
    window.location.href = 'https://www.mountainproject.com/gym/116998710/new-orleans-boulder-lounge';
    document.body.innerHTML = `
      <div id="climbing-gyms">
        <div class="row pt-main-content"><h1>New Orleans Boulder Lounge</h1></div>
        <div class="gym-info"><strong>Gym Information:</strong><div><a href="http://climbnobl.com/">climbnobl.com</a></div><div>504-962-7609</div><div>2360 St. Claude Ave New Orleans, LA 70117</div></div>
        <h2>Description</h2><div><div class="fr-view"><p>A welcoming home for the local climbing community.</p></div></div>
        <div class="comments"><div class="comment-list"><div id="Comment-1"><a class="comment-author" href="/user/1/alex">Alex</a><div class="comment-body"><div>Friendly staff and excellent bouldering.</div><time class="comment-time">Jan 1</time></div></div></div></div>
      </div>`;
    const adapter = new MountainProjectPageAdapter();
    const pageTargets = adapter.collectPageTargets();
    const commentTargets = adapter.collectCommentTargets();
    const capabilities = resolveMountainProjectPageCapabilities(new URL(window.location.href));

    expect(capabilities.pageKind).toBe('gym');
    expect(capabilities.authoredTranslation).toBe(true);
    expect(pageTargets).toHaveLength(1);
    expect(pageTargets[0]?.source).toBe('A welcoming home for the local climbing community.');
    expect(commentTargets).toHaveLength(1);
    expect(commentTargets[0]?.source).toBe('Friendly staff and excellent bouldering.');

    const originalContact = document.querySelector('.gym-info')?.textContent;
    localizer.apply();
    expect(document.querySelector('.gym-info strong')?.textContent).toBe('클라이밍 짐 정보:');
    expect(document.querySelector('.gym-info')?.textContent).toContain('climbnobl.com');
    expect(document.querySelector('.gym-info')?.textContent).toContain('504-962-7609');
    expect(document.querySelector('.gym-info')?.textContent).toContain('2360 St. Claude Ave New Orleans, LA 70117');

    const renderer = new OriginalPreservingRenderer();
    renderer.render(commentTargets[0]!, '친절한 직원과 훌륭한 볼더링 시설입니다.');
    expect(Array.from(document.querySelector('.comment-author')!.nextElementSibling!.classList).sort())
      .toEqual(['mpkr-original-toggle-host', 'mpkr-translation-actions']);
    renderer.destroy();
    localizer.restore();
    adapter.restore();
    expect(document.querySelector('.gym-info')?.textContent).toBe(originalContact);
  });

  it('localizes appended UI without repeatedly changing it', async () => {
    window.location.href = 'https://www.mountainproject.com/gyms';
    document.body.innerHTML = '<main></main>';
    localizer.apply();
    document.querySelector('main')!.innerHTML = '<span>12 Gyms</span>';
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(document.querySelector('span')?.textContent).toBe('클라이밍 짐 12곳');
    localizer.restore();
    expect(document.querySelector('span')?.textContent).toBe('12 Gyms');
  });
});
