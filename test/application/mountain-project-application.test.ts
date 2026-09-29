import directoryFixture from '../ui/fixtures/region-directory.html?raw';
import { createMountainProjectApplication } from '@/application/mountain-project-application';
import { createApplicationRuntime, type ApplicationRuntime } from '@/application/runtime';
import type { ExtensionSettings } from '@/application/ports';
import { RouteStatsPresentation } from '@/ui/route-stats-presentation';
import asiaFixture from '../fixtures/mountain-project/asia-area.html?raw';
import { CHOUINARD_B_STATS_FIXTURE } from '../fixtures/mountain-project/chouinard-b-route';
import {
  CONTRIBUTION_GUEST_ACCESS_FIXTURE,
  CONTRIBUTION_GUEST_AJAX_FORMS_FIXTURE,
  CONTRIBUTION_VARIANT_FORMS_FIXTURE,
} from '../fixtures/mountain-project/contribution-action-overlays';
import { CONTRIBUTION_NEW_ROUTE_FIXTURE } from '../fixtures/mountain-project/contribution-new-route';

const provider = () => ({
  id: 'test',
  availability: vi.fn(async () => 'unavailable' as const),
  translate: vi.fn(async () => 'unused'),
  destroy: vi.fn(),
});
let runtime: ApplicationRuntime | undefined;
let parentPresentation: RouteStatsPresentation | undefined;
const originalUrl = window.location.href;

beforeEach(() => { vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 503 }))); });

afterEach(() => {
  runtime?.destroy();
  parentPresentation?.destroy();
  runtime = undefined;
  parentPresentation = undefined;
  window.location.href = originalUrl;
  vi.unstubAllGlobals();
});

function bootstrap() {
  let listener!: (settings: ExtensionSettings) => void;
  const engine = provider();
  runtime = createApplicationRuntime({
    get: async () => ({ enabled: true }),
    setEnabled: async () => {},
    watch: (next) => { listener = next; return vi.fn(); },
  }, createMountainProjectApplication(engine));
  return { engine, emit: (enabled: boolean) => listener({ enabled }), runtime };
}

it.each(['106661515/asia', '105833388/yosemite-valley'])('restores Area %s across settings toggles and final disposal', async (area) => {
  window.location.href = `https://www.mountainproject.com/area/${area}`;
  document.head.innerHTML = '';
  document.body.innerHTML = asiaFixture;
  const originalBody = document.body.innerHTML;
  const app = bootstrap();
  await app.runtime.start();
  expect(document.documentElement.dataset.mpKoreaCore).toBe('ready');
  expect(document.querySelectorAll('.mpkr-left-sidebar-rail')).toHaveLength(1);
  expect(document.querySelector('.mpkr-area-photo')).not.toBeNull();
  expect(document.querySelectorAll('style[data-mpkr-area-route-finish]')).toHaveLength(1);
  expect(document.querySelector<HTMLAnchorElement>('.mpkr-south-korea-map__external')?.href)
    .toBe(`https://www.mountainproject.com/map/${area}`);
  expect(document.querySelector('[data-mpkr-area-route-group]')).toBeNull();
  expect(document.querySelector('#south-korea-row a')?.textContent).toBe('South Korea');
  expect(app.engine.availability).toHaveBeenCalled();
  app.emit(true);
  expect(document.querySelectorAll('.mpkr-left-sidebar-rail')).toHaveLength(1);
  app.emit(false);
  expect(document.body.innerHTML).toBe(originalBody);
  expect(document.querySelector('style[data-mpkr-area-route-finish]')).toBeNull();
  expect(document.documentElement.dataset.mpKoreaExtension).toBe('disabled');
  app.emit(true);
  expect(document.querySelectorAll('.mpkr-left-sidebar-rail')).toHaveLength(1);
  expect(document.querySelectorAll('style[data-mpkr-area-route-finish]')).toHaveLength(1);
  app.runtime.destroy();
  expect(document.body.innerHTML).toBe(originalBody);
  expect(document.documentElement.dataset.mpKoreaCore).toBeUndefined();
  expect(document.documentElement.dataset.mpKoreaPageKind).toBeUndefined();
  expect(document.documentElement.dataset.mpKoreaExtension).toBeUndefined();
  expect(document.documentElement.dataset.mpKoreaRenderer).toBeUndefined();
});

