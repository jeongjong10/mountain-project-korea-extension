import communityFixture from './fixtures/chan-kim-community.html?raw';
import contributionsFixture from './fixtures/chan-kim-contributions.html?raw';
import { DirectPageLocalizer } from '@/localization/direct-page-localizer';

async function flushMutations(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

function text(selector: string): string {
  return document.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
}

describe('DirectPageLocalizer synthetic user subpages', () => {
  beforeEach(() => {
    document.head.innerHTML = '<base href="https://www.mountainproject.com/">';
  });

  it('translates community DOM controls while preserving authored content, names, dates, counts, and links', async () => {
    document.body.innerHTML = communityFixture;
    const commentAction = document.querySelector<HTMLAnchorElement>('#comments-section a[href*="#Comment-"]')!;
    const forumAction = document.querySelector<HTMLAnchorElement>('#forum-section a[href*="/forum/"]')!;
    const localizer = new DirectPageLocalizer();

    localizer.apply(document);

    expect(text('#user-info h2')).toBe('Fixture Climber A');
    expect(Array.from(document.querySelectorAll('.nav-tabs h3')).map((node) => node.textContent?.replace(/\s+/g, ' ').trim()))
      .toEqual(['활동 내역 (12)', '기여 (34)', '커뮤니티 (56)']);
    expect(text('#comments-section .section-title h2')).toBe('댓글 전체 7개 보기');
    expect(text('#forum-section .section-title h2')).toBe('포럼 메시지 전체 9개 보기');
    expect(text('.section:last-child .section-title h2')).toBe('루트 평가 전체 45개 보기');
    expect(text('.comment-row .col-md-12')).toBe('Fictional note: the blue marker identifies the second practice station. 댓글 보기');
    expect(text('.forum-message-row > td > .mb-half > strong')).toBe('Fixture discussion: organizing sample equipment');
    expect(text('.forum-message-row > td > div:last-child')).toContain('This invented message checks that forum text stays unchanged.');
    expect(commentAction.textContent).toBe('댓글 보기');
    expect(forumAction.textContent).toBe('메시지 보기');
    expect(commentAction.getAttribute('href')).toBe('/route/900000102/fixture-ribbon#Comment-900000103');
    expect(text('.comment-row .float-xs-right')).toBe('2025년 2월 6일');

    const lateSection = document.createElement('div');
    lateSection.className = 'section clearfix';
    lateSection.innerHTML = '<div class="section-title"><h2>Forum Messages <span><a href="/user/900000001/fixture-climber-a/forum-messages">View All 10</a></span></h2></div>';
    document.querySelector('#user-profile')!.append(lateSection);
    await flushMutations();
    expect(text('.section:last-child h2')).toBe('포럼 메시지 전체 10개 보기');

    localizer.restore();
    expect(text('#comments-section .section-title h2')).toBe('Comments View All 7');
    expect(commentAction.textContent).toBe('View Comment');
    expect(text('.section:last-child h2')).toBe('Forum Messages View All 10');
  });

  it('translates contributions DOM controls while preserving route, area, photo, date, and action data', async () => {
    document.body.innerHTML = contributionsFixture;
    const routeLink = document.querySelector<HTMLAnchorElement>('#routes-section a[href*="/route/"]')!;
    const areaLink = document.querySelector<HTMLAnchorElement>('#areas-section a[href*="/area/"]')!;
    const photo = document.querySelector<HTMLImageElement>('#photos-section img')!;
    const improvement = document.querySelector<HTMLAnchorElement>('.view-improvement-diff-modal')!;
    const localizer = new DirectPageLocalizer();

    localizer.apply(document);

    expect(text('#routes-section .section-title h2')).toBe('공유한 루트 전체 13개 보기');
    expect(text('#areas-section .section-title h2')).toBe('공유한 지역 전체 15개 보기');
    expect(text('#photos-section .section-title h2')).toBe('공유한 사진 전체 16개 보기');
    expect(Array.from(document.querySelectorAll('#routes-section .screen-reader-only th')).map((node) => node.textContent))
      .toEqual(['루트명', '위치', '별점', '난이도', '날짜']);
    expect(Array.from(document.querySelectorAll('#areas-section th')).map((node) => node.textContent))
      .toEqual(['지역', '위치', '날짜']);
    expect(routeLink.textContent?.replace(/\s+/g, ' ').trim()).toContain('Fixture Window');
    expect(routeLink.getAttribute('href')).toBe('/route/900000105/fixture-window');
    expect(areaLink.textContent).toBe('Fixture Terrace');
    expect(photo.alt).toBe('Synthetic photo caption: three colored flags on a practice wall.');
    expect(text('#improvements-section .section-title h2')).toBe('페이지 개선 전체 9개 보기');
    expect(text('#improvements-section .mp-improvements-table')).toContain('상태: 승인됨');
    expect(improvement.textContent).toBe('변경사항 보기');
    expect(improvement.dataset.id).toBe('900000110');
    expect(document.body.textContent).toContain('아직 없습니다.');
    expect(document.body.textContent).toContain('즐겨찾는 클라이밍 짐이 목록에 있는지 확인하세요');
    expect(document.body.textContent).toContain('개인 앨범은 루트 데이터베이스에 속하지 않는 사진을 위한 공간입니다.');

    const lateHeading = document.createElement('h2');
    lateHeading.textContent = 'Shared Routes';
    document.querySelector('#user-profile')!.append(lateHeading);
    await flushMutations();
    expect(lateHeading.textContent).toBe('공유한 루트');

    localizer.restore();
    expect(text('#routes-section .section-title h2')).toBe('Shared Routes View All 13');
    expect(improvement.textContent).toBe('View Change');
    expect(lateHeading.textContent).toBe('Shared Routes');
  });
});
