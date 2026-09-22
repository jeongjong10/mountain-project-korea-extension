import { DirectPageLocalizer } from './direct-page-localizer';

async function flushMutations(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('DirectPageLocalizer contact and user subpages', () => {
  beforeEach(() => {
    document.head.innerHTML = '<base href="https://www.mountainproject.com/">';
    document.body.innerHTML = '';
  });

  it('translates contact form chrome and restores it without changing recipient or entered values', async () => {
    document.body.innerHTML = `
      <main id="contact-user" data-contact-user="203817867">
        <h1>Send a Message to Joel Jeong</h1>
        <form action="/contact-user/203817867" method="post" aria-label="Contact user form">
          <a class="recipient-name" href="/user/203817867/joel-jeong">Joel Jeong</a>
          <label for="email">Your Email Address</label>
          <input id="email" name="email" type="email" value="climber@example.com" placeholder="Your email address">
          <label for="subject">Subject</label>
          <input id="subject" name="subject" value="Weekend climbing" placeholder="Enter a subject">
          <label for="message">Message</label>
          <textarea id="message" name="message" placeholder="Write your message">Existing draft</textarea>
          <label><input id="copy" name="copy" type="checkbox" checked> Email me a copy</label>
          <button type="submit" data-action="send">Send Message</button>
          <div role="status">Sending...</div>
        </form>
      </main>
    `;
    const form = document.querySelector<HTMLFormElement>('form')!;
    const message = document.querySelector<HTMLTextAreaElement>('#message')!;
    const localizer = new DirectPageLocalizer();

    localizer.apply(document);

    expect(document.querySelector('h1')?.textContent).toBe('Joel Jeong에게 메시지 보내기');
    expect(document.querySelector('.recipient-name')?.textContent).toBe('Joel Jeong');
    expect(document.querySelector('label[for="email"]')?.textContent).toBe('내 이메일 주소');
    expect(document.querySelector('label[for="subject"]')?.textContent).toBe('제목');
    expect(document.querySelector('label[for="message"]')?.textContent).toBe('메시지');
    expect(document.querySelector<HTMLInputElement>('#email')?.placeholder).toBe('내 이메일 주소');
    expect(document.querySelector<HTMLInputElement>('#subject')?.placeholder).toBe('제목 입력');
    expect(message.placeholder).toBe('메시지 작성');
    expect(message.value).toBe('Existing draft');
    expect(document.querySelector<HTMLInputElement>('#subject')?.value).toBe('Weekend climbing');
    expect(document.querySelector<HTMLInputElement>('#email')?.value).toBe('climber@example.com');
    expect(document.querySelector<HTMLInputElement>('#copy')?.checked).toBe(true);
    expect(document.querySelector('button')?.textContent).toBe('메시지 보내기');
    expect(document.querySelector('[role="status"]')?.textContent).toBe('보내는 중...');
    expect(form.action).toContain('/contact-user/203817867');
    expect(form.method).toBe('post');
    expect(form.getAttribute('aria-label')).toBe('사용자 연락 양식');

    const alert = document.createElement('div');
    alert.setAttribute('role', 'alert');
    alert.textContent = 'Please enter a message.';
    form.append(alert);
    await flushMutations();
    expect(alert.textContent).toBe('메시지를 입력해 주세요.');

    localizer.restore();
    expect(document.querySelector('h1')?.textContent).toBe('Send a Message to Joel Jeong');
    expect(document.querySelector('label[for="email"]')?.textContent).toBe('Your Email Address');
    expect(message.placeholder).toBe('Write your message');
    expect(message.value).toBe('Existing draft');
    expect(form.getAttribute('aria-label')).toBe('Contact user form');
    expect(alert.textContent).toBe('Please enter a message.');
  });

  it('translates contributions chrome while preserving identity, routes, areas, dates, and actions', async () => {
    document.body.innerHTML = `
      <main id="user-profile" data-user-id="203817867">
        <div id="user-info"><h2>Community</h2></div>
        <nav aria-label="User profile navigation">
          <a href="/user/203817867/joel-jeong">Out There</a>
          <a href="/user/203817867/joel-jeong/contributions">Contributions</a>
          <a href="/user/203817867/joel-jeong/community">Community</a>
        </nav>
        <h2>Joel Jeong's Contributions</h2>
        <label for="kind">Contribution Type</label>
        <select id="kind"><option>All Contributions</option><option>Page Improvements</option></select>
        <table data-table="contributions">
          <thead><tr><th>Item</th><th>Type</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
          <tbody><tr>
            <td><a id="route-name" href="/route/106232568/chouinard-b">Chouinard B</a></td>
            <td>Route Details</td><td>Approved</td><td id="date">Sep 20, 2026</td>
            <td><a id="change" href="/user/203817867/improvements/1">View Change</a></td>
          </tr></tbody>
        </table>
        <div class="pagination"><a href="?page=2">Next</a></div>
      </main>
    `;
    const route = document.querySelector<HTMLAnchorElement>('#route-name')!;
    const change = document.querySelector<HTMLAnchorElement>('#change')!;
    const localizer = new DirectPageLocalizer();
    localizer.apply(document);

    expect(document.querySelector('#user-info h2')?.textContent).toBe('Community');
    expect(Array.from(document.querySelectorAll('nav a')).map((item) => item.textContent))
      .toEqual(['활동 내역', '기여', '커뮤니티']);
    expect(document.querySelector('main > h2')?.textContent).toBe('Joel Jeong의 기여');
    expect(document.querySelector('label')?.textContent).toBe('기여 유형');
    expect(Array.from(document.querySelectorAll('option')).map((item) => item.textContent))
      .toEqual(['모든 기여', '페이지 개선']);
    expect(Array.from(document.querySelectorAll('th')).map((item) => item.textContent))
      .toEqual(['항목', '유형', '상태', '날짜', '작업']);
    expect(route.textContent).toBe('Chouinard B');
    expect(route.href).toContain('/route/106232568/chouinard-b');
    expect(document.querySelector('tbody td:nth-child(2)')?.textContent).toBe('루트 상세 정보');
    expect(document.querySelector('tbody td:nth-child(3)')?.textContent).toBe('승인됨');
    expect(document.querySelector('#date')?.textContent).toBe('Sep 20, 2026');
    expect(change.textContent).toBe('변경사항 보기');
    expect(change.getAttribute('href')).toBe('/user/203817867/improvements/1');
    expect(document.querySelector('.pagination a')?.textContent).toBe('다음');

    const empty = document.createElement('div');
    empty.setAttribute('role', 'status');
    empty.textContent = 'No contributions yet.';
    document.querySelector('main')!.append(empty);
    await flushMutations();
    expect(empty.textContent).toBe('아직 기여 내역이 없습니다.');

    localizer.restore();
    expect(document.querySelector('main > h2')?.textContent).toBe("Joel Jeong's Contributions");
    expect(change.textContent).toBe('View Change');
    expect(empty.textContent).toBe('No contributions yet.');
  });

  it('translates community activity chrome while preserving authored comments and linked names', async () => {
    document.body.innerHTML = `
      <main id="user-profile" data-user-id="203817867">
        <div id="user-info"><h2>Joel Jeong</h2></div>
        <h2>Joel Jeong's Posts and Comments</h2>
        <div class="filters"><button>Comments</button><button>Forum Posts</button></div>
        <article data-comment-id="77">
          <a class="comment-author" href="/user/7/climber">Climber Kim</a>
          <div class="comment-body">The route was dry and the anchors were solid.</div>
          <time>Sep 21, 2026</time>
          <a class="activity-action" href="/route/1/example#Comment-77">View Comment</a>
        </article>
        <div role="status">Loading community activity</div>
      </main>
    `;
    const action = document.querySelector<HTMLAnchorElement>('.activity-action')!;
    const localizer = new DirectPageLocalizer();
    localizer.apply(document);

    expect(document.querySelector('main > h2')?.textContent)
      .toBe('Joel Jeong의 게시글과 댓글');
    expect(Array.from(document.querySelectorAll('.filters button')).map((item) => item.textContent))
      .toEqual(['댓글', '포럼 게시물']);
    expect(document.querySelector('.comment-author')?.textContent).toBe('Climber Kim');
    expect(document.querySelector('.comment-body')?.textContent)
      .toBe('The route was dry and the anchors were solid.');
    expect(document.querySelector('time')?.textContent).toBe('Sep 21, 2026');
    expect(action.textContent).toBe('댓글 보기');
    expect(action.href).toContain('/route/1/example#Comment-77');
    expect(document.querySelector('[role="status"]')?.textContent)
      .toBe('커뮤니티 활동 불러오는 중');

    const next = document.createElement('button');
    next.textContent = 'View Message';
    document.querySelector('main')!.append(next);
    await flushMutations();
    expect(next.textContent).toBe('메시지 보기');

    localizer.restore();
    expect(document.querySelector('main > h2')?.textContent)
      .toBe("Joel Jeong's Posts and Comments");
    expect(action.textContent).toBe('View Comment');
    expect(next.textContent).toBe('View Message');
  });
});