it('keeps parent-owned stats presentation when the allFrames application is disabled', async () => {
  window.location.href = 'https://www.mountainproject.com/route/stats/106232568/chouinard-b';
  document.head.innerHTML = '';
  // This DOM-only test does not load upstream stylesheets.
  document.body.innerHTML = CHOUINARD_B_STATS_FIXTURE.replace(/<link\b[^>]*>/gi, '');
  parentPresentation = new RouteStatsPresentation();
  expect(parentPresentation.mount(document)).toBe(true);
  const parentStyle = document.querySelector('style[data-mpkr-route-stats-presentation="styles"]');
  const app = bootstrap();
  await app.runtime.start();
  expect(document.documentElement.dataset.mpKoreaPageKind).toBe('route-stats');
  expect(document.querySelectorAll('style[data-mpkr-route-stats-presentation="styles"]')).toHaveLength(1);
  expect(document.querySelectorAll('iframe')).toHaveLength(0);
  app.emit(false);
  expect(parentStyle?.isConnected).toBe(true);
  app.runtime.destroy();
  expect(parentStyle?.isConnected).toBe(true);
  parentPresentation.destroy();
  expect(parentStyle?.isConnected).toBe(false);
});

it('does not start translation on unsupported pages', async () => {
  window.location.href = 'https://www.mountainproject.com/not-a-supported-page';
  document.head.innerHTML = '';
  document.body.innerHTML = '<p>Original</p>';
  const app = bootstrap();
  await app.runtime.start();
  expect(document.documentElement.dataset.mpKoreaCore).toBe('unsupported');
  expect(app.engine.availability).not.toHaveBeenCalled();
  app.runtime.destroy();
  expect(document.body.innerHTML).toBe('<p>Original</p>');
});

it('runs contribution pages through the direct-localization lifecycle', async () => {
  window.location.href = 'https://www.mountainproject.com/add/climb-area/106225629';
  document.head.innerHTML = '';
  document.body.innerHTML = `
    <h1>New Area in South Korea</h1>
    <form class="edit-form">
      <label>Title</label>
      <input name="title" value="작성 중인 이름">
      <button type="submit">Save Area</button>
    </form>`;
  const originalBody = document.body.innerHTML;
  const app = bootstrap();

  await app.runtime.start();
  expect(document.documentElement.dataset.mpKoreaPageKind).toBe('contribution');
  expect(document.documentElement.dataset.mpKoreaCore).toBe('ready');
  expect(document.documentElement.dataset.mpKoreaRenderer).toBe('direct-translation');
  expect(document.querySelector('h1')?.textContent).toBe('새 지역 추가 · South Korea');
  expect(document.querySelector('label')?.textContent).toBe('이름');
  expect(document.querySelector('button')?.textContent).toBe('지역 저장');
  expect(document.querySelector<HTMLInputElement>('input')?.value).toBe('작성 중인 이름');
  expect(app.engine.availability).not.toHaveBeenCalled();

  app.emit(false);
  expect(document.body.innerHTML).toBe(originalBody);
});

it('runs the guest contribution hash URL and observes late auth AJAX content', async () => {
  window.location.href = 'https://www.mountainproject.com/add/climb-area/106225629#';
  document.head.innerHTML = '';
  document.body.innerHTML = CONTRIBUTION_GUEST_ACCESS_FIXTURE;
  const app = bootstrap();

  await app.runtime.start();
  expect(document.documentElement.dataset.mpKoreaPageKind).toBe('contribution');
  expect(document.documentElement.dataset.mpKoreaCore).toBe('ready');
  expect(document.querySelector('#login-modal .modal-title')?.textContent)
    .toBe('가입 또는 로그인');
  expect(document.querySelector('#access-gate p')?.textContent?.replace(/\s+/g, ' ').trim())
    .toBe('이미 계정이 있나요? 로그인하고 이 안내 닫기');

  document.querySelector('#email-login')!.innerHTML = CONTRIBUTION_GUEST_AJAX_FORMS_FIXTURE.login;
  await new Promise((resolve) => setTimeout(resolve, 0));

  const form = document.querySelector<HTMLFormElement>('#email-login form')!;
  expect(document.querySelector('#email-login button')?.textContent).toBe('로그인');
  expect(document.querySelector<HTMLInputElement>('#email-login input[name="email"]')?.placeholder)
    .toBe('이메일로 로그인');
  expect(document.querySelector<HTMLInputElement>('#email-login input[name="pass"]')?.value)
    .toBe('keep-me');
  expect(form.getAttribute('action')).toBe('/auth/login/email');
});

