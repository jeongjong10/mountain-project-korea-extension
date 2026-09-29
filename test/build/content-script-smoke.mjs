import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { Window } from 'happy-dom';

const output = process.argv[2];
assert.ok(output, 'Pass a built extension directory');
const manifest = JSON.parse(await readFile(resolve(output, 'manifest.json'), 'utf8'));
const entry = manifest.content_scripts?.flatMap((script) => script.js ?? []);
assert.equal(entry?.length, 1, 'Expected the production content-script entry');
const source = await readFile(resolve(output, entry[0]), 'utf8');

const cases = [
  ['route/105798994/high-exposure', 'route', '\uB2E4\uB978 \uB8E8\uD2B8'],
  ['area/106661515/asia', 'area', '\uB2E4\uB978 \uC9C0\uC5ED'],
];

for (const [path, kind, label] of cases) {
  const window = new Window({
    url: `https://www.mountainproject.com/${path}`,
    settings: {
      disableJavaScriptFileLoading: true,
      disableCSSFileLoading: true,
      disableIframePageLoading: true,
    },
  });
  const errors = [];
  const onRejection = (error) => errors.push(error);
  process.on('unhandledRejection', onRejection);
  window.addEventListener('error', (event) => errors.push(event.error ?? event.message));
  window.console.error = (...args) => errors.push(args.join(' '));
  // No site requests, translation API, or user profile is used by this check.
  window.fetch = async () => { throw new Error('Unexpected network request in bundle smoke'); };
  const listeners = new Set();
  let enabled = true;
  const setEnabled = (next) => {
    const oldValue = enabled;
    enabled = next;
    for (const listener of [...listeners]) {
      listener({ enabled: { oldValue, newValue: next } }, 'local');
    }
  };
  const browser = {
    runtime: { id: 'mpkr-bundle-smoke' },
    storage: {
      local: {
        get: async () => ({ enabled }),
        set: async (values) => setEnabled(values.enabled),
      },
      onChanged: {
        addListener: (listener) => listeners.add(listener),
        removeListener: (listener) => listeners.delete(listener),
      },
    },
  };
  window.chrome = browser;
  window.browser = browser;
  const document = window.document;
  document.body.innerHTML = `
    <div class="main-content-container"><div class="row">
      <div class="left-nav"><div class="mp-sidebar">
        <a href="/area/105891603/the-trapps">The Trapps</a>
        <a href="/route/105798994/high-exposure">High Exposure</a>
      </div></div>
      <main class="main-content"><h1>Climbing</h1></main>
    </div></div>
    <div class="improve-page-general dropdown nowrap inline-block">
      <a id="improve-trigger" href="#" class="dropdown-toggle">Improve This Page</a>
      <div class="dropdown-menu">
        <a id="edit-page" href="/edit/climb-area/106225629">Edit This Page</a>
        <a id="updates-page" href="/updates/Climb-Lib-Models-Area/106225629">View Page Updates</a>
      </div>
    </div>
    <div class="dropdown nowrap">
      <a id="add-trigger" href="#" class="dropdown-toggle">Add To Page</a>
      <div class="dropdown-menu">
        <a id="add-route" href="/add/route/106225629">Add New Route</a>
        <a id="add-area" href="/add/climb-area/106225629">Add New Area</a>
      </div>
    </div>
    <div class="dropdown sort float-xs-right">
      <a id="sort-dropdown"><strong>Sort by:</strong> <span class="current-sort">Oldest</span></a>
      <div class="dropdown-menu dropdown-menu-right" aria-labelledby="sort-dropdown">
        <a class="dropdown-item comments-sort" data-sort-order="newest">Newest</a>
        <a class="dropdown-item comments-sort" data-sort-order="oldest">Oldest</a>
        <a class="dropdown-item comments-sort" data-sort-order="popular">Popular</a>
      </div>
    </div>`;
  const sidebar = document.querySelector('.left-nav');
  const originalParent = sidebar.parentElement;
  const assertMounted = () => {
    assert.equal(document.documentElement.dataset.mpKoreaCore, 'ready', path);
    assert.equal(document.documentElement.dataset.mpKoreaPageKind, kind, path);
    assert.equal(document.querySelectorAll('.mpkr-left-sidebar-rail').length, 1, path);
    const rail = document.querySelector('.mpkr-left-sidebar-rail');
    assert.ok(rail.textContent.includes(label), `Wrong sidebar label on ${path}`);
    assert.equal(rail.getAttribute('aria-expanded'), 'false');
    rail.click();
    assert.equal(rail.getAttribute('aria-expanded'), 'true');
    assert.equal(document.querySelector('.mpkr-left-sidebar-panel').hidden, false);
    document.querySelector('.mpkr-left-sidebar-panel__close').click();
    assert.equal(rail.getAttribute('aria-expanded'), 'false');
    assert.equal(document.querySelector('#improve-trigger').textContent, '이 페이지 개선');
    assert.equal(document.querySelector('#edit-page').textContent, '이 페이지 편집');
    assert.equal(document.querySelector('#updates-page').textContent, '페이지 변경 내역 보기');
    assert.equal(document.querySelector('#add-trigger').textContent, '페이지에 추가');
    assert.equal(document.querySelector('#add-route').textContent, '새 루트 추가');
    assert.equal(document.querySelector('#add-area').textContent, '새 지역 추가');
    assert.equal(document.querySelector('#sort-dropdown strong').textContent, '정렬:');
    assert.equal(document.querySelector('#sort-dropdown .current-sort').textContent, '오래된순');
    assert.deepEqual(
      [...document.querySelectorAll('.dropdown-menu-right .comments-sort')]
        .map((element) => element.textContent),
      ['최신순', '오래된순', '인기순'],
    );
  };
  try {
    // Await the emitted entrypoint itself, not a source-module substitute.
    await window.eval(source);
    await delay(30);
    assertMounted();
    setEnabled(false);
    assert.equal(document.querySelector('.mpkr-left-sidebar-rail'), null);
    assert.equal(sidebar.parentElement, originalParent);
    setEnabled(true);
    assertMounted();
    // A replacement injection must dispose the old runtime before mounting again.
    await window.eval(source);
    await delay(30);
    assertMounted();
    assert.equal(listeners.size, 1, 'Duplicate settings subscription');
    assert.deepEqual(errors, [], `Bundle runtime errors on ${path}`);
    setEnabled(false);
    console.log(`Bundle smoke passed: ${path} (startup, sidebar, OFF/ON, reinjection)`);
  } finally {
    await window.happyDOM.close();
    process.removeListener('unhandledRejection', onRejection);
  }
}

