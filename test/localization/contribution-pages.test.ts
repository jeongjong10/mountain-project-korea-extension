import { DirectPageLocalizer } from '@/localization/direct-page-localizer';
import {
  COMMENT_SORT_DROPDOWN_FIXTURE,
  CONTRIBUTION_ACTION_MENUS_FIXTURE,
  CONTRIBUTION_GUEST_ACCESS_FIXTURE,
  CONTRIBUTION_GUEST_AJAX_FORMS_FIXTURE,
  CONTRIBUTION_FLAG_MODAL_FIXTURE,
  CONTRIBUTION_OVERLAYS_FIXTURE,
  CONTRIBUTION_VARIANT_FORMS_FIXTURE,
} from '../fixtures/mountain-project/contribution-action-overlays';
import {
  CONTRIBUTION_NEW_ROUTE_DYNAMIC_FROALA_FIXTURE,
  CONTRIBUTION_NEW_ROUTE_FIXTURE,
} from '../fixtures/mountain-project/contribution-new-route';
import { CONTRIBUTION_IMPROVEMENT_MODAL_FIXTURES } from '../fixtures/mountain-project/contribution-improvement-modals';
import {
  CONTRIBUTION_FIRST_AREA_FAQ_TITLE,
  CONTRIBUTION_NEW_AREAS_ROUTES_FAQ_FIXTURE,
} from '../fixtures/mountain-project/contribution-new-areas-routes-faq';

function text(selector: string): string {
  return document.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
}