it.each([
  ['https://www.mountainproject.com/area/106225629/add/photo', CONTRIBUTION_VARIANT_FORMS_FIXTURE.areaPhoto, '사진 추가 · South Korea'],
  ['https://www.mountainproject.com/route/106232568/add/photo', CONTRIBUTION_VARIANT_FORMS_FIXTURE.routePhoto, '사진 추가 · Chouinard B'],
  ['https://www.mountainproject.com/edit/imageLink/106225629?type=album', CONTRIBUTION_VARIANT_FORMS_FIXTURE.imageLink, '사진 복사본 추가 · South Korea'],
  ['https://www.mountainproject.com/upload/start/trail?areaId=106225629', CONTRIBUTION_VARIANT_FORMS_FIXTURE.trailUpload, '다음 방법 중 하나를 선택하세요'],
  ['https://www.mountainproject.com/edit/book/0?parentId=106225629', CONTRIBUTION_VARIANT_FORMS_FIXTURE.book, '새 가이드북'],
  ['https://www.mountainproject.com/edit/route/0?parentId=106225638', CONTRIBUTION_NEW_ROUTE_FIXTURE, '새 루트'],
])('starts direct localization for contribution variant %s', async (url, html, expectedTitle) => {
  window.location.href = url;
  document.head.innerHTML = '';
  document.body.innerHTML = html;
  const originalLocation = window.location.href;
  const form = document.querySelector<HTMLFormElement>(
    url.includes('/edit/route/') ? '#edit-route-form' : 'form',
  )!;
  const originalAction = form.getAttribute('action');
  const app = bootstrap();

  await app.runtime.start();

  expect(document.documentElement.dataset.mpKoreaPageKind).toBe('contribution');
  expect(document.documentElement.dataset.mpKoreaCore).toBe('ready');
  expect(document.documentElement.dataset.mpKoreaRenderer).toBe('direct-translation');
  expect(document.querySelector('h1')?.textContent).toBe(expectedTitle);
  expect(window.location.href).toBe(originalLocation);
  expect(form.getAttribute('action')).toBe(originalAction);
  expect(app.engine.availability).not.toHaveBeenCalled();
});

it('runs and restores the Help Center through the application lifecycle', async () => {
  window.location.href = 'https://www.mountainproject.com/help/999/future-topic';
  document.head.innerHTML = '';
  document.body.innerHTML = `
    <main id="help-page">
      <h1>Help Center</h1>
      <div class="list-group-item-heading">How can I get help?</div>
      <div class="list-group-item-text"><div class="faq-answer">Read this answer first.</div></div>
    </main>`;
  const originalBody = document.body.innerHTML;
  const app = bootstrap();

  await app.runtime.start();
  expect(document.documentElement.dataset.mpKoreaPageKind).toBe('help');
  expect(document.documentElement.dataset.mpKoreaRenderer).toBe('original-preserving-translation');
  expect(document.querySelector('h1')?.textContent).toBe('도움말 센터');
  expect(app.engine.availability).toHaveBeenCalled();

  app.emit(false);
  expect(document.body.innerHTML).toBe(originalBody);
});


it('restores the shared directory and reapplies it across extension OFF/ON', async () => {
  window.location.href = 'https://www.mountainproject.com/route-guide';
  document.head.innerHTML = '';
  document.body.innerHTML = directoryFixture;
  const original = document.body.innerHTML;
  const sourceLink = document.querySelector('#route-guide a');
  const app = bootstrap(); await app.runtime.start();
  expect(document.querySelectorAll('.mpkr-directory')).toHaveLength(1);
  expect(document.querySelector('#route-guide')!.classList.contains('mpkr-directory-original-hidden')).toBe(false);
  app.emit(false);
  expect(document.body.innerHTML).toBe(original);
  expect(document.querySelector('#route-guide a')).toBe(sourceLink);
  app.emit(true);
  expect(document.querySelectorAll('.mpkr-directory')).toHaveLength(1);
  app.runtime.destroy();
  expect(document.body.innerHTML).toBe(original);
});