const contributionFormCases = [
  {
    url: 'https://www.mountainproject.com/area/106225629/add/photo',
    formSelector: '#photo-form',
    formAction: '/area/106225629/add/photo',
    html: `
      <h1>Add Photos to South Korea</h1>
      <form id="photo-form" class="edit-form" action="/area/106225629/add/photo" method="post" name="photo-upload">
        <input type="hidden" name="_token" value="photo-csrf-token">
        <input type="hidden" name="areaId" value="106225629">
        <label>Photo File</label><input type="file" name="photo" accept="image/*">
        <label>Photo Caption</label><textarea name="caption" placeholder="Photo caption">사용자가 작성한 사진 설명</textarea>
        <button type="submit">Upload Photo</button>
        <a id="photo-help" href="/help/13/photos">More Info</a>
      </form>`,
    text: [
      ['h1', '사진 추가 · South Korea'],
      ['label:first-of-type', '사진 파일'],
      ['label:last-of-type', '사진 설명'],
      ['button', '사진 업로드'],
    ],
    attributes: [
      ['textarea[name="caption"]', 'placeholder', '사진 설명'],
      ['#photo-help', 'href', '/help/13/photos'],
    ],
    values: [
      ['input[name="_token"]', 'photo-csrf-token'],
      ['input[name="areaId"]', '106225629'],
      ['textarea[name="caption"]', '사용자가 작성한 사진 설명'],
    ],
  },
  {
    url: 'https://www.mountainproject.com/edit/imageLink/106225629?type=album',
    formSelector: '#image-link-form',
    formAction: '/edit/imageLink/106225629?type=album',
    html: `
      <h1>Add Photo to Album</h1>
      <form id="image-link-form" action="/edit/imageLink/106225629?type=album" method="post" name="image-link">
        <input type="hidden" name="imageId" value="121689336">
        <input type="hidden" name="type" value="album">
        <label>Album</label>
        <select name="albumId"><option value="400">Personal</option><option value="401" selected>South Korea</option></select>
        <button type="submit">Add to Album</button>
        <a id="album-link" href="/album/401">South Korea</a>
      </form>`,
    text: [
      ['h1', '앨범에 사진 추가'],
      ['label', '앨범'],
      ['button', '앨범에 추가'],
    ],
    attributes: [['#album-link', 'href', '/album/401']],
    values: [
      ['input[name="imageId"]', '121689336'],
      ['input[name="type"]', 'album'],
      ['select[name="albumId"]', '401'],
    ],
  },
  {
    url: 'https://www.mountainproject.com/upload/start/trail?areaId=106225629',
    formSelector: '#trail-form',
    formAction: '/upload/start/trail?areaId=106225629',
    html: `
      <h1>Upload an Approach Trail to South Korea</h1>
      <form id="trail-form" action="/upload/start/trail?areaId=106225629" method="post" name="trail-upload">
        <input type="hidden" name="areaId" value="106225629">
        <input type="hidden" name="uploadToken" value="trail-upload-token">
        <label>GPX File</label><input type="file" name="trailFile" accept=".gpx">
        <label>Trail Name</label><input name="title" value="사용자가 작성한 접근로 이름">
        <label>Notes</label><textarea name="notes">사용자가 작성한 접근 안내</textarea>
        <button type="submit">Upload Trail</button>
        <a id="trail-help" href="/help/12/approach-trails">More Info</a>
      </form>`,
    text: [
      ['h1', '접근로 업로드 · South Korea'],
      ['label:first-of-type', 'GPX 파일'],
      ['label:nth-of-type(2)', '접근로 이름'],
      ['label:last-of-type', '메모'],
      ['button', '접근로 업로드'],
    ],
    attributes: [['#trail-help', 'href', '/help/12/approach-trails']],
    values: [
      ['input[name="areaId"]', '106225629'],
      ['input[name="uploadToken"]', 'trail-upload-token'],
      ['input[name="title"]', '사용자가 작성한 접근로 이름'],
      ['textarea[name="notes"]', '사용자가 작성한 접근 안내'],
    ],
  },
  {
    url: 'https://www.mountainproject.com/edit/book/0?parentId=106225629',
    formSelector: '#book-form',
    formAction: '/edit/book/0?parentId=106225629',
    html: `
      <h1>Add a Guidebook to South Korea</h1>
      <form id="book-form" class="edit-form" action="/edit/book/0?parentId=106225629" method="post" name="guidebook">
        <input type="hidden" name="parentId" value="106225629">
        <label>Book Title</label><input name="title" value="사용자가 입력한 도서명">
        <label>Author</label><input name="author" value="사용자가 입력한 저자">
        <label>ISBN</label><input name="isbn" value="978-1-23456-789-0">
        <label>URL</label><input name="url" value="https://example.test/guidebook">
        <label>Publisher</label><input name="publisher" value="사용자가 입력한 출판사">
        <button type="submit">Save Guidebook</button>
        <a id="book-help" href="/help/14/guidebooks">More Info</a>
      </form>`,
    text: [
      ['h1', '가이드북 추가 · South Korea'],
      ['label:first-of-type', '도서명'],
      ['label:nth-of-type(2)', '저자'],
      ['label:nth-of-type(3)', 'ISBN'],
      ['label:nth-of-type(4)', 'URL'],
      ['label:last-of-type', '출판사'],
      ['button', '가이드북 저장'],
    ],
    attributes: [['#book-help', 'href', '/help/14/guidebooks']],
    values: [
      ['input[name="parentId"]', '106225629'],
      ['input[name="title"]', '사용자가 입력한 도서명'],
      ['input[name="author"]', '사용자가 입력한 저자'],
      ['input[name="isbn"]', '978-1-23456-789-0'],
      ['input[name="url"]', 'https://example.test/guidebook'],
      ['input[name="publisher"]', '사용자가 입력한 출판사'],
    ],
  },
];

