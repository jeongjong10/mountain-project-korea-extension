import { MountainProjectPageAdapter } from '../adapters/mountain-project-page-adapter';
import type { TranslationProvider, TranslationRequest } from '../core/translation-provider';
import { TranslationLedger } from '../core/translation-record';
import {
  CHOUINARD_B_COMMENT_FIXTURE,
  CHOUINARD_B_ROUTE_FIXTURE,
} from '../test-fixtures/chouinard-b-route';
import { DirectPageLocalizer } from './direct-page-localizer';
import { PageTranslationController } from './page-translation-controller';

function normalizedText(selector: string): string {
  return document.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
}

async function flushMutations(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

class RecordingProvider implements TranslationProvider {
  readonly id = 'recording';
  readonly requests: TranslationRequest[] = [];

  async availability(): Promise<'available'> {
    return 'available';
  }

  async translate(request: TranslationRequest): Promise<string> {
    this.requests.push(request);
    return `한국어: ${request.text}`;
  }
}

describe('Route live DOM fixture', () => {
  beforeEach(() => {
    document.head.innerHTML = '<base href="https://www.mountainproject.com/">';
    document.body.innerHTML = CHOUINARD_B_ROUTE_FIXTURE;
  });

  it('localizes Route UI while preserving names, grades, coordinates, dates, counts, and node identity', () => {
    const routeName = document.querySelector<HTMLElement>('#route-name')!;
    const nearbyRoute = document.querySelector<HTMLAnchorElement>('#nearby-route')!;
    const todo = document.querySelector<HTMLAnchorElement>('#todoToggle')!;
    const ratingStar = document.querySelector<HTMLImageElement>('#rating-star')!;
    const commentForm = document.querySelector<HTMLFormElement>('#comment-form')!;
    const photoLink = document.querySelector<HTMLAnchorElement>('#photo-link')!;
    const localizer = new DirectPageLocalizer();

    localizer.apply(document);

    expect(normalizedText('.mp-sidebar h3')).toBe('Insu-bong (Bukhansan)의 루트');
    expect(normalizedText('#left-nav-unsorted-label')).toBe('미정렬 루트:');
    expect(normalizedText('.mp-sidebar .small.text-warm')).toBe('순서가 잘못되었나요? 루트 정렬');
    expect(normalizedText('#route-type')).toBe('트래드, 500 ft (152 m), 5피치');
    expect(normalizedText('#route-star-avg')).toBe('평균 3.2 (30표)');
    expect(normalizedText('#page-views')).toBe('총 4,776 · 월 22');
    expect(normalizedText('#you-and-route h2')).toBe('나와 이 루트');
    expect(normalizedText('#you-and-route')).toContain('의견 30개');
    expect(normalizedText('#you-and-route')).toContain('내 할 일 목록:');
    expect(normalizedText('#you-and-route')).toContain('내 별점:');
    expect(normalizedText('#you-and-route')).toContain('내 난이도 평가:');
    expect(normalizedText('#you-and-route')).toContain('내 등반 기록:');
    expect(normalizedText('#todoToggle')).toBe('할 일에 추가');
    expect(normalizedText('#add-tick')).toBe('새 등반 기록 추가');
    expect(normalizedText('#your-route-score')).toBe('없음');
    expect(normalizedText('#tick-empty')).toBe('없음');
    expect(normalizedText('#explore-3d')).toBe('이 루트를 3D로 보기');
    expect(normalizedText('#share-content-modal .modal-title')).toBe('Mountain Project에 공유');
    expect(normalizedText('#share-route')).toBe('루트 만들기');
    expect(normalizedText('.comment-count')).toBe('댓글 9개');
    expect(document.querySelector<HTMLTextAreaElement>('#comment-textarea')?.placeholder)
      .toBe('댓글 작성');

    expect(document.querySelector('#route-name')).toBe(routeName);
    expect(document.querySelector('#nearby-route')).toBe(nearbyRoute);
    expect(document.querySelector('#todoToggle')).toBe(todo);
    expect(document.querySelector('#rating-star')).toBe(ratingStar);
    expect(document.querySelector('#comment-form')).toBe(commentForm);
    expect(document.querySelector('#photo-link')).toBe(photoLink);
    expect(routeName.childNodes[0]?.textContent?.trim()).toBe('Chouinard B');
    expect(nearbyRoute.textContent).toBe('Chouinard A');
    expect(normalizedText('#route-grade')).toBe('5.8 YDS 5b French HVS 4c PG13');
    expect(normalizedText('#route-gps')).toBe('37.66042, 126.98084');
    expect(normalizedText('#first-ascent')).toBe('Yvon Chouinard');
    expect(normalizedText('#shared-user')).toBe('coreylee');
    expect(normalizedText('#admin-user')).toBe('Chan Kim');
    expect(normalizedText('.description-details')).toContain('on Aug 18, 2008');
    expect(todo.getAttribute('href')).toBe('#');
    expect(todo.getAttribute('title')).toBe('개인 할 일 목록에 추가/제거');
    expect(ratingStar.getAttribute('onclick')).toBe("setScore('routes', '106232568', 1, 1, 0);");
    expect(ratingStar.getAttribute('alt')).toBe('별점');
    expect(commentForm.getAttribute('action')).toBe('/ajax/comments/add');
    expect(photoLink.getAttribute('href')).toBe('/photo/112217546/example');
    expect(photoLink.getAttribute('onclick')).toBe('return photoClicked(112217546);');
    expect(document.querySelector('#suggest-change img')?.getAttribute('title')).toBe('변경 제안');
    expect(document.querySelector('#share-content-modal .close')?.getAttribute('aria-label')).toBe('닫기');
    expect(document.querySelector('#route-filter')?.getAttribute('title')).toBe('왼쪽에서 오른쪽');

    localizer.restore();

    expect(normalizedText('.mp-sidebar h3')).toBe('Routes in Insu-bong (Bukhansan)');
    expect(normalizedText('#route-type')).toBe('Trad, 500 ft (152 m), 5 pitches');
    expect(normalizedText('#you-and-route h2')).toBe('You & This Route');
    expect(todo.textContent).toBe('Add To-Do');
    expect(todo.getAttribute('title')).toBe('Add/Remove from your personal To-Do List');
    expect(ratingStar.getAttribute('alt')).toBe('Rating');
    expect(document.querySelector<HTMLTextAreaElement>('#comment-textarea')?.placeholder)
      .toBe('Write a comment');
  });

  it('translates dynamic Route filter and comment UI without replacing functional elements', async () => {
    const localizer = new DirectPageLocalizer();
    localizer.apply(document);

    const label = document.querySelector<HTMLElement>('#route-type-label')!;
    label.innerHTML = 'Trad Routes in <span class="text-danger">Red</span>';
    const commentList = document.querySelector<HTMLElement>('.comment-list')!;
    commentList.innerHTML = CHOUINARD_B_COMMENT_FIXTURE;
    const full = document.getElementById('112217507-full')!;
    const more = document.querySelector<HTMLAnchorElement>('[onclick^="showFullComment"]')!;
    const flag = document.querySelector<HTMLAnchorElement>('.flag-trigger')!;
    await flushMutations();

    expect(normalizedText('#route-type-label')).toBe('트래드 루트 빨간색');
    expect(document.getElementById('112217507-full')).toBe(full);
    expect(document.querySelector('[onclick^="showFullComment"]')).toBe(more);
    expect(document.querySelector('.flag-trigger')).toBe(flag);
    expect(more.textContent).toBe('더 보기');
    expect(normalizedText('.show-more-comments-trigger')).toBe('댓글 6개 더 보기');
    expect(normalizedText('.like-trigger')).toBe('유용한 정보: 0');
    expect(flag.textContent).toBe('신고');
    expect(full.textContent).toBe('The upper pitches have long sections between protection.');

    localizer.restore();
    expect(normalizedText('#route-type-label')).toBe('Trad Routes in Red');
    expect(more.textContent).toBe('more');
    expect(normalizedText('.show-more-comments-trigger')).toBe('Show 6 More Comments');
    expect(flag.textContent).toBe('Flag');
  });

  it('collects every authored Route section, photo title, and live comment through the provider boundary', async () => {
    const adapter = new MountainProjectPageAdapter();
    const initialTargets = [
      ...adapter.collectPageTargets(),
      ...adapter.collectCommentTargets(),
    ];

    expect(initialTargets.map((target) => [target.category, target.source])).toEqual([
      ['description', 'Pitch 1 follows a finger crack to a bolted anchor.'],
      ['description', 'Pitch 2 follows a thin flake past fixed protection.'],
      ['access', 'The line begins north of the broad slab.'],
      ['safety', 'Bring a single rack and small nuts.'],
      ['safety', 'Use the established rappel anchors.'],
      ['description', 'A climber follows the corner above Seoul.'],
    ]);
    expect(initialTargets.some((target) => target.source.includes('Chouinard B'))).toBe(false);
    expect(initialTargets.some((target) => target.source.includes('Yvon Chouinard'))).toBe(false);
    expect(initialTargets.some((target) => target.source.includes('37.66042'))).toBe(false);

    const provider = new RecordingProvider();
    const ledger = new TranslationLedger();
    const controller = new PageTranslationController(provider, ledger);
    await controller.start();

    expect(provider.requests.map((request) => request.text)).toEqual(
      initialTargets.map((target) => target.source),
    );
    expect(document.querySelector<HTMLElement>('#description-one')?.style.display).toBe('none');
    expect(document.querySelector<HTMLElement>('#photo-link .title-row')?.style.display).toBe('none');

    const commentList = document.querySelector<HTMLElement>('.comment-list')!;
    commentList.innerHTML = CHOUINARD_B_COMMENT_FIXTURE;
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(provider.requests.at(-1)?.text)
      .toBe('The upper pitches have long sections between protection.');
    expect(provider.requests.some((request) => request.text.includes('Nate D'))).toBe(false);
    expect(provider.requests.some((request) => request.text.includes('Oct 10, 2016'))).toBe(false);
    expect(document.getElementById('112217507-trimmed')?.style.display).toBe('none');
    expect(document.getElementById('112217507-full')?.style.display).toBe('none');
    expect(document.querySelector('.comment-time')?.textContent).toContain('Oct 10, 2016');

    document.querySelectorAll<HTMLButtonElement>('.mpkr-original-toggle')
      .forEach((toggle) => toggle.click());
    expect(document.querySelector<HTMLElement>('#description-one')?.style.display).toBe('');
    expect(document.querySelector<HTMLElement>('#photo-link .title-row')?.style.display).toBe('');
    expect(document.getElementById('112217507-trimmed')?.style.display).toBe('');
    expect(document.getElementById('112217507-full')?.style.display).toBe('none');
    expect(Array.from(document.querySelectorAll<HTMLElement>('.mpkr-machine-translation'))
      .every((element) => element.style.display === '')).toBe(true);

    controller.destroy();
    expect(document.querySelectorAll('.mpkr-machine-translation')).toHaveLength(0);
    expect(document.querySelector<HTMLElement>('#description-one')?.style.display).toBe('');
    expect(document.querySelector<HTMLElement>('#photo-link .title-row')?.style.display).toBe('');
  });

  it('does not depend on the sampled Route name or its authored sentences', () => {
    document.querySelector('#route-name')!.childNodes[0]!.textContent = 'Another Granite Line';
    document.querySelector('#nearby-route')!.textContent = 'Neighboring Route';
    document.querySelector('#description-one')!.textContent = 'Entirely different authored copy.';
    const localizer = new DirectPageLocalizer();
    const adapter = new MountainProjectPageAdapter();
    const targets = adapter.collectPageTargets();

    localizer.apply(document);

    expect(document.querySelector('#route-name')!.childNodes[0]?.textContent?.trim())
      .toBe('Another Granite Line');
    expect(document.querySelector('#nearby-route')?.textContent).toBe('Neighboring Route');
    expect(targets[0]?.source).toBe('Entirely different authored copy.');
    localizer.restore();
  });
});
