import { MountainProjectPageAdapter } from '../adapters/mountain-project-page-adapter';
import type { TranslationProvider, TranslationRequest } from '../core/translation-provider';
import { TranslationLedger } from '../core/translation-record';
import {
  STATS_STANDARD_CONTROLS_FIXTURE,
  SWAN_SLAB_GULLY_STATS_FIXTURE,
} from '../test-fixtures/swan-slab-gully-stats';
import { DirectPageLocalizer } from './direct-page-localizer';
import { PageTranslationController } from './page-translation-controller';

function normalizedText(selector: string): string {
  return document.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
}

async function flushMutations(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 20));
}

class RecordingProvider implements TranslationProvider {
  readonly id = 'route-stats-test';
  readonly requests: TranslationRequest[] = [];

  async availability(): Promise<'available'> {
    return 'available';
  }

  async translate(request: TranslationRequest): Promise<string> {
    this.requests.push(request);
    return `한국어 메모: ${request.text}`;
  }
}

describe('Route Stats live-derived DOM fixture', () => {
  beforeEach(() => {
    document.head.innerHTML = '<base href="https://www.mountainproject.com/">';
    document.body.innerHTML = SWAN_SLAB_GULLY_STATS_FIXTURE;
  });

  it('localizes fixed Stats UI while preserving route data, links, charts, and node identity', () => {
    const routeLink = document.querySelector<HTMLAnchorElement>('#route-link')!;
    const ratingUser = document.querySelector<HTMLAnchorElement>('#rating-user')!;
    const tickUser = document.querySelector<HTMLAnchorElement>('#tick-user')!;
    const tickDate = document.querySelector<HTMLElement>('#tick-date')!;
    const chart = document.querySelector<HTMLElement>('#star-distribution-chart')!;
    const deleteButton = document.querySelector<HTMLImageElement>('#delete-tick')!;
    const localizer = new DirectPageLocalizer();

    localizer.apply(document);

    expect(normalizedText('#stats-title')).toBe('Swan Slab Gully 통계');
    expect(normalizedText('#suggested-ratings-column h3')).toBe('체감 난이도 132');
    expect(normalizedText('#star-ratings-column h3')).toBe('사용자 별점 638');
    expect(normalizedText('#todo-column h3')).toBe('등반 예정자 1,851');
    expect(normalizedText('#ticks-column h3')).toBe('등반 기록 4,261');
    expect(normalizedText('#todo-column .small.text-warm')).toBe('파트너 찾기에 등록됨');
    expect(normalizedText('[id="ticks.203000000"] td:first-child')).toBe('비공개 등반 기록');
    expect(normalizedText('[id="ticks.203000000"] .small.text-muted')).toBe('· 이름/메모 없음');
    expect(Array.from(document.querySelectorAll('button')).map((button) => button.textContent))
      .toEqual(['더 보기', '더 보기', '더 보기', '더 보기']);
    expect(document.querySelector('#ticks-more')?.getAttribute('aria-label')).toBe('더 보기');
    expect(deleteButton.getAttribute('alt')).toBe('삭제');
    expect(document.querySelector('.show-tooltip')?.getAttribute('title')).toBe('통계 보기');

    expect(document.querySelector('#route-link')).toBe(routeLink);
    expect(document.querySelector('#rating-user')).toBe(ratingUser);
    expect(document.querySelector('#tick-user')).toBe(tickUser);
    expect(document.querySelector('#tick-date')).toBe(tickDate);
    expect(document.querySelector('#star-distribution-chart')).toBe(chart);
    expect(normalizedText('#route-link')).toBe('Swan Slab Gully (5.6 4c)');
    expect(normalizedText('#stats-grade')).toBe('5.6 YDS 4c French');
    expect(normalizedText('#suggested-grade')).toBe('5.8-');
    expect(normalizedText('#tick-date')).toBe('Sep 20, 2026');
    expect(ratingUser.textContent).toBe('Melissa Daigle');
    expect(tickUser.textContent).toBe('Tyler Allen');
    expect(routeLink.getAttribute('href')).toBe('/route/105889783/swan-slab-gully');
    expect(deleteButton.getAttribute('data-id')).toBe('203864354');

    localizer.restore();

    expect(normalizedText('#stats-title')).toBe('Statistics for Swan Slab Gully');
    expect(normalizedText('#ticks-column h3')).toBe('Ticks 4,261');
    expect(document.querySelector('#ticks-more')?.getAttribute('aria-label')).toBe('Show More');
    expect(deleteButton.getAttribute('alt')).toBe('delete');
  });

  it('localizes semantic filters, headings, pagination, empty states, and accessibility labels', () => {
    document.querySelector('.onx-stats-table')?.insertAdjacentHTML(
      'beforeend',
      STATS_STANDARD_CONTROLS_FIXTURE,
    );
    const localizer = new DirectPageLocalizer();

    localizer.apply(document);

    expect(normalizedText('#stats-standard-controls h3')).toBe('등반 기록 통계');
    expect(normalizedText('#stats-standard-controls label:first-of-type')).toContain('필터');
    expect(normalizedText('#stats-standard-controls label:last-of-type')).toContain('정렬:');
    expect(Array.from(document.querySelectorAll('#stats-standard-controls th'))
      .map((heading) => heading.textContent)).toEqual([
      '클라이머',
      '날짜',
      '메모',
      '난이도',
      '별점',
      '비율',
    ]);
    expect(normalizedText('#stats-standard-controls [role="status"]'))
      .toBe('아직 등반 기록이 없습니다.');
    expect(document.querySelector('#stats-standard-controls [role="status"]')?.getAttribute('aria-label'))
      .toBe('아직 등반 기록이 없습니다.');
    expect(Array.from(document.querySelectorAll('#stats-standard-controls button'))
      .map((button) => [button.textContent, button.getAttribute('aria-label')]))
      .toEqual([['이전', '이전'], ['다음', '다음']]);

    localizer.restore();
    expect(normalizedText('#stats-standard-controls h3')).toBe('Tick Statistics');
    expect(normalizedText('#stats-standard-controls [role="status"]')).toBe('No ticks yet.');
  });

  it('sends only authored tick text through the provider and restores its original text node', async () => {
    const details = document.querySelector<HTMLElement>('#tick-details')!;
    const tickUser = document.querySelector<HTMLAnchorElement>('#tick-user')!;
    const originalNoteNode = Array.from(details.childNodes)
      .find((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.includes('LED pitch 2'))!;
    const provider = new RecordingProvider();
    const adapter = new MountainProjectPageAdapter();
    const controller = new PageTranslationController(
      provider,
      new TranslationLedger(),
      adapter,
    );

    await controller.start();

    expect(provider.requests.map((request) => request.text)).toEqual([
      '· Lead / Onsight. LED pitch 2. Barefoot. Got passed by two guys soloing. Super fun!',
    ]);
    expect(provider.requests.some((request) => request.text.includes('Tyler Allen'))).toBe(false);
    expect(provider.requests.some((request) => request.text.includes('Sep 20, 2026'))).toBe(false);
    expect(provider.requests.some((request) => request.text.includes('5.8-'))).toBe(false);
    expect(normalizedText('#tick-date')).toBe('Sep 20, 2026');
    expect(document.querySelector('#tick-user')?.textContent).toBe('Tyler Allen');
    expect(document.querySelector<HTMLElement>('.mpkr-stats-tick-note-source')?.style.display)
      .toBe('none');
    expect(normalizedText('.mpkr-machine-translation')).toContain('한국어 메모:');
    expect(document.querySelectorAll('.mpkr-original-toggle')).toHaveLength(1);

    document.querySelector<HTMLButtonElement>('.mpkr-original-toggle')!.click();
    expect(document.querySelector<HTMLElement>('.mpkr-stats-tick-note-source')?.style.display)
      .toBe('');
    expect(normalizedText('.mpkr-machine-translation')).toContain('한국어 메모:');

    controller.destroy();
    expect(document.querySelector('.mpkr-stats-tick-note-source')).toBeNull();
    expect(document.querySelectorAll('.mpkr-machine-translation')).toHaveLength(0);
    expect(Array.from(details.childNodes)).toContain(originalNoteNode);
    expect(details.textContent).toContain('LED pitch 2. Barefoot.');
    expect(document.querySelector('#tick-user')).toBe(tickUser);
  });

  it('translates ticks rendered after load once and restores their original structure', async () => {
    const ticksBody = document.querySelector<HTMLTableSectionElement>('#ticks-body')!;
    ticksBody.replaceChildren();
    const provider = new RecordingProvider();
    const controller = new PageTranslationController(provider, new TranslationLedger());
    await controller.start();

    const row = document.createElement('tr');
    row.id = 'ticks.203831409';
    row.innerHTML = `
        <td class="text-nowrap"><a id="late-tick-user" href="/user/200000002">Matt Ognibene</a></td>
        <td><div class="small"><div id="late-tick-details"><strong id="late-tick-date">Sep 13, 2026</strong> · Lead. With Astrid, nice semi-rest day when my skin is destroyed<img class="delete pointer" data-id="203831409" alt="delete" src="/img/icons/trash.svg"></div></div></td>
    `;
    ticksBody.append(row);
    const details = document.querySelector<HTMLElement>('#late-tick-details')!;
    const originalNoteNode = Array.from(details.childNodes)
      .find((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.includes('With Astrid'))!;
    await flushMutations();

    expect(document.querySelector('.mpkr-stats-tick-note-source')).not.toBeNull();
    expect(provider.requests.map((request) => request.text)).toEqual([
      '· Lead. With Astrid, nice semi-rest day when my skin is destroyed',
    ]);
    expect(document.querySelector('#late-tick-user')?.textContent).toBe('Matt Ognibene');
    expect(document.querySelector('#late-tick-date')?.textContent).toBe('Sep 13, 2026');
    expect(document.querySelectorAll('.mpkr-machine-translation')).toHaveLength(1);
    await flushMutations();
    expect(provider.requests).toHaveLength(1);

    controller.destroy();
    expect(document.querySelector('.mpkr-stats-tick-note-source')).toBeNull();
    expect(Array.from(details.childNodes)).toContain(originalNoteNode);
    expect(details.textContent).toContain('With Astrid, nice semi-rest day');
  });

  it('recognizes a South Korea Stats breadcrumb without relying on the sampled route name', () => {
    document.body.innerHTML = `
      <div id="route-stats">
        <div class="mb-half small text-warm">
          <a href="/route-guide">All Locations</a> &gt;
          <a href="/area/106225629/south-korea">S Korea</a> &gt;
          <a href="/route/999999999/another-route">Another Route</a>
        </div>
      </div>
    `;
    const adapter = new MountainProjectPageAdapter();

    expect(adapter.isSouthKoreaPage(new URL(
      'https://www.mountainproject.com/route/stats/999999999/another-route',
    ))).toBe(true);
  });

  it('localizes dynamically rendered Stats rows without observer loops and restores them', async () => {
    const onChange = vi.fn();
    const observedLocalizer = new DirectPageLocalizer(onChange);
    observedLocalizer.apply(document);

    const column = document.createElement('div');
    column.id = 'dynamic-stats';
    column.innerHTML = `
      <h3>Suggested Ratings <span class="small text-muted">0</span></h3>
      <button type="button" aria-label="Show More">Show More</button>
      <div role="status">No ratings yet.</div>
    `;
    document.querySelector('.onx-stats-table')!.append(column);
    await flushMutations();

    expect(normalizedText('#dynamic-stats h3')).toBe('체감 난이도 0');
    expect(normalizedText('#dynamic-stats button')).toBe('더 보기');
    expect(normalizedText('#dynamic-stats [role="status"]')).toBe('아직 평가가 없습니다.');
    const changeCount = onChange.mock.calls.length;
    await flushMutations();
    expect(onChange).toHaveBeenCalledTimes(changeCount);

    observedLocalizer.restore();
    expect(normalizedText('#dynamic-stats h3')).toBe('Suggested Ratings 0');
    expect(normalizedText('#dynamic-stats button')).toBe('Show More');
    expect(normalizedText('#dynamic-stats [role="status"]')).toBe('No ratings yet.');
  });
});
