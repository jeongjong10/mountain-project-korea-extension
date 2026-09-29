import { DirectPageLocalizer } from '@/localization/direct-page-localizer';
import { AUTHENTICATED_DROPDOWNS_FIXTURE } from '../fixtures/mountain-project/authenticated-dropdowns';

const text = (selector: string): string =>
  document.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim() ?? '';

describe('authenticated dropdown localization contract', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/area/106225629/south-korea');
    document.head.innerHTML = '<base href="https://www.mountainproject.com/">';
    document.body.innerHTML = AUTHENTICATED_DROPDOWNS_FIXTURE;
  });

  it('localizes fixed dropdown chrome while preserving entity data and server values', () => {
    const hrefs = [...document.querySelectorAll<HTMLAnchorElement>('a[href]')]
      .map((anchor) => [anchor.id, anchor.getAttribute('href')]);
    const values = [...document.querySelectorAll<HTMLElement>('[data-value], [data-sort-order-name]')]
      .map((element) => [element.getAttribute('data-value'), element.getAttribute('data-sort-order-name')]);
    const loginContexts = [...document.querySelectorAll<HTMLElement>('[data-login-context]')]
      .map((element) => [element.id, element.getAttribute('data-login-context')]);
    const onclickValues = [...document.querySelectorAll<HTMLElement>('[onclick]')]
      .map((element) => [element.id, element.getAttribute('onclick')]);
    const localizer = new DirectPageLocalizer();

    localizer.apply(document);

    expect(text('#improve-trigger')).toBe('이 페이지 개선');
    expect(text('#wrong-map-item')).toBe('지도 위치가 잘못되었나요?');
    expect(text('#suggest-header')).toBe('변경 제안:');
    expect(text('#suggest-item')).toBe('변경 제안');
    expect(text('#flag-name-item')).toBe('차별적 명칭 신고');
    expect(text('#other-suggestion-item')).toBe('기타 제안');
    expect(text('#route-sort-item')).toBe('루트 정렬');
    expect(text('#description-item')).toBe('설명');
    expect(text('#getting-there-item')).toBe('가는 방법');
    expect(text('#photo-improvement-item')).toBe('사진');
    expect(text('#edit-item')).toBe('지역 편집');
    expect(text('#updates-item')).toBe('페이지 변경 내역 보기');
    expect(text('#add-trigger')).toBe('페이지에 추가');
    expect(text('#add-route')).toBe('루트');
    expect(text('#add-area')).toBe('하위 지역');
    expect(text('#add-photo')).toBe('사진');
    expect(text('#copy-photo')).toBe('사진 복사');
    expect(text('#add-video')).toBe('동영상');
    expect(text('#add-trail')).toBe('접근로/하산로');
    expect(text('#add-book')).toBe('가이드북');
    expect(text('#actions-trigger')).toBe('이 페이지 공유');
    expect(text('#delete-item')).toBe('삭제');
    expect(text('#add-photo-fallback')).toBe('사진 추가');
    expect(text('#photo-trigger')).toBe('새 사진 추가');
    expect(text('#photo-copy-item')).toBe('사진 복사');
    expect(text('#route-type-label')).toBe('강조');
    expect([...document.querySelectorAll('.route-type-option')].map((item) => item.textContent?.trim()))
      .toEqual(['모든 루트 표시', '트래드', '스포츠']);
    expect(text('#sort-dropdown strong')).toBe('정렬:');
    expect(text('#sort-dropdown .current-sort')).toBe('오래된순');
    expect([...document.querySelectorAll('.comments-sort')].map((item) => item.textContent?.trim()))
      .toEqual(['최신순', '오래된순', '인기순']);
    expect(text('#profile-item')).toBe('프로필');
    expect(text('#ticks-item')).toBe('내 등반 기록');
    expect(text('#account-item')).toBe('계정 설정');
    expect(text('#logout-item')).toBe('로그아웃');

    expect(text('#user-trigger')).toBe('Jean Kang');
    expect(text('#area-name')).toBe('Sport');
    expect(text('#route-name')).toBe('Popular');
    expect(text('#user-name')).toBe('Profile');
    expect(text('#photo-title')).toBe('Highlight');
    expect(text('#nested-route-name')).toBe('Popular');
    expect(text('#nested-photo-caption')).toBe('Popular');
    expect([...document.querySelectorAll<HTMLAnchorElement>('a[href]')]
      .map((anchor) => [anchor.id, anchor.getAttribute('href')])).toEqual(hrefs);
    expect([...document.querySelectorAll<HTMLElement>('[data-value], [data-sort-order-name]')]
      .map((element) => [element.getAttribute('data-value'), element.getAttribute('data-sort-order-name')]))
      .toEqual(values);
    expect([...document.querySelectorAll<HTMLElement>('[data-login-context]')]
      .map((element) => [element.id, element.getAttribute('data-login-context')]))
      .toEqual(loginContexts);
    expect([...document.querySelectorAll<HTMLElement>('[onclick]')]
      .map((element) => [element.id, element.getAttribute('onclick')]))
      .toEqual(onclickValues);
  });

  it('localizes dynamically inserted menu items and route-filter selection changes', async () => {
    const localizer = new DirectPageLocalizer();
    localizer.apply(document);

    document.querySelector('#route-type-label')!.textContent = 'Sport Routes in Red';
    const wrapper = document.createElement('div');
    wrapper.className = 'replacement-menu-section';
    wrapper.innerHTML = `
      <div class="dropdown-item"><span id="dynamic-updates">Page Updates (admin only)</span></div>
      <div class="dropdown-item"><span id="dynamic-guidebook">Add Guidebook</span></div>
      <a id="dynamic-wrong-map" class="dropdown-item require-user"
        href="/improvement/map-location?id=106225629"
        data-login-context="wrong-map-location">Wrong Map Location?</a>
      <a id="dynamic-photo-copy" class="dropdown-item require-user"
        href="/edit/imageLink/106225629?type=album"
        data-login-context="copy-photo"
        onclick="return photoClicked(112102756);">Photo (copy)</a>
      <a class="dropdown-item" href="/area/106225629/south-korea">
        <span id="dynamic-area-name">Sport</span>
      </a>
    `;
    document.querySelector('.improve-page-general .dropdown-menu')!.replaceChildren(wrapper);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(text('#route-type-label')).toBe('스포츠 루트 빨간색');
    expect(text('#dynamic-updates')).toBe('페이지 변경 내역(관리자 전용)');
    expect(text('#dynamic-guidebook')).toBe('가이드북 추가');
    expect(text('#dynamic-wrong-map')).toBe('지도 위치가 잘못되었나요?');
    expect(text('#dynamic-photo-copy')).toBe('사진 복사');
    expect(text('#dynamic-area-name')).toBe('Sport');
    expect(document.querySelector('#dynamic-wrong-map')?.getAttribute('href'))
      .toBe('/improvement/map-location?id=106225629');
    expect(document.querySelector('#dynamic-wrong-map')?.getAttribute('data-login-context'))
      .toBe('wrong-map-location');
    expect(document.querySelector('#dynamic-photo-copy')?.getAttribute('onclick'))
      .toBe('return photoClicked(112102756);');
  });
});