for (const smokeCase of contributionFormCases) {
  const window = new Window({
    url: smokeCase.url,
    settings: {
      disableJavaScriptFileLoading: true,
      disableCSSFileLoading: true,
      disableIframePageLoading: true,
    },
  });
  const errors = [];
  const onRejection = (error) => errors.push(error);
  process.on('unhandledRejection', onRejection);
  window.addEventListener('error', (event) => errors.push(event.error ?? event.message));
  window.console.error = (...args) => errors.push(args.join(' '));
  window.fetch = async () => { throw new Error('Unexpected network request in contribution form smoke'); };
  const listeners = new Set();
  const browser = {
    runtime: { id: 'mpkr-contribution-form-smoke' },
    storage: {
      local: {
        get: async () => ({ enabled: true }),
        set: async () => undefined,
      },
      onChanged: {
        addListener: (listener) => listeners.add(listener),
        removeListener: (listener) => listeners.delete(listener),
      },
    },
  };
  window.chrome = browser;
  window.browser = browser;
  window.document.body.innerHTML = smokeCase.html;

  try {
    await window.eval(source);
    await delay(30);

    const root = window.document.documentElement;
    assert.equal(root.dataset.mpKoreaPageKind, 'contribution', smokeCase.url);
    assert.equal(root.dataset.mpKoreaCore, 'ready', smokeCase.url);
    assert.equal(root.dataset.mpKoreaRenderer, 'direct-translation', smokeCase.url);
    assert.equal(window.location.search, new URL(smokeCase.url).search, smokeCase.url);

    const form = window.document.querySelector(smokeCase.formSelector);
    assert.ok(form, smokeCase.url);
    assert.equal(form.getAttribute('action'), smokeCase.formAction, smokeCase.url);
    assert.equal(form.getAttribute('method'), 'post', smokeCase.url);
    for (const [selector, expected] of smokeCase.text) {
      assert.equal(window.document.querySelector(selector)?.textContent, expected, `${smokeCase.url}: ${selector}`);
    }
    for (const [selector, attribute, expected] of smokeCase.attributes) {
      assert.equal(window.document.querySelector(selector)?.getAttribute(attribute), expected, `${smokeCase.url}: ${selector}[${attribute}]`);
    }
    for (const [selector, expected] of smokeCase.values) {
      assert.equal(window.document.querySelector(selector)?.value, expected, `${smokeCase.url}: ${selector}.value`);
    }
    assert.deepEqual(errors, [], smokeCase.url);
    console.log(`Bundle smoke passed: ${new URL(smokeCase.url).pathname}${new URL(smokeCase.url).search}`);
  } finally {
    await window.happyDOM.close();
    process.removeListener('unhandledRejection', onRejection);
  }
}

