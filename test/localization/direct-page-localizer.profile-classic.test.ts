import { DirectPageLocalizer } from '@/localization/direct-page-localizer';

async function flushMutations(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('DirectPageLocalizer profile and classic-vote chrome', () => {
  beforeEach(() => {
    document.head.innerHTML = '<base href="https://www.mountainproject.com/">';
    document.body.innerHTML = '';
  });

  it('translates a general user profile while preserving identity, authored content, and values', async () => {
    document.body.innerHTML = `
      <div id="user-profile" data-user-id="4242">
        <div id="user-info">
          <h2>Community</h2>
          <div class="location">Seoul, South Korea</div>
          <a class="btn" href="#ignore">Ignore User</a>
          <a id="view-bio" href="#">More About Community</a>
          <div id="bio">
            <strong>Member Since</strong><div id="joined">Jan 13, 2016</div>
            <div class="note small">Last Visit: Sep 22, 2026</div>
            <strong id="points-total">1,234 Points</strong>
            <strong id="point-rank">Point Rank: #56</strong>
            <div class="user-points">
              <div class="title"><strong>33 Routes</strong></div>
              <div class="details small">330 pts - 10 each</div>
            </div>
            <div class="bio-detail"><strong>More Info</strong>
              <div class="fr-view"><p><span id="bio-copy">Comments are my favorite topic.</span></p></div>
            </div>
          </div>
        </div>
        <ul class="nav nav-tabs">
          <li><a class="nav-link" href="/user/4242/community"><h3>Out There <span>(107)</span></h3></a></li>
          <li><a class="nav-link" href="/user/4242/community/contributions"><h3>Contributions <span>(85)</span></h3></a></li>
          <li><a class="nav-link" href="/user/4242/community/community"><h3>Community <span>(79)</span></h3></a></li>
        </ul>
        <div class="section-title"><h2>To-Do List <span><a href="/user/4242/community/climb-todo-list">Sort &amp; Filter All 35</a></span></h2></div>
        <table><thead><tr><th>Route Name</th><th>Location</th><th>Date</th></tr></thead>
          <tbody><tr class="route-row" data-name="Sport">
            <td><a id="route-name" href="/route/1/sport">Sport</a></td>
            <td><a id="area-name" href="/area/2/community">Community</a></td>
            <td id="tick-date">Sep 20, 2026</td>
          </tr></tbody>
        </table>
        <div class="section-title"><h2>Tick Breakdown</h2></div>
        <table><tr><th>Pitches</th><th>Routes</th><th>Days Out</th></tr><tr><td><strong>90 Days</strong></td><td>12</td><td>3</td></tr></table>
        <nav class="pagination"><a href="?page=1">Previous</a><a href="?page=3">Next</a></nav>
        <div role="status">Loading...</div><div role="alert">No comments yet.</div>
        <div class="comment-body"><a class="comment-author" href="/user/7/comments">Comments</a><span id="comment-copy">Activity is fun.</span></div>
      </div>
    `;
    const route = document.querySelector<HTMLAnchorElement>('#route-name')!;
    const localizer = new DirectPageLocalizer();
    localizer.apply(document);

    expect(document.querySelector('#user-info h2')?.textContent).toBe('Community');
    expect(document.querySelector('.location')?.textContent).toBe('Seoul, South Korea');
    expect(document.querySelector('#user-info .btn')?.textContent).toBe('사용자 무시');
    expect(document.querySelector('#view-bio')?.textContent).toBe('Community 추가 정보');
    expect(document.querySelector('#bio strong')?.textContent).toBe('가입일');
    expect(document.querySelector('.note')?.textContent).toBe('마지막 방문: 2026년 9월 22일');
    expect(document.querySelector('#points-total')?.textContent).toBe('1,234 포인트');
    expect(document.querySelector('#point-rank')?.textContent).toBe('포인트 순위: #56');
    expect(document.querySelector('.user-points .title')?.textContent).toBe('루트 33개');
    expect(document.querySelector('.user-points .details')?.textContent).toBe('330점 · 각 10점');
    expect(document.querySelector('#bio-copy')?.textContent).toBe('Comments are my favorite topic.');
    expect(Array.from(document.querySelectorAll('.nav-tabs h3')).map((item) => item.textContent?.replace(/\s+/g, ' ').trim()))
      .toEqual(['활동 내역 (107)', '기여 (85)', '커뮤니티 (79)']);
    expect(document.querySelector('.section-title a')?.textContent)
      .toBe('정렬 및 필터 · 전체 35개');
    expect(Array.from(document.querySelectorAll('thead th')).map((item) => item.textContent))
      .toEqual(['루트명', '위치', '날짜']);
    expect(document.querySelector('#route-name')).toBe(route);
    expect(route.textContent).toBe('Sport');
    expect(route.href).toContain('/route/1/sport');
    expect(document.querySelector('#area-name')?.textContent).toBe('Community');
    expect(document.querySelector('#tick-date')?.textContent).toBe('2026년 9월 20일');
    expect(document.querySelector('.comment-author')?.textContent).toBe('Comments');
    expect(document.querySelector('#comment-copy')?.textContent).toBe('Activity is fun.');
    expect(document.querySelector('[role="status"]')?.textContent).toBe('불러오는 중...');
    expect(document.querySelector('[role="alert"]')?.textContent).toBe('아직 댓글이 없습니다.');

    const activity = document.createElement('h2');
    activity.textContent = 'Recent Activity';
    document.querySelector('#user-profile')!.append(activity);
    await flushMutations();
    expect(activity.textContent).toBe('최근 활동');

    localizer.restore();
    expect(document.querySelector('#user-info .btn')?.textContent).toBe('Ignore User');
    expect(document.querySelector('.note')?.textContent).toBe('Last Visit: Sep 22, 2026');
    expect(document.querySelector('.nav-tabs h3')?.textContent?.replace(/\s+/g, ' ').trim())
      .toBe('Out There (107)');
    expect(activity.textContent).toBe('Recent Activity');
  });

  it('translates only fixed .is_classic_vote UI and preserves its controls and owned values', async () => {
    document.body.innerHTML = `
      <form class="is_classic_vote" data-route-id="987" action="/ajax/classic-vote">
        <strong>Is this route a classic?</strong>
        <a class="route-name" href="/route/987/yes" data-route-name="Yes">Yes</a>
        <span class="vote-count">12 votes</span>
        <button id="classic-yes" type="button" data-vote="yes" aria-label="Vote for this route as a classic">Yes</button>
        <button id="classic-no" type="button" data-vote="no">No</button>
        <input id="classic-submit" type="submit" value="Submit Vote">
      </form>
    `;
    const button = document.querySelector<HTMLButtonElement>('#classic-yes')!;
    const form = document.querySelector<HTMLFormElement>('form')!;
    let clicks = 0;
    button.addEventListener('click', () => { clicks += 1; });
    const localizer = new DirectPageLocalizer();
    localizer.apply(document);
    localizer.apply(document);

    expect(document.querySelector('.is_classic_vote strong')?.textContent)
      .toBe('이 루트가 클래식인가요?');
    expect(document.querySelector('.route-name')?.textContent).toBe('Yes');
    expect(document.querySelector('.vote-count')?.textContent).toBe('12표');
    expect(button.textContent).toBe('예');
    expect(button.getAttribute('aria-label')).toBe('이 루트를 클래식으로 추천');
    expect(document.querySelector('#classic-no')?.textContent).toBe('아니요');
    expect(document.querySelector<HTMLInputElement>('#classic-submit')?.value).toBe('Submit Vote');
    expect(form.dataset.routeId).toBe('987');
    expect(form.action).toContain('/ajax/classic-vote');
    expect(button.dataset.vote).toBe('yes');
    button.click();
    expect(clicks).toBe(1);

    const thanks = document.createElement('span');
    thanks.textContent = 'Thanks for voting!';
    form.append(thanks);
    await flushMutations();
    expect(thanks.textContent).toBe('투표해 주셔서 감사합니다!');

    localizer.restore();
    expect(document.querySelector('.is_classic_vote strong')?.textContent)
      .toBe('Is this route a classic?');
    expect(button.textContent).toBe('Yes');
    expect(button.getAttribute('aria-label')).toBe('Vote for this route as a classic');
    expect(document.querySelector<HTMLInputElement>('#classic-submit')?.value).toBe('Submit Vote');
    expect(thanks.textContent).toBe('Thanks for voting!');
  });
});
