import { MountainProjectPageAdapter } from '../adapters/mountain-project-page-adapter';
import type { TranslationProvider, TranslationRequest } from '../core/translation-provider';
import { TranslationLedger } from '../core/translation-record';
import {
  ROUTE_FINDER_STATES_FIXTURE,
  SOUTH_KOREA_ROUTE_FINDER_FIXTURE,
} from '../test-fixtures/south-korea-route-finder';
import { DirectPageLocalizer } from './direct-page-localizer';
import { PageTranslationController } from './page-translation-controller';

function normalizedText(selector: string): string {
  return document.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
}

async function flushMutations(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 20));
}

class RecordingProvider implements TranslationProvider {
  readonly id = 'route-finder-test';
  readonly requests: TranslationRequest[] = [];

  async availability(): Promise<'available'> {
    return 'available';
  }

  async translate(request: TranslationRequest): Promise<string> {
    this.requests.push(request);
    return `한국어 설명: ${request.text}`;
  }
}

describe('Route Finder live-derived DOM fixture', () => {
  beforeEach(() => {
    document.head.innerHTML = '<base href="https://www.mountainproject.com/">';
    document.body.innerHTML = SOUTH_KOREA_ROUTE_FINDER_FIXTURE;
  });

  it('localizes fixed UI while preserving names, grades, form semantics, URLs, and nodes', () => {
    const routeLink = document.querySelector<HTMLAnchorElement>('#desktop-route-link')!;
    const nextPage = document.querySelector<HTMLAnchorElement>('#next-page')!;
    const form = document.querySelector<HTMLFormElement>('#routeFinderForm')!;
    const type = document.querySelector<HTMLSelectElement>('#type')!;
    const originalNextHref = nextPage.getAttribute('href');
    let submissions = 0;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      submissions += 1;
    });
    const localizer = new DirectPageLocalizer();

    localizer.apply(document);

    expect(normalizedText('#finder-summary h1')).toBe('클라이밍 루트 찾기');
    expect(normalizedText('#finder-summary')).toContain(
      '암벽 루트 (트래드 또는 스포츠 또는 톱로프) · 지역: South Korea · 난이도: 5.7 ~ 5.11d · 최소 별점 0개.',
    );
    expect(normalizedText('#finder-summary')).toContain(
      '클라이밍 지역, 난이도 순으로 정렬 · 결과 1~50 / 총 353개',
    );
    expect(normalizedText('#export-link')).toBe('CSV 내보내기');
    expect(normalizedText('#view-all')).toBe('전체 보기');
    expect(normalizedText('#top-pagination .no-click:nth-child(3)')).toBe('1 / 8');
    expect(document.querySelector('#top-pagination img[alt="처음"]')).not.toBeNull();
    expect(document.querySelector('#top-pagination img[alt="다음"]')).not.toBeNull();

    expect(Array.from(document.querySelectorAll('.screen-reader-only th'))
      .map((heading) => heading.textContent)).toEqual([
      '루트명',
      '위치',
      '별점',
      '난이도',
      '날짜',
    ]);
    expect(normalizedText('#mobile-route .small.text-warm')).toContain('트래드, 에이드 4피치');
    expect(normalizedText('#desktop-route .small.text-warm')).toBe('트래드, 에이드 4피치');
    expect(routeLink.textContent).toBe('Pigeon(비둘기)');
    expect(normalizedText('#proper-name-route strong')).toBe('Rock');
    expect(normalizedText('#proper-name-route td:nth-child(2) a')).toBe('Area');
    expect(normalizedText('#desktop-route .rateYDS')).toBe('5.7');

    expect(normalizedText('h2')).toBe('검색 조건 변경');
    expect(normalizedText('#routeFinderForm tr:nth-child(1) td:first-child')).toBe('위치:');
    expect(normalizedText('#change-location')).toBe('변경');
    expect(Array.from(type.options).map((option) => option.textContent)).toEqual([
      '암벽', '볼더', '에이드', '아이스', '믹스드',
    ]);
    expect(type.value).toBe('rock');
    expect(document.querySelector<HTMLInputElement>('#initial-id-single')?.value).toBe('106225629');
    expect(document.querySelector<HTMLInputElement>('[name="is_trad_climb"]')?.checked).toBe(true);
    expect(Array.from(document.querySelectorAll<HTMLSelectElement>('#stars option'))
      .map((option) => option.textContent)).toEqual(['모든 별점', '별점 4개 중 2+ 이상']);
    expect(Array.from(document.querySelectorAll<HTMLSelectElement>('#pitches option'))
      .map((option) => option.textContent)).toEqual([
      '피치 수 전체', '정확히 1피치', '최소 2피치', '6피치 이상',
    ]);
    expect(document.querySelector<HTMLInputElement>('#find-routes')?.value).toBe('루트 찾기');

    form.requestSubmit();
    expect(submissions).toBe(1);
    expect(form.getAttribute('action')).toBe('/route-finder');
    expect(nextPage.getAttribute('href')).toBe(originalNextHref);
    expect(document.querySelector('#desktop-route-link')).toBe(routeLink);

    localizer.restore();
    expect(normalizedText('#finder-summary h1')).toBe('Climbing Route Finder');
    expect(normalizedText('#mobile-route .small.text-warm')).toContain('Trad, Aid 4 pitches');
    expect(type.options[0]?.textContent).toBe('Rock');
    expect(type.value).toBe('rock');
  });

  it('localizes dynamically refreshed results once and restores the latest source DOM', async () => {
    const onChange = vi.fn();
    const localizer = new DirectPageLocalizer(onChange);
    localizer.apply(document);

    const results = document.querySelector<HTMLElement>('#results')!;
    results.innerHTML = `
      <table class="route-table"><tbody><tr class="route-row" id="late-route"><td>
        <a href="/route/999/new-route"><strong>New Route Name</strong></a>
        <span class="rateYDS">5.10a</span>
        <span class="small text-warm">Sport 2 pitches</span>
      </td></tr></tbody></table>
      <div role="status">No routes found.</div>
    `;
    await flushMutations();

    expect(normalizedText('#late-route strong')).toBe('New Route Name');
    expect(normalizedText('#late-route .rateYDS')).toBe('5.10a');
    expect(normalizedText('#late-route .small.text-warm')).toBe('스포츠 2피치');
    expect(normalizedText('#results [role="status"]')).toBe('조건에 맞는 루트가 없습니다.');
    const changeCount = onChange.mock.calls.length;
    await flushMutations();
    expect(onChange).toHaveBeenCalledTimes(changeCount);

    localizer.restore();
    expect(normalizedText('#late-route .small.text-warm')).toBe('Sport 2 pitches');
    expect(normalizedText('#results [role="status"]')).toBe('No routes found.');
  });

  it('localizes semantic search, reset, loading, empty, error, and retry states', () => {
    document.body.insertAdjacentHTML('beforeend', ROUTE_FINDER_STATES_FIXTURE);
    const localizer = new DirectPageLocalizer();
    localizer.apply(document);

    expect(normalizedText('#finder-states label')).toContain('루트 유형:');
    expect(Array.from(document.querySelectorAll('#finder-states button'))
      .map((button) => button.textContent)).toEqual(['필터 적용', '필터 초기화', '다시 시도']);
    expect(Array.from(document.querySelectorAll('#finder-states [role="status"]'))
      .map((element) => element.textContent)).toEqual([
      '불러오는 중...', '필터 조건에 맞는 루트가 없습니다.',
    ]);
    expect(normalizedText('#finder-states [role="alert"]'))
      .toBe('루트를 불러오지 못했습니다.');
    expect(document.querySelector('#finder-states [aria-label="불러오는 중..."]')).not.toBeNull();

    localizer.restore();
    expect(normalizedText('#finder-states [role="alert"]')).toBe('Unable to load routes.');
  });

  it('uses the provider only for structurally marked authored snippets', async () => {
    document.querySelector('#desktop-route td')?.insertAdjacentHTML(
      'beforeend',
      '<p id="authored-snippet" class="route-description">A sustained corner with a thoughtful finish.</p>',
    );
    const provider = new RecordingProvider();
    const controller = new PageTranslationController(
      provider,
      new TranslationLedger(),
      new MountainProjectPageAdapter(),
    );

    await controller.start();

    expect(provider.requests.map((request) => request.text)).toEqual([
      'A sustained corner with a thoughtful finish.',
    ]);
    expect(provider.requests.some((request) => request.text.includes('Pigeon'))).toBe(false);
    expect(provider.requests.some((request) => request.text.includes('5.7'))).toBe(false);
    expect(normalizedText('.mpkr-machine-translation'))
      .toContain('한국어 설명: A sustained corner with a thoughtful finish.');

    controller.destroy();
    expect(document.querySelectorAll('.mpkr-machine-translation')).toHaveLength(0);
    expect(normalizedText('#authored-snippet'))
      .toBe('A sustained corner with a thoughtful finish.');
  });
});