describe('Mountain Project contribution pages', () => {
  const initialUrl = window.location.href;
  let localizer: DirectPageLocalizer;

  beforeEach(() => {
    window.history.replaceState({}, '', '/add/climb-area/106225629');
    document.body.innerHTML = `
      <div class="row page-title">
        <h1>New Area in South Korea</h1>
        <a href="#">FAQ about new areas &amp; routes</a>
      </div>
      <form class="edit-form">
        <fieldset><label class="primary">Title</label><input name="title" value="사용자가 작성한 지역명"></fieldset>
        <fieldset>
          <label class="primary">Alpine Climbing</label>
          <label><input type="checkbox"> All climbs are "alpine".
            <span class="text-muted">The land of marmots, lichen, and a very short climbing season.</span>
          </label>
        </fieldset>
        <fieldset>
          <label class="primary">Description</label>
          <textarea placeholder="Sunny? Access fees? Crowded? Secluded? Rock type/quality?"></textarea>
        </fieldset>
        <fieldset>
          <label class="primary">Getting There</label>
          <textarea placeholder="Be specific and clear. How long is the approach?"></textarea>
        </fieldset>
        <fieldset>
          <label class="primary">Location</label>
          <p class="text-muted">If you know the exact location, enter it below, otherwise, you can either use the map below or OnX Backcountry. Decimal format: e.g.: xx.xxxx, -xxx.xxxx</p>
          <label>Latitude:</label><input placeholder="Latitude">
          <label>Longitude:</label><input placeholder="Longitude">
          <button type="button">Reset to Original</button>
          <p class="text-danger">Location unknown. You MUST move the map to the exact location of this area. If you don't know it, press "Cancel" below.</p>
        </fieldset>
        <button id="save" type="submit">Save Area</button>
        <input id="native-submit" name="commit" type="submit" value="Server Save Value">
        <input id="unchanged" type="text" value="User-authored value">
        <a class="cancel">Cancel</a>
      </form>
    `;
    localizer = new DirectPageLocalizer();
  });

  afterEach(() => {
    localizer.restore();
    document.body.innerHTML = '';
    window.history.replaceState({}, '', initialUrl);
  });

  it('translates the add/edit form chrome without changing authored field values', () => {
    localizer.apply(document);

    expect(document.querySelector('h1')?.textContent).toBe('새 지역 추가 · South Korea');
    expect(document.querySelector('.page-title a')?.textContent).toBe('새 지역과 루트 FAQ');
    expect(document.querySelector('label.primary')?.textContent).toBe('이름');
    expect(document.querySelectorAll('label.primary')[3]?.textContent).toBe('가는 방법');
    expect(document.querySelector<HTMLTextAreaElement>('textarea')?.placeholder)
      .toBe('햇빛, 접근 비용, 혼잡도, 외진 정도, 암질 등을 입력하세요.');
    expect(document.querySelector<HTMLInputElement>('input[placeholder="위도"]')).not.toBeNull();
    expect(document.querySelector<HTMLButtonElement>('button')?.textContent)
      .toBe('원래 위치로 초기화');
    expect(document.querySelector<HTMLButtonElement>('#save')?.textContent).toBe('지역 저장');
    expect(document.querySelector<HTMLInputElement>('#native-submit')?.value)
      .toBe('Server Save Value');
    expect(document.querySelector<HTMLInputElement>('#unchanged')?.value)
      .toBe('User-authored value');
    expect(document.querySelector<HTMLInputElement>('input[name="title"]')?.value)
      .toBe('사용자가 작성한 지역명');
    expect(document.querySelector('.text-muted')?.textContent).toContain('등반 가능 기간');
    expect(document.querySelector('fieldset:nth-of-type(5) .text-muted')?.textContent)
      .toContain('정확한 위치를 알고 있다면');
    expect(document.querySelector('.text-danger')?.textContent)
      .toContain('위치가 확인되지 않았습니다');
  });

  it('localizes dynamically inserted contribution controls and restores originals', async () => {
    localizer.apply(document);
    const action = document.createElement('button');
    action.type = 'submit';
    action.textContent = 'Save Changes';
    document.querySelector('form')!.append(action);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(action.textContent).toBe('변경사항 저장');
    localizer.restore();
    expect(action.textContent).toBe('Save Changes');
    expect(document.querySelector('h1')?.textContent).toBe('New Area in South Korea');
  });

  it('localizes the production guest gate and late AJAX auth forms on the hash URL', async () => {
    window.history.replaceState({}, '', '/add/climb-area/106225629#');
    document.body.innerHTML = CONTRIBUTION_GUEST_ACCESS_FIXTURE;
    const loginLink = document.querySelector<HTMLAnchorElement>('#guest-login-link')!;
    const startLink = document.querySelector<HTMLAnchorElement>('#guest-start-link')!;

    localizer.apply(document);

    expect(text('#login-modal .modal-title')).toBe('가입 또는 로그인');
    expect(text('#access-gate small')).toBe('환영합니다');
    expect(text('#access-gate h2')).toBe('무료로 커뮤니티에 참여하세요');
    expect(text('#access-gate p')).toBe('이미 계정이 있나요? 로그인하고 이 안내 닫기');
    expect(text('#guest-start-link')).toBe('시작하기');
    expect(startLink.title).toBe('가입 또는 로그인');
    expect(loginLink.title).toBe('로그인');
    expect(loginLink.getAttribute('href')).toBe('/auth/login');
    expect(startLink.getAttribute('href')).toBe('/auth/login');

    document.querySelector('#email-login')!.innerHTML = CONTRIBUTION_GUEST_AJAX_FORMS_FIXTURE.login;
    document.querySelector('#email-signup')!.innerHTML = CONTRIBUTION_GUEST_AJAX_FORMS_FIXTURE.signup;
    document.querySelector('#forgot-password')!.innerHTML = CONTRIBUTION_GUEST_AJAX_FORMS_FIXTURE.forgot;
    await new Promise((resolve) => setTimeout(resolve, 0));

    const loginForm = document.querySelector<HTMLFormElement>('#email-login form')!;
    const signupForm = document.querySelector<HTMLFormElement>('#email-signup form')!;
    const forgotForm = document.querySelector<HTMLFormElement>('#forgot-password form')!;
    expect(text('#email-login button')).toBe('로그인');
    expect(text('#email-signup button')).toBe('가입');
    expect(text('#forgot-password button')).toBe('재설정 이메일 보내기');
    expect(document.querySelector<HTMLInputElement>('#email-login input[name="email"]')?.placeholder)
      .toBe('이메일로 로그인');
    expect(document.querySelector<HTMLInputElement>('#email-login input[name="pass"]')?.value)
      .toBe('keep-me');
    expect(document.querySelector<HTMLInputElement>('#email-signup input[name="email"]')?.value)
      .toBe('draft@example.test');
    expect(document.querySelector<HTMLInputElement>('#email-signup input[name="g-recaptcha-response"]')?.value)
      .toBe('captcha-token');
    expect(loginForm.getAttribute('action')).toBe('/auth/login/email');
    expect(signupForm.getAttribute('action')).toBe('/auth/signup/start');
    expect(forgotForm.getAttribute('action')).toBe('https://www.mountainproject.com/auth/password/lost');
  });

  it('localizes the production dropdown-menu-right comment sorter and dynamic replacement', async () => {
    window.history.replaceState({}, '', '/area/106225629/south-korea');
    document.body.innerHTML = COMMENT_SORT_DROPDOWN_FIXTURE;
    localizer.apply(document);

    expect(text('#sort-dropdown strong')).toBe('정렬:');
    expect(text('#sort-dropdown .current-sort')).toBe('오래된순');
    expect([...document.querySelectorAll('.comments-sort')].map((item) => item.textContent?.trim()))
      .toEqual(['최신순', '오래된순', '인기순']);
    expect(document.querySelector('.comments-sort')?.getAttribute('data-sort-order')).toBe('newest');
    expect(document.querySelector('.comments-sort')?.getAttribute('data-sort-order-name')).toBe('Newest');

    document.querySelector('.dropdown-menu.dropdown-menu-right')!.innerHTML = `
      <a class="dropdown-item comments-sort" data-sort-order="newest">Newest</a>
      <a class="dropdown-item comments-sort" data-sort-order="oldest">Oldest</a>
      <a class="dropdown-item comments-sort" data-sort-order="popular">Popular</a>`;
    document.querySelector('.current-sort')!.textContent = 'Newest';
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(text('#sort-dropdown .current-sort')).toBe('최신순');
    expect([...document.querySelectorAll('.comments-sort')].map((item) => item.textContent?.trim()))
      .toEqual(['최신순', '오래된순', '인기순']);
  });

  it('localizes an improvement form inserted into an Area page', async () => {
    window.history.replaceState({}, '', '/area/106225629/south-korea');
    document.body.innerHTML = '<main id="climb-area-page"><h1>South Korea</h1></main>';
    localizer.apply(document);

    const modal = document.createElement('div');
    modal.className = 'improvement-modal';
    modal.innerHTML = `
      <form action="/improvement/text-section">
        <label>Current Text</label>
        <textarea name="current">Original authored description</textarea>
        <label>Proposed Text</label>
        <textarea name="proposed" placeholder="Describe your changes">User draft</textarea>
        <button type="submit">Submit Suggestion</button>
      </form>`;
    document.body.append(modal);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(modal.querySelectorAll('label')[0]?.textContent).toBe('현재 내용');
    expect(modal.querySelectorAll('label')[1]?.textContent).toBe('제안 내용');
    expect(modal.querySelector<HTMLTextAreaElement>('textarea[name="proposed"]')?.placeholder)
      .toBe('변경 내용을 설명하세요');
    expect(modal.querySelector<HTMLTextAreaElement>('textarea[name="current"]')?.value)
      .toBe('Original authored description');
    expect(modal.querySelector<HTMLTextAreaElement>('textarea[name="proposed"]')?.value)
      .toBe('User draft');
    expect(modal.querySelector('button')?.textContent).toBe('제안 제출');
  });

  it('localizes the initial and native prompt variants without changing account form data', async () => {
    document.body.innerHTML = CONTRIBUTION_OVERLAYS_FIXTURE;
    const loginForm = document.querySelector<HTMLFormElement>('#email-login form')!;
    const loginEmail = document.querySelector<HTMLInputElement>('#login-email')!;
    const loginPassword = document.querySelector<HTMLInputElement>('#login-password')!;
    const accountLink = document.querySelector<HTMLAnchorElement>('#account-link')!;

    localizer.apply(document);

    expect(text('#login-modal .modal-title')).toBe('가입 또는 로그인');
    expect(text('#account-link')).toBe(
      '무료 계정 하나로 모든 Adventure Projects 사이트를 이용할 수 있습니다',
    );
    expect(text('#onx-login')).toBe('onX Maps로 계속하기');
    expect(text('#facebook-login')).toBe('Facebook으로 로그인');
    expect(loginEmail.placeholder).toBe('이메일로 로그인');
    expect(loginPassword.placeholder).toBe('비밀번호');
    expect(document.querySelector<HTMLInputElement>('#signup-email')?.placeholder)
      .toBe('이메일로 가입');
    expect(text('#login-modal .orSeparator')).toBe('또는');
    expect(text('#login-modal .g-recaptcha-response')).toBe(
      '이 사이트는 reCAPTCHA로 보호되며 Google의 개인정보 처리방침 및 서비스 이용약관 내용이 적용됩니다.',
    );
    expect(text('#share-content-modal .modal-title')).toBe('Mountain Project에 공유');
    expect(text('#share-content-modal small')).toBe(
      '다른 사람의 콘텐츠(글, 사진 등)를 허가 없이 사용하는 것은 저작권 침해이며 허용되지 않습니다.',
    );
    expect(text('#global-modal-title')).toBe('변경 제안');
    expect(text('#modal-placeholder')).toBe('불러오는 중...');
    expect(text('#dataConfirmLabel')).toBe('확인해 주세요');
    expect(text('#data-confirm-ok')).toBe('확인');
    expect(document.querySelector('#login-close')?.getAttribute('aria-label')).toBe('닫기');

    expect(document.querySelector('#email-login form')).toBe(loginForm);
    expect(loginForm.getAttribute('action')).toBe('/auth/login/email');
    expect(loginEmail.value).toBe('climber@example.test');
    expect(loginPassword.value).toBe('keep-me');
    expect(accountLink.href).toBe('https://www.adventureprojects.net/');

    const title = document.querySelector<HTMLElement>('#login-modal .modal-title')!;
    const disclaimer = document.querySelector<HTMLElement>(
      '#login-modal .all-sites-disclaimer',
    )!;
    title.innerHTML = 'Login or Signup';
    disclaimer.innerHTML = '<p>Login with your <strong>FREE</strong> account and continue exploring.</p>';
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(title.textContent).toBe('로그인 또는 가입');
    expect(text('#login-modal .all-sites-disclaimer p')).toBe(
      '보유한 무료 계정으로 로그인하고 계속 둘러보세요.',
    );

    title.innerHTML = 'Reset Password';
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(title.textContent).toBe('비밀번호 재설정');

    localizer.restore();
    expect(text('#login-modal .modal-title')).toBe('Reset Password');
    expect(loginEmail.placeholder).toBe('Log in with email');
    expect(loginPassword.value).toBe('keep-me');
    expect(text('#share-content-modal small')).toContain("Taking other people's content");
  });

  it('localizes both Area action menus by their semantic contribution destinations', () => {
    window.history.replaceState({}, '', '/area/106225629/south-korea');
    document.body.innerHTML = CONTRIBUTION_ACTION_MENUS_FIXTURE;
    const addArea = document.querySelector<HTMLAnchorElement>('#add-area')!;
    const suggestGeneral = document.querySelector<HTMLAnchorElement>('#suggest-general')!;

    localizer.apply(document);

    expect(text('#improve-trigger')).toBe('이 페이지 개선');
    expect(text('.improve-page-general .dropdown-header')).toBe('이 페이지 개선');
    expect(text('#suggest-general')).toBe('변경 제안');
    expect(text('#edit-area')).toBe('지역 편집');
    expect(text('#page-updates')).toBe('페이지 변경 내역 보기');
    expect(text('#add-trigger')).toBe('페이지에 추가');
    expect(text('#add-route')).toBe('새 루트 추가');
    expect(text('#add-area')).toBe('새 지역 추가');
    expect(text('#add-photo')).toBe('새 사진 추가');
    expect(text('#add-trail')).toBe('접근로 추가');
    expect(text('#add-book')).toBe('새 가이드북 추가');
    expect(document.querySelector('#improve-trigger img')?.getAttribute('alt')).toBe('펼치기');

    expect(document.querySelector('#add-area')).toBe(addArea);
    expect(addArea.getAttribute('href')).toBe('/add/climb-area/106225629');
    expect(document.querySelector('#add-route')?.getAttribute('href'))
      .toBe('/edit/route/0?parentId=106225629');
    expect(document.querySelector('#add-photo')?.getAttribute('href'))
      .toBe('/area/106225629/add/photo');
    expect(document.querySelector('#add-trail')?.getAttribute('href'))
      .toBe('/upload/start/trail?areaId=106225629');
    expect(document.querySelector('#add-book')?.getAttribute('href'))
      .toBe('/edit/book/0?parentId=106225629');
    expect(document.querySelector('#suggest-general')).toBe(suggestGeneral);
    expect(suggestGeneral.getAttribute('href')).toContain('objectType=Climb%5CLib%5CModels%5CArea');

    localizer.restore();
    expect(text('#improve-trigger')).toBe('Improve This Page');
    expect(text('#add-area')).toBe('Add New Area');
  });

  it('localizes AJAX-inserted improvement modal content and menu items atomically in place', async () => {
    window.history.replaceState({}, '', '/area/106225629/south-korea');
    document.body.innerHTML = `
      <div id="climb-area-page">
        <div class="improve-page-general"><a href="#">Improve This Page</a></div>
      </div>
      ${CONTRIBUTION_OVERLAYS_FIXTURE}
    `;
    localizer.apply(document);

    const menu = document.createElement('div');
    menu.className = 'dropdown-menu';
    menu.innerHTML = `
      <div class="dropdown-header">Improve This Page</div>
      <a id="dynamic-edit" role="menuitem" href="/edit/climb-area/106225629">Edit This Page</a>
      <a id="dynamic-add" role="menuitem" href="/add/route/106225629">Add a Route</a>
    `;
    document.querySelector('.improve-page-general')!.append(menu);

    const form = document.createElement('form');
    form.className = 'improvement-form';
    form.action = '/improvement/general';
    form.innerHTML = `
      <h3>Propose Changes</h3>
      <p class="text-muted">What is the issue?</p>
      <label>Reason for Change</label>
      <textarea name="reason" placeholder="Describe your changes">사용자 초안</textarea>
      <button type="submit">Submit Suggestion</button>
    `;
    document.querySelector('#global-modal-body')!.append(form);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(text('.improve-page-general .dropdown-header')).toBe('이 페이지 개선');
    expect(text('#dynamic-edit')).toBe('이 페이지 편집');
    expect(text('#dynamic-add')).toBe('루트 추가');
    expect(text('#global-modal-body h3')).toBe('변경 제안');
    expect(text('#global-modal-body .text-muted')).toBe('어떤 문제가 있나요?');
    expect(text('#global-modal-body label')).toBe('변경 이유');
    expect(document.querySelector<HTMLTextAreaElement>('#global-modal-body textarea')?.placeholder)
      .toBe('변경 내용을 설명하세요');
    expect(document.querySelector<HTMLTextAreaElement>('#global-modal-body textarea')?.value)
      .toBe('사용자 초안');
    expect(text('#global-modal-body button')).toBe('제안 제출');
    expect(form.getAttribute('action')).toBe('/improvement/general');
  });

  it('localizes all six production-shaped improvement modals without changing submitted data', async () => {
    window.history.replaceState({}, '', '/area/106225629/south-korea');
    document.body.innerHTML = CONTRIBUTION_OVERLAYS_FIXTURE;
    const modalBody = document.querySelector<HTMLElement>('#global-modal-body')!;
    localizer.apply(document);

    for (const [kind, fixture] of Object.entries(CONTRIBUTION_IMPROVEMENT_MODAL_FIXTURES)) {
      modalBody.innerHTML = fixture;
      const form = modalBody.querySelector<HTMLFormElement>('form')!;
      const authoredElement = form.querySelector<HTMLElement>('.fr-element');
      const authoredTextarea = form.querySelector<HTMLTextAreaElement>('textarea#text');
      const original = {
        action: form.getAttribute('action'),
        method: form.getAttribute('method'),
        fields: Array.from(form.elements).map((element) => ({
          name: element.getAttribute('name'),
          type: element.getAttribute('type'),
          value: 'value' in element ? String(element.value) : null,
          checked: element instanceof HTMLInputElement ? element.checked : null,
        })),
        hrefs: Array.from(form.querySelectorAll<HTMLAnchorElement>('a[href]'))
          .map((anchor) => anchor.getAttribute('href')),
        authoredHtml: authoredElement?.innerHTML,
        authoredTextarea: authoredTextarea?.value,
      };

      await new Promise((resolve) => setTimeout(resolve, 0));
      localizer.apply(document);

      const scopedText = (selector: string) => form.querySelector(selector)?.textContent
        ?.replace(/\s+/g, ' ').trim() ?? '';
      expect(scopedText('.mb-2')).toContain('Kalymnos');
      expect(scopedText('a.cancel')).toBe('취소');

      if (kind === 'routeSort') {
        expect(scopedText('h2')).toBe('Kalymnos 루트 정렬');
        expect(scopedText('form > div.mb-2')).toContain('Alex Kim님');
        expect([...form.querySelectorAll('li')].map((item) => item.textContent?.trim()))
          .toEqual([
            '다른 루트보다 위에서 시작하는 루트는 서로 나란히 배치하세요.',
            '일반적으로 가이드북의 순서를 따르세요. 책의 오른쪽에서 왼쪽 순서와 왼쪽에서 오른쪽 순서를 주의해서 확인하세요.',
            '루트가 여러 암벽 지형에 걸쳐 있다면 가장 왼쪽부터 시작해 지형을 따라 차례로 배치하세요.',
          ]);
        expect(scopedText('.label-left')).toBe('« 가장 왼쪽');
        expect(scopedText('.label-right')).toBe('« 가장 오른쪽');
        expect(scopedText('.mt-2.text-nowrap')).toContain('루트를 끌어');
        expect(scopedText('.mt-2.text-nowrap strong')).toBe('정렬');
        expect(scopedText('#sorted-routes a')).toBe('Entity Route');
        expect(scopedText('button[type="submit"]')).toBe('변경사항 제출');
      } else if (kind === 'location') {
        expect(scopedText('h2')).toBe('Kalymnos 위치 변경');
        expect(scopedText('.mb-quarter')).toContain('십자선을 Kalymnos 위로');
        expect(scopedText('.mb-half')).toContain('몇 주가 걸릴 수 있습니다');
        expect(scopedText('strong')).toContain('정확한 위치가 확실하지 않다면');
        expect(scopedText('#zoom-tip')).toBe('세부 정보를 보려면 확대하세요');
        expect(scopedText('.strong.p-half')).toBe('지도 범례');
        expect(scopedText('label.mb-quarter')).toBe('할 일');
        expect(form.querySelector('[aria-label="전체 화면으로 전환"]')).not.toBeNull();
        expect(form.querySelector('[title="내 위치 찾기"]')).not.toBeNull();
        expect(form.querySelector('[aria-label="확대"]')).not.toBeNull();
        expect(form.querySelector('[title="축소"]')).not.toBeNull();
        expect(form.querySelector('[aria-label="북쪽을 위로 초기화"]')).not.toBeNull();
        expect(form.querySelector('[aria-label="옵션"]')).not.toBeNull();
        expect(form.querySelector('#map[aria-label="지도"]')).not.toBeNull();
        expect(form.querySelector('[aria-label="Mapbox 로고"]')).not.toBeNull();
      } else if (kind === 'description' || kind === 'gettingThere') {
        expect(scopedText('h2')).toBe('Kalymnos: 변경 제안');
        expect(authoredElement?.innerHTML).toBe(original.authoredHtml);
        expect(authoredTextarea?.value).toBe(original.authoredTextarea);
        expect(authoredTextarea?.placeholder).toBe('제안할 내용을 입력하세요');
        expect(form.querySelector('.fr-toolbar [title*="Ctrl+"]')).not.toBeNull();
      } else if (kind === 'badName') {
        expect(scopedText('h2')).toBe('차별적 명칭 신고: Kalymnos');
        expect(scopedText('p')).toContain('모든 차별적 명칭을 더 이상 허용하지 않습니다');
        expect(scopedText('p')).toContain('"Kalymnos"은(는) 차별적인 명칭인가요?');
        expect(scopedText('button[type="submit"]')).toBe('예, 검토를 요청합니다');
      } else {
        expect(scopedText('h2')).toBe('Kalymnos 변경 제안');
        expect(form.querySelector<HTMLTextAreaElement>('textarea')?.placeholder)
          .toBe('더 나은 설명이 있나요? 누락되었거나 오래되었거나 잘못된 정보를 알려주세요.');
      }

      if (kind !== 'badName') {
        expect(scopedText('.text-warm')).toContain('Mountain Project 관리자와 운영진');
      }
      expect(form.getAttribute('action')).toBe(original.action);
      expect(form.getAttribute('method')).toBe(original.method);
      expect(Array.from(form.elements).map((element) => ({
        name: element.getAttribute('name'),
        type: element.getAttribute('type'),
        value: 'value' in element ? String(element.value) : null,
        checked: element instanceof HTMLInputElement ? element.checked : null,
      }))).toEqual(original.fields);
      expect(Array.from(form.querySelectorAll<HTMLAnchorElement>('a[href]'))
        .map((anchor) => anchor.getAttribute('href'))).toEqual(original.hrefs);
    }
  });

  it.each([
    {
      url: '/area/106225629/add/photo',
      html: CONTRIBUTION_VARIANT_FORMS_FIXTURE.areaPhoto,
      form: '#editForm',
      checks: [
        { selector: 'h1', expected: '사진 추가 · South Korea' },
        { selector: '#add-video h3', expected: '사진 등록 안내' },
        { selector: '#filePick', expected: '파일 선택' },
        { selector: '#path', expected: '선택된 파일 없음' },
        { selector: '.form-char-count', expected: '255자 남음' },
        { selector: '.submit-button', expected: '사진 저장' },
        { selector: '#cancelButton', expected: '취소' },
      ],
    },
    {
      url: '/route/106232568/add/photo',
      html: CONTRIBUTION_VARIANT_FORMS_FIXTURE.routePhoto,
      form: '#route-photo-form',
      checks: [
        { selector: 'h1', expected: '사진 추가 · Chouinard B' },
        { selector: '#route-photo-form button', expected: '사진 저장' },
      ],
    },
    {
      url: '/edit/imageLink/106225629?type=album',
      html: CONTRIBUTION_VARIANT_FORMS_FIXTURE.imageLink,
      form: 'form.edit-form',
      checks: [
        { selector: 'h1', expected: '사진 복사본 추가 · South Korea' },
        { selector: 'label.primary', expected: '원본 사진 ID' },
        { selector: 'button[type="submit"]', expected: '사진 복사본 생성' },
        { selector: '.text-muted', expected: '원본 사진 ID는 복사하려는 사진 URL에 포함된 숫자입니다(다음 예시에서는 123456): https://www.mountainproject.com/photo/123456/example-photo' },
      ],
    },
    {
      url: '/upload/start/trail?areaId=106225629',
      html: CONTRIBUTION_VARIANT_FORMS_FIXTURE.trailUpload,
      form: '#editForm',
      checks: [
        { selector: 'h1', expected: '다음 방법 중 하나를 선택하세요' },
        { selector: '#filePick', expected: '파일 선택' },
        { selector: '#path', expected: '선택된 파일 없음' },
        { selector: '#editForm .submit-button', expected: '파일 업로드' },
        { selector: '#mapForm .submit-button', expected: '지도 열기' },
        { selector: '.faq > h2', expected: '자주 묻는 질문' },
        { selector: '.faq-item h3', expected: '접근로와 하산로란 무엇인가요?' },
      ],
    },
    {
      url: '/edit/book/0?parentId=106225629',
      html: CONTRIBUTION_VARIANT_FORMS_FIXTURE.book,
      form: '#edit-book-form',
      checks: [
        { selector: 'h1', expected: '새 가이드북' },
        { selector: 'label:nth-of-type(3)', expected: '저자 / 출판사 / 출판 연도' },
        { selector: 'button[type="submit"]', expected: '가이드북 저장' },
      ],
    },
  ])('localizes production-shaped $url while preserving form data and destinations', ({
    url, html, form, checks,
  }) => {
    window.history.replaceState({}, '', url);
    document.body.innerHTML = html;
    const target = document.querySelector<HTMLFormElement>(form)!;
    const original = {
      forms: Array.from(document.forms).map((formElement) => ({
        action: formElement.getAttribute('action'),
        method: formElement.getAttribute('method'),
        name: formElement.getAttribute('name'),
        fields: Array.from(formElement.elements).map((element) => ({
          name: element.getAttribute('name'),
          value: 'value' in element ? String(element.value) : null,
          checked: element instanceof HTMLInputElement ? element.checked : null,
        })),
      })),
      hrefs: Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]'))
        .map((anchor) => anchor.getAttribute('href')),
    };

    localizer.apply(document);

    expect(target).not.toBeNull();
    for (const check of checks) expect(text(check.selector)).toBe(check.expected);
    expect(Array.from(document.forms).map((formElement) => ({
      action: formElement.getAttribute('action'),
      method: formElement.getAttribute('method'),
      name: formElement.getAttribute('name'),
      fields: Array.from(formElement.elements).map((element) => ({
        name: element.getAttribute('name'),
        value: 'value' in element ? String(element.value) : null,
        checked: element instanceof HTMLInputElement ? element.checked : null,
      })),
    }))).toEqual(original.forms);
    expect(Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]'))
      .map((anchor) => anchor.getAttribute('href'))).toEqual(original.hrefs);
  });

  it('localizes the common flag modal while preserving named server submit values', () => {
    document.body.innerHTML = CONTRIBUTION_FLAG_MODAL_FIXTURE;
    localizer.apply(document);

    expect(text('#flag-content-form p')).toBe('신고 이유를 알려주세요:');
    expect(document.querySelector<HTMLInputElement>('#flag-action')?.value).toBe('신고하기');
    expect(document.querySelector<HTMLInputElement>('#server-action')?.value).toBe('Flag It');
    expect(document.querySelector<HTMLTextAreaElement>('textarea[name="reason"]')?.value)
      .toBe('사용자가 작성한 신고 이유');
    expect(document.querySelector<HTMLInputElement>('input[name="_token"]')?.value)
      .toBe('flag-csrf-token');
    expect(text('#flag-content-form .small')).toContain('담당자가 내용을 검토');
  });

  it('localizes the production New Route UI and late Froala DOM without changing data', async () => {
    window.history.replaceState({}, '', '/edit/route/0?parentId=106225638');
    document.body.innerHTML = CONTRIBUTION_NEW_ROUTE_FIXTURE;
    const form = document.querySelector<HTMLFormElement>('#edit-route-form')!;
    const original = {
      action: form.getAttribute('action'),
      method: form.getAttribute('method'),
      fields: Array.from(form.elements).map((element) => ({
        name: element.getAttribute('name'),
        value: 'value' in element ? String(element.value) : null,
        checked: element instanceof HTMLInputElement ? element.checked : null,
      })),
      optionValues: Array.from(form.querySelectorAll('option')).map((option) => option.value),
      hrefs: Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]'))
        .map((anchor) => anchor.getAttribute('href')),
    };

    localizer.apply(document);

    expect(text('h1')).toBe('새 루트');
    expect(text('.pt-main-content h2')).toBe('새 루트 등록 새 지역과 루트 FAQ');
    expect(text('.pt-main-content strong')).toBe('1단계: 루트 기본 정보 « 현재 단계');
    expect(text('.pt-main-content .pt-2')).toContain('2단계: 지역 내 루트 정렬');
    expect(text('label.primary')).toBe('루트명');
    expect(text('fieldset:nth-of-type(2) label.primary')).toBe('최초 등반자');
    expect(text('fieldset:nth-of-type(2) .small')).toContain('"[[1234]], Feb 1972"');
    expect(text('fieldset:nth-of-type(2) .small')).toContain('ID 1234');
    expect(text('#route-type-label')).toBe('루트 유형');
    expect(text('label:has(input[value="sport"])')).toContain('퀵드로우만 사용해 선등');
    expect(text('label:has(input[name="toprope"])')).toContain('선등하지 않고도 톱로프');
    expect(text('#grades-link')).toBe('국제 난이도 비교표');
    expect(text('.rating-table td')).toBe('암벽');
    expect(text('option[value="PG13"]')).toBe('PG13 - 보호물이 다소 멂');
    expect(text('label.primary:nth-of-type(1)')).not.toBe('초등');
    expect(text('#description-editor .fr-placeholder')).toContain('크럭스는 어디인가요?');
    expect(text('#description-editor .fr-counter')).toBe('글자 수: 0/10000');
    expect(document.querySelector('[title="굵게 (Ctrl+B)"]')).not.toBeNull();
    expect(document.querySelector<HTMLTextAreaElement>('#Protection')?.placeholder)
      .toContain('어떤 보호 장비가 필요한가요?');

    form.insertAdjacentHTML('beforeend', CONTRIBUTION_NEW_ROUTE_DYNAMIC_FROALA_FIXTURE);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(text('#location-editor .fr-placeholder')).toContain('루트 시작점을 어떻게 찾나요?');
    expect(text('#location-editor .fr-counter')).toBe('글자 수: 27/10000');
    expect(document.querySelector('#location-editor [title="순서 없는 목록"]')).not.toBeNull();

    localizer.apply(document);
    expect(text('#location-editor .fr-counter')).toBe('글자 수: 27/10000');
    expect(form.getAttribute('action')).toBe(original.action);
    expect(form.getAttribute('method')).toBe(original.method);
    expect(Array.from(form.elements).slice(0, original.fields.length).map((element) => ({
      name: element.getAttribute('name'),
      value: 'value' in element ? String(element.value) : null,
      checked: element instanceof HTMLInputElement ? element.checked : null,
    }))).toEqual(original.fields);
    expect(Array.from(form.querySelectorAll('option')).map((option) => option.value))
      .toEqual(original.optionValues);
    expect(Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]'))
      .slice(0, original.hrefs.length).map((anchor) => anchor.getAttribute('href')))
      .toEqual(original.hrefs);
  });

  it('localizes the AJAX new-area FAQ component while preserving its semantic structure', async () => {
    document.body.innerHTML = CONTRIBUTION_OVERLAYS_FIXTURE;
    const modal = document.querySelector<HTMLElement>('#global-modal')!;
    const modalBody = document.querySelector<HTMLElement>('#global-modal-body')!;
    const closeButton = document.querySelector<HTMLButtonElement>('#global-close')!;
    localizer.apply(document);

    modalBody.innerHTML = CONTRIBUTION_NEW_AREAS_ROUTES_FAQ_FIXTURE;
    await new Promise((resolve) => setTimeout(resolve, 0));

    const faq = modalBody.querySelector<HTMLElement>('#help-page .faq')!;
    const strong = faq.querySelector<HTMLElement>('strong')!;
    const helpLink = faq.querySelector<HTMLAnchorElement>('a[href="/help"]')!;
    const faqItems = [...faq.querySelectorAll<HTMLElement>('.faq-item')];

    expect(text('#global-modal-body .faq > h2')).toBe('새 지역과 루트 추가');
    expect(faqItems).toHaveLength(8);
    expect(faqItems[0]?.querySelector('h3')?.textContent).toBe('지역과 루트는 어떻게 구성되나요?');
    expect(faqItems[0]?.children[1]?.textContent).toContain('계층 구조로 구성됩니다');
    expect(faqItems.every((item) => !/[A-Za-z]{4}/.test(item.querySelector('h3')?.textContent ?? '')))
      .toBe(true);
    expect(faqItems.every((item) => !/^(?:Areas|Usually|No,|No\.|First,|Do not|Content related)/
      .test(item.children[1]?.textContent?.trim() ?? ''))).toBe(true);
    expect(faqItems[4]?.querySelector('h3')?.textContent).toBe('지역은 어떻게 추가하나요?');
    expect(strong.textContent).toBe('상위');
    expect(faqItems[6]?.querySelector('h3')?.textContent)
      .toBe('저작권이 있는 자료에 관해 무엇을 알아야 하나요?');
    expect(helpLink.textContent).toBe('문의하기');
    expect(helpLink.getAttribute('href')).toBe('/help');
    expect(faq.querySelector('strong')).toBe(strong);
    expect(faq.querySelector('a[href="/help"]')).toBe(helpLink);
    expect(closeButton.getAttribute('aria-label')).toBe('닫기');
    expect(modal.getAttribute('data-orig-full-path')).toBe('/add/climb-area/106225629');
  });

  it('localizes the automatically opened first-area FAQ title after AJAX replacement', async () => {
    document.body.innerHTML = CONTRIBUTION_OVERLAYS_FIXTURE;
    const modalBody = document.querySelector<HTMLElement>('#global-modal-body')!;
    localizer.apply(document);

    modalBody.innerHTML = CONTRIBUTION_FIRST_AREA_FAQ_TITLE;
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(text('#global-modal-body .faq > h2')).toBe(
      '첫 지역을 공유해 주셔서 감사합니다! 시작에 도움이 되는 자주 묻는 질문을 확인해 보세요.',
    );
    expect(modalBody.querySelector('br')).not.toBeNull();
  });
});