{
  const window = new Window({
    url: 'https://www.mountainproject.com/add/climb-area/106225629#',
    settings: {
      disableJavaScriptFileLoading: true,
      disableCSSFileLoading: true,
      disableIframePageLoading: true,
    },
  });
  const errors = [];
  window.addEventListener('error', (event) => errors.push(event.error ?? event.message));
  window.console.error = (...args) => errors.push(args.join(' '));
  window.fetch = async () => { throw new Error('Unexpected network request in contribution smoke'); };
  const listeners = new Set();
  const browser = {
    runtime: { id: 'mpkr-contribution-smoke' },
    storage: {
      local: {
        get: async () => ({ enabled: true }),
        set: async () => undefined,
      },
      onChanged: {
        addListener: (listener) => listeners.add(listener),
        removeListener: (listener) => listeners.delete(listener),
      },
    },
  };
  window.chrome = browser;
  window.browser = browser;
  window.document.body.innerHTML = `
    <div id="access-gate">
      <small>Welcome</small>
      <h2>Join the Community! It's FREE</h2>
      <p>Already have an account? <a id="guest-login" href="/auth/login" title="Login">Login to close this notice.</a></p>
      <a id="guest-start" href="/auth/login" title="Sign Up or Login">Get Started</a>
    </div>
    <div id="login-modal" class="modal login-modal">
      <h2 class="modal-title">Sign Up or Log In</h2>
      <div id="email-login"></div>
    </div>
    <div id="global-modal" class="modal" data-orig-full-path="/add/climb-area/106225629">
      <button id="global-close" aria-label="Close"></button>
      <div id="global-modal-body"></div>
    </div>`;
  try {
    await window.eval(source);
    await delay(30);
    assert.equal(window.document.documentElement.dataset.mpKoreaPageKind, 'contribution');
    assert.equal(window.document.documentElement.dataset.mpKoreaCore, 'ready');
    assert.equal(window.document.querySelector('#login-modal .modal-title').textContent, '가입 또는 로그인');
    assert.equal(window.document.querySelector('#access-gate small').textContent, '환영합니다');
    assert.equal(
      window.document.querySelector('#access-gate p').textContent.replace(/\s+/g, ' ').trim(),
      '이미 계정이 있나요? 로그인하고 이 안내 닫기',
    );
    const guestStart = window.document.querySelector('#guest-start');
    assert.equal(guestStart.textContent, '시작하기');
    assert.equal(guestStart.getAttribute('title'), '가입 또는 로그인');
    assert.equal(guestStart.getAttribute('href'), '/auth/login');
    assert.equal(window.document.querySelector('#guest-login').getAttribute('title'), '로그인');

    window.document.querySelector('#email-login').innerHTML = `
      <form method="post" action="/auth/login/email">
        <input type="email" name="email" placeholder="Log in with email" value="climber@example.test">
        <input type="password" name="pass" placeholder="Password" value="keep-me">
        <button type="submit">Log In</button>
      </form>`;
    await delay(30);
    const form = window.document.querySelector('#email-login form');
    assert.equal(window.document.querySelector('#email-login button').textContent, '로그인');
    assert.equal(window.document.querySelector('#email-login input[name="email"]').placeholder, '이메일로 로그인');
    assert.equal(window.document.querySelector('#email-login input[name="pass"]').value, 'keep-me');
    assert.equal(form.getAttribute('action'), '/auth/login/email');

    window.document.querySelector('#global-modal-body').innerHTML = `
      <div id="help-page"><div class="pt-main-content faq mb-1">
        <h2>Adding New Areas &amp; Routes</h2>
        <div class="faq-item">
          <h3>How do I add an area?</h3>
          <div>First, find the <strong>parent</strong> area that contains this area. From that page, click 'Add To Page' on the top-right of the page and add your new area. Note you may need to first create intermediate sub-areas if they don't exist yet. For example, if you have a small new crag in Colorado, and it doesn't belong in any existing sub-area of Colorado, you may first need to create a region that contains your new crag and other nearby new crags.</div>
        </div>
        <div class="faq-item">
          <h3>What should I know about copyrighted material?</h3>
          <div>Do not copy text or photos directly from another website, guidebook, or other publication. We want to respect copyrighted material, and we would rather hear about the experience in your own words anyway! If you know the original author or photographer, and they have given you permission to use the text or photos on Mountain Project, please have them send <a href="/help">Contact Us</a> and explicitly stat that they have granted you permission to use their material.</div>
        </div>
      </div></div>`;
    const faqStrong = window.document.querySelector('#global-modal-body strong');
    const faqLink = window.document.querySelector('#global-modal-body a[href="/help"]');
    await delay(30);
    assert.equal(window.document.querySelector('#global-modal-body h2').textContent, '새 지역과 루트 추가');
    assert.equal(window.document.querySelector('#global-modal-body h3').textContent, '지역은 어떻게 추가하나요?');
    assert.equal(faqStrong.textContent, '상위');
    assert.equal(faqLink.textContent, '문의하기');
    assert.equal(faqLink.getAttribute('href'), '/help');
    assert.equal(window.document.querySelector('#global-modal-body strong'), faqStrong);
    assert.equal(window.document.querySelector('#global-modal-body a[href="/help"]'), faqLink);
    assert.equal(window.document.querySelector('#global-close').getAttribute('aria-label'), '닫기');
    assert.equal(window.document.querySelector('#global-modal').getAttribute('data-orig-full-path'), '/add/climb-area/106225629');
    assert.deepEqual(errors, []);
    console.log('Bundle smoke passed: contribution guest hash URL, AJAX auth, and FAQ lifecycle');
  } finally {
    await window.happyDOM.close();
  }
}

console.log(`Verified content SHA256: ${createHash('sha256').update(source).digest('hex')}`);
