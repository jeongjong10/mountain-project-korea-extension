import { TranslationLedger } from '@/core/translation-record';
import type { TranslationProvider } from '@/core/translation-provider';
import { DirectPageLocalizer } from '@/localization/direct-page-localizer';
import { PageTranslationController } from '@/localization/page-translation-controller';
import { OriginalPreservingRenderer } from '@/rendering/original-preserving-renderer';
import { MountainProjectPageAdapter } from '@/sites/mountain-project/dom/page-adapter';
import { HELP_SELECTORS } from '@/sites/mountain-project/contract/selectors/help';
import { translateHelpUi } from '@/sites/mountain-project/contract/text/help';
import { HelpHubLocalizer } from '@/localization/help-hub-localizer';
import { featureRequestCard, gettingStartedCards, helpHubControls } from '../fixtures/mountain-project/help-hub';

const originalUrl = window.location.href;
let controller: PageTranslationController;
let localizer: DirectPageLocalizer;
const mutationObservers: Array<{ observer: MutationObserver; callback: MutationCallback }> = [];

async function flush(complete: () => boolean = () => true): Promise<void> {
  for (let batch = 0; batch < 100; batch += 1) {
    await vi.runAllTimersAsync();
    let delivered = 0;
    for (const { observer, callback } of mutationObservers) {
      const records = observer.takeRecords();
      delivered += records.length;
      if (records.length) callback(records, observer);
    }
    if (!delivered && complete()) return;
  }
  throw new Error('Help mutations or translations did not settle within 100 batches');
}

function provider(): TranslationProvider {
  return {
    id: 'help-test',
    availability: vi.fn(async () => 'available' as const),
    translate: vi.fn(async ({ text }) => `한국어: ${text}`),
  };
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'], loopLimit: 100 });
  // Happy DOM's observer delivery uses a separate window's real timers.
  const NativeMutationObserver = MutationObserver;
  const NativeWeakRef = WeakRef;
  class RetainedObserverReference<T extends WeakKey> extends NativeWeakRef<T> {
    constructor(readonly target: T) {
      super(target);
    }
  }
  mutationObservers.length = 0;
  vi.stubGlobal('MutationObserver', class extends NativeMutationObserver {
    constructor(callback: MutationCallback) {
      super(callback);
      mutationObservers.push({ observer: this, callback });
    }

    override observe(target: Node, options?: MutationObserverInit): void {
      // Happy DOM 18 keeps its report callback only in a WeakRef; GC can drop it
      // while the observer is still active. Retain only references made by observe.
      globalThis.WeakRef = RetainedObserverReference;
      try {
        super.observe(target, options);
      } finally {
        globalThis.WeakRef = NativeWeakRef;
      }
    }
  });
});

afterEach(() => {
  controller?.destroy();
  localizer?.restore();
  document.body.innerHTML = '';
  window.location.href = originalUrl;
  vi.clearAllTimers();
  vi.restoreAllMocks();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('Help center localization', () => {
  it('localizes classic FAQ content without breaking accordion, links, lists or restoration', async () => {
    window.location.href = 'https://www.mountainproject.com/help/999/future-topic';
    document.body.innerHTML = `
      <main id="help-page">
        <h1>Help Center</h1>
        <a class="faq-section-card" href="/help/999/future-topic">General Policies</a>
        <div class="list-group-item">
          <div class="list-group-item-heading" data-toggle="collapse" data-target="#answer-1">
            How do I use this feature?<span class="expander">+</span>
          </div>
          <div class="list-group-item-text collapse" id="answer-1">
            <div class="faq-answer">Read this line.
Keep this line. Read the <a href="/route-guide">route guide</a> first.
              <ul><li>Keep the original list structure.</li></ul>
            </div>
          </div>
        </div>
        <button id="contact">Contact Us</button>
      </main>`;
    const original = document.body.innerHTML;
    const question = document.querySelector<HTMLElement>('.list-group-item-heading')!;
    const click = vi.fn();
    question.addEventListener('click', click);
    const adapter = new MountainProjectPageAdapter();
    const renderer = new OriginalPreservingRenderer();
    const engine = provider();
    controller = new PageTranslationController(engine, new TranslationLedger(), adapter, renderer);
    localizer = new DirectPageLocalizer();

    await controller.start();
    localizer.apply();

    expect(document.querySelector('h1')?.textContent).toBe('도움말 센터');
    expect(document.querySelector('.faq-section-card')?.textContent).toBe('일반 정책');
    expect(question.textContent).toContain('한국어: How do I use this feature?');
    expect(document.querySelector('.faq-answer')?.textContent).toContain('한국어: Read this line.');
    expect(vi.mocked(engine.translate).mock.calls.some(([request]) => (
      request.text.includes('Read this line.\nKeep this line.')
    ))).toBe(true);
    expect(document.querySelector<HTMLAnchorElement>('.faq-answer a')?.getAttribute('href')).toBe('/route-guide');
    expect(document.querySelector('.faq-answer ul > li')).not.toBeNull();
    question.click();
    expect(click).toHaveBeenCalledOnce();

    controller.destroy();
    localizer.restore();
    expect(document.body.innerHTML).toBe(original);
  });

  it('handles dynamic Help Hub FAQ, search results and Feature Request translations', async () => {
    window.location.href = 'https://www.mountainproject.com/help-hub';
    document.body.innerHTML = `
      <main id="help-hub-page">
        <h1>Help Center</h1>
        <input id="hh-search-input" placeholder="Search for help (e.g. 'duplicate accounts', 'add a route')">
        <button class="hh-tab-btn">Browse Topics</button>
        <section id="hh-faq-sections">
          <div class="hh-faq-section"><button class="hh-faq-q"><span class="hh-faq-qt">What is a tick?</span></button><div class="hh-faq-a">A tick records a climb.</div></div>
        </section>
        <section id="hh-search-results"><div id="hh-results-list"></div></section>
        <section id="hh-wishes-list"><article class="hh-wish-card">
          <h3 class="hh-wish-title">Newest offline map idea</h3>
          <p class="hh-wish-desc">Keep this author description exactly as submitted.</p>
          <div class="hh-wish-meta">By <strong>Alice Climber</strong></div>
          <button class="hh-vote-btn">Vote</button>
        </article></section>
      </main>`;
    const vote = document.querySelector<HTMLButtonElement>('.hh-vote-btn')!;
    const voteClick = vi.fn();
    vote.addEventListener('click', voteClick);
    const adapter = new MountainProjectPageAdapter();
    const renderer = new OriginalPreservingRenderer();
    const engine = provider();
    controller = new PageTranslationController(engine, new TranslationLedger(), adapter, renderer);
    localizer = new DirectPageLocalizer();

    await controller.start();
    localizer.apply();
    expect(document.querySelector('.hh-faq-qt')?.textContent).toContain('한국어: What is a tick?');
    expect(document.querySelector<HTMLInputElement>('#hh-search-input')?.placeholder).toBe('도움말 검색 (예: 중복 계정, 루트 추가)');
    expect(document.querySelector('.hh-tab-btn')?.textContent).toBe('주제 둘러보기');
    expect(document.querySelector('.hh-wish-title')?.textContent).toBe('Newest offline map idea');
    expect(document.querySelector('.hh-wish-desc')?.textContent).toBe('Keep this author description exactly as submitted.');
    expect(document.querySelector('.hh-wish-meta strong')?.textContent).toBe('Alice Climber');
    expect(document.querySelector('.mpkr-translation-body .hh-wish-title')?.textContent)
      .toContain('한국어: Newest offline map idea');
    expect(document.querySelector('.mpkr-translation-body .hh-wish-desc')?.textContent)
      .toContain('한국어: Keep this author description exactly as submitted.');

    document.querySelector('#hh-results-list')!.innerHTML = `
      <article class="hh-result-card"><h3>How do I add a route?</h3><p>Open the <a href="/route-guide">route guide</a>.</p></article>`;
    await flush();
    expect(document.querySelector('.hh-result-card h3')?.textContent)
      .toContain('한국어: How do I add a route?');
    expect(document.querySelector('.hh-wish-title')?.textContent).toBe('Newest offline map idea');
    expect(document.querySelector('.hh-wish-desc')?.textContent).toBe('Keep this author description exactly as submitted.');
    expect(document.querySelector('.hh-wish-meta strong')?.textContent).toBe('Alice Climber');
    expect(document.querySelector<HTMLAnchorElement>('.hh-result-card a')?.getAttribute('href')).toBe('/route-guide');
    vote.click();
    expect(voteClick).toHaveBeenCalledOnce();

    controller.destroy();
    localizer.restore();
    expect(document.querySelector('.hh-faq-qt')?.textContent).toBe('What is a tick?');
    expect(document.querySelector('.hh-result-card h3')?.textContent).toBe('How do I add a route?');
    expect(document.querySelector<HTMLInputElement>('#hh-search-input')?.placeholder)
      .toBe("Search for help (e.g. 'duplicate accounts', 'add a route')");
  });

  it('translates the name review body inline and restores its links and nested lists', async () => {
    window.location.href = 'https://www.mountainproject.com/name-review-process';
    document.body.innerHTML = `
      <main id="name-review-process">
        <div class="row page-title"><h1>Name Review Process</h1></div>
        <div class="row"><h2>Overview</h2><p>Read the <a href="/help">help center</a> before continuing.</p>
          <ol><li>Review each flagged route name.<ol><li>Keep nested steps intact.</li></ol></li></ol>
        </div>
      </main>`;
    const adapter = new MountainProjectPageAdapter();
    controller = new PageTranslationController(
      provider(), new TranslationLedger(), adapter, new OriginalPreservingRenderer(),
    );
    localizer = new DirectPageLocalizer();

    await controller.start();
    localizer.apply();
    expect(document.querySelector('h1')?.textContent).toBe('명칭 검토 절차');
    expect(document.querySelector('h2')?.textContent).toContain('한국어: Overview');
    expect(document.querySelector<HTMLAnchorElement>('p a')?.getAttribute('href')).toBe('/help');
    expect(document.querySelectorAll('ol')).toHaveLength(2);

    controller.destroy();
    localizer.restore();
    expect(document.querySelector('h2')?.textContent).toBe('Overview');
    expect(document.querySelector('p')?.textContent).toBe('Read the help center before continuing.');
  });

  it('translates dynamically rendered Getting Started cards and later FAQ content without duplicating wrappers', async () => {
    window.location.href = 'https://www.mountainproject.com/help-hub';
    document.body.innerHTML = helpHubControls;
    const engine = provider();
    const ledger = new TranslationLedger();
    const adapter = new MountainProjectPageAdapter();
    const collectRoots = adapter.mutationRoots.bind(adapter);
    const observedRoots: ParentNode[] = [];
    vi.spyOn(adapter, 'mutationRoots').mockImplementation((records) => {
      const roots = collectRoots(records);
      observedRoots.push(...roots);
      // Happy DOM drops matches whose selector ancestor lies outside the query root.
      // Use the existing help scope here; Chromium must validate the subtree queries.
      return [...new Set(roots.map((root) => (
        root instanceof Element ? root.closest('#help-hub-page') ?? root : root
      )))];
    });
    controller = new PageTranslationController(
      engine, ledger, adapter, new OriginalPreservingRenderer(),
    );
    localizer = new DirectPageLocalizer();
    // Production can localize fixed UI before discovering authored targets.
    localizer.apply();
    await controller.start();
    const grid = document.querySelector('#hh-gs-grid')!;
    grid.innerHTML = gettingStartedCards;
    const links = Array.from(grid.querySelectorAll('a'));
    const originalLinks = links.map((link) => link.getAttribute('href'));
    await flush(() => {
      const records = ledger.snapshot();
      return records.some((record) => record.source === 'Download areas for offline')
        && records.every((record) => record.status === 'translated');
    });

    expect(observedRoots).toContain(grid);
    grid.querySelectorAll('h3, p').forEach((element) => expect(element.textContent).toContain('한국어:'));
    expect(Array.from(grid.querySelectorAll('.hh-gs-num')).map((el) => el.textContent)).toEqual(['01', '02', '03', '04']);
    expect(Array.from(grid.querySelectorAll('a'))).toEqual(links);
    expect(links.map((link) => link.getAttribute('href'))).toEqual(originalLinks);
    expect(ledger.snapshot().some((record) => record.source === 'Create your account')).toBe(true);

    const count = vi.mocked(engine.translate).mock.calls.length;
    localizer.apply();
    await flush();
    expect(engine.translate).toHaveBeenCalledTimes(count);
    expect(grid.querySelector(`${HELP_SELECTORS.inlineSource} ${HELP_SELECTORS.inlineSource}`)).toBeNull();

    document.querySelector('#hh-faq-sections')!.innerHTML = `<div class="hh-faq-section"><div class="hh-faq-header"><h2>Overview of Mountain Project Features</h2></div><button class="hh-faq-q"><span class="hh-faq-qt">How do offline downloads work?</span></button><div class="hh-faq-a">First line.\nSecond line.<ul><li>Check your download.</li></ul><a href="/help">Read more</a></div></div>`;
    await flush(() => {
      const records = ledger.snapshot();
      return records.some((record) => record.source === 'How do offline downloads work?')
        && records.every((record) => record.status === 'translated');
    });
    expect(document.querySelector('.hh-faq-qt')?.textContent).toContain('한국어: How do offline downloads work?');
    expect(document.querySelector('.hh-faq-a')?.textContent).toContain('First line.\nSecond line.');
    expect(document.querySelector('.hh-faq-a ul > li')).not.toBeNull();
    controller.destroy();
    localizer.restore();
    expect(grid.innerHTML).toBe(gettingStartedCards);
    expect(Array.from(grid.querySelectorAll('a'))).toEqual(links);
  });

  it('localizes real split labels and modal states while preserving category values and editable fields', async () => {
    window.location.href = 'https://www.mountainproject.com/help-hub';
    document.body.innerHTML = helpHubControls;
    const original = document.body.innerHTML;
    const category = document.querySelector<HTMLSelectElement>('#hh-form-cat')!;
    category.value = 'Mobile App';
    const options = Array.from(category.options);
    const values = options.map((option) => option.value);
    const title = document.querySelector<HTMLInputElement>('#hh-form-title')!;
    const description = document.querySelector<HTMLTextAreaElement>('#hh-form-desc')!;
    const inputs = [title.value, description.value];
    const cta = document.querySelector<HTMLElement>('.hh-gs-cta-link')!;
    const switchTab = vi.fn();
    cta.onclick = () => switchTab('help');
    const click = vi.fn();
    cta.addEventListener('click', click);
    localizer = new DirectPageLocalizer();
    localizer.apply();
    await flush();

    expect(document.querySelector('[data-tab="wishlist"]')?.textContent).toBe('✶ 기능 제안');
    expect(document.querySelector('.hh-gs-cta-body')?.textContent).toBe('전체 주제를 둘러보거나 궁금한 내용을 검색하세요.');
    expect(document.querySelectorAll('.hh-form-label')[0]!.textContent).toBe('제목 *');
    expect(document.querySelectorAll('.hh-form-label')[1]!.textContent).toBe('설명 *');
    expect(document.querySelector('.hh-form-checkbox-label')?.textContent).toBe('주제 잠금 (커뮤니티 댓글 차단)');
    expect(document.querySelector('.hh-forum-notice p')?.textContent).toBe('기능 제안이 함께 게시되는 곳: Discuss MP 포럼.');
    expect(options.map((option) => option.label)).toEqual(['토포 및 루트 찾기', '모바일 앱', '기타']);
    expect(options.map((option) => option.value)).toEqual(values);
    expect(options.every((option) => !option.hasAttribute('value'))).toBe(true);
    expect(category.value).toBe('Mobile App');
    expect([title.value, description.value]).toEqual(inputs);
    expect(document.querySelector<HTMLInputElement>('#hh-wl-search')?.value).toBe('Newest');
    expect(document.querySelector('#hh-char-count')?.textContent).toBe('37');
    cta.click();
    expect(click).toHaveBeenCalledOnce();
    expect(switchTab).toHaveBeenCalledExactlyOnceWith('help');
    expect(cta.getAttribute('onclick')).toBe("switchTab('help')");

    document.querySelector('#hh-modal-title')!.textContent = 'Edit Feature Request';
    document.querySelector('#hh-btn-submit')!.textContent = 'Save Changes';
    document.querySelector('#hh-sort-label')!.textContent = 'Newest';
    title.value = 'My updated title';
    description.value = 'My updated body\nwith a second line.';
    // The site compares the button's textContent against an English category.
    document.querySelector('#hh-cat-label')!.textContent = 'Mobile App';
    document.querySelectorAll('.hh-cat-filter-opt').forEach((button) => {
      button.classList.toggle('active', button.textContent?.trim() === 'Mobile App');
    });
    await flush();
    expect(document.querySelector('#hh-modal-title')?.textContent).toBe('기능 제안 수정');
    expect(document.querySelector('#hh-btn-submit')?.textContent).toBe('변경사항 저장');
    expect(document.querySelector('#hh-sort-label')?.textContent).toBe('최신순');
    expect(document.querySelector('.hh-cat-filter-opt.active')?.textContent).toBe('모바일 앱');

    localizer.restore();
    expect(options.map((option) => option.value)).toEqual(values);
    expect(options.every((option) => !option.hasAttribute('label'))).toBe(true);
    expect(title.value).toBe('My updated title');
    expect(description.value).toBe('My updated body\nwith a second line.');
    expect(document.querySelector('#hh-modal-title')?.textContent).toBe('Edit Feature Request');
    // Restore the site's subsequent UI mutations before comparing the original markup.
    document.querySelector('#hh-modal-title')!.textContent = 'Submit a Feature Request';
    document.querySelector('#hh-btn-submit')!.textContent = 'Submit Request';
    document.querySelector('#hh-sort-label')!.textContent = 'Top Voted';
    document.querySelector('#hh-cat-label')!.textContent = 'All Categories';
    document.querySelectorAll('.hh-cat-filter-opt').forEach((button, index) => button.classList.toggle('active', index === 0));
    expect(document.body.innerHTML).toBe(original);
  });

  it('translates replaced requests with original/retry controls while preserving metadata, links and inputs', async () => {
    window.location.href = 'https://www.mountainproject.com/help-hub';
    document.body.innerHTML = helpHubControls;
    const engine = provider();
    const ledger = new TranslationLedger();
    controller = new PageTranslationController(
      engine, ledger, new MountainProjectPageAdapter(), new OriginalPreservingRenderer(),
    );
    localizer = new DirectPageLocalizer();
    await controller.start();
    localizer.apply();
    const list = document.querySelector('#hh-wishes-list')!;
    list.innerHTML = featureRequestCard;
    const originalCard = list.innerHTML;
    const protectedNodes = Array.from(list.querySelectorAll(HELP_SELECTORS.protectedFeatureRequestData));
    const protectedHtml = protectedNodes.map((element) => element.outerHTML);
    const vote = list.querySelector<HTMLButtonElement>('.hh-vote-btn')!;
    const voteMarkup = vote.outerHTML;
    const title = list.querySelector<HTMLElement>('.hh-wish-title')!;
    const description = list.querySelector<HTMLElement>('.hh-wish-desc')!;
    const link = description.querySelector('a')!;
    const descriptionHtml = description.innerHTML;
    // Never execute the site's vote/edit/delete handlers in this fixture.
    await flush(() => ledger.snapshot().filter((record) => record.status === 'translated').length === 2);
    expect(protectedNodes.map((element) => element.outerHTML)).toEqual(protectedHtml);
    expect(vote.outerHTML).toBe(voteMarkup);
    expect(list.querySelector('.hh-status-badge')?.textContent).toBe('진행 중');
    expect(list.querySelector('.hh-cat-badge')?.textContent).toBe('모바일 앱');
    expect(list.querySelector('.cmts')?.textContent).toBe('댓글 1개');
    expect(list.querySelector('.hh-mp-badge')?.textContent).toBe('MP 팀');
    expect(list.querySelector('.hh-wish-edit')?.getAttribute('title')).toBe('기능 제안 수정');
    expect(list.querySelector('.hh-wish-edit')?.getAttribute('onclick')).toBe('openEditModal(73)');
    expect(list.querySelector('.hh-view-thread')?.getAttribute('href')).toBe('https://www.mountainproject.com/forum/topic/73/example');
    expect(engine.translate).toHaveBeenCalledTimes(2);
    expect(list.querySelector('.mpkr-translation-body .hh-wish-title')?.textContent)
      .toBe('한국어: Feature Requests');
    expect(list.querySelector('.mpkr-translation-body .hh-wish-desc')?.textContent)
      .toContain('Newest\nKeep this submitted body and');
    expect(list.querySelector('.mpkr-translation-body .hh-wish-desc a')?.getAttribute('href')).toBe('/help');
    expect(description.querySelector('a')).toBe(link);
    expect(description.innerHTML).toBe(descriptionHtml);
    expect(title.style.display).toBe('none');
    expect(description.style.display).toBe('none');
    expect(list.querySelectorAll('.mpkr-original-toggle')).toHaveLength(2);
    expect(list.querySelectorAll('.mpkr-retranslate')).toHaveLength(2);

    const descriptionBlock = description.nextElementSibling!;
    const toggle = descriptionBlock.querySelector<HTMLButtonElement>('.mpkr-original-toggle')!;
    toggle.click();
    expect(description.style.display).toBe('');
    expect(description.innerHTML).toBe(descriptionHtml);
    toggle.click();
    expect(description.style.display).toBe('none');
    const retry = descriptionBlock.querySelector<HTMLButtonElement>('.mpkr-retranslate')!;
    retry.click();
    await flush(() => !retry.disabled);
    expect(engine.translate).toHaveBeenCalledTimes(3);
    expect(list.querySelectorAll('.mpkr-machine-translation')).toHaveLength(2);
    expect(document.querySelector<HTMLInputElement>('#hh-form-title')?.value).toBe('Feature Requests');
    expect(document.querySelector<HTMLTextAreaElement>('#hh-form-desc')?.value)
      .toBe('Newest\nKeep my submitted description.');

    list.innerHTML = '<div class="hh-empty-state"><h3>No requests match your filters</h3><p>Try adjusting or clearing your filters.</p></div>';
    await flush();
    expect(list.querySelector('h3')?.textContent).toBe('필터와 일치하는 제안이 없습니다');
    expect(list.querySelector('p')?.textContent).toBe('필터를 조정하거나 초기화해 보세요.');
    list.innerHTML = featureRequestCard;
    await flush(() => list.querySelectorAll('.mpkr-machine-translation').length === 2);
    expect(Array.from(list.querySelectorAll(HELP_SELECTORS.protectedFeatureRequestData)).map((el) => el.outerHTML)).toEqual(protectedHtml);
    expect(engine.translate).toHaveBeenCalledTimes(3);
    localizer.apply();
    await flush();
    expect(list.querySelectorAll('.mpkr-machine-translation')).toHaveLength(2);
    expect(list.querySelector('.mpkr-machine-translation .mpkr-machine-translation')).toBeNull();
    expect(engine.translate).toHaveBeenCalledTimes(3);
    controller.destroy();
    localizer.restore();
    expect(list.innerHTML).toBe(originalCard);
  });

  it('translates dynamic result messages and request notifications without changing quoted search input', async () => {
    window.location.href = 'https://www.mountainproject.com/help-hub';
    document.body.innerHTML = helpHubControls;
    localizer = new DirectPageLocalizer();
    localizer.apply();
    const toast = document.querySelector('.hh-toast-msg')!;
    const notifications = [
      ['Your request has been submitted!', '기능 제안이 등록되었습니다!'],
      ['Your request has been updated!', '기능 제안이 수정되었습니다!'],
      ['Failed to submit request. Please try again.', '기능 제안을 등록하지 못했습니다. 다시 시도해 주세요.'],
      ['Feature request deleted.', '기능 제안이 삭제되었습니다.'],
      ['Could not delete request. Please try again.', '기능 제안을 삭제하지 못했습니다. 다시 시도해 주세요.'],
      ['Status updated to "Planned"', '상태가 "계획됨"(으)로 변경되었습니다'],
      ['Category updated to "Mobile App"', '카테고리가 "모바일 앱"(으)로 변경되었습니다'],
    ] as const;
    for (const [source, translated] of notifications) {
      toast.textContent = source;
      await flush();
      expect(toast.textContent).toBe(translated);
    }
    const list = document.querySelector('#hh-wishes-list')!;
    list.innerHTML = '<p class="hh-results-label">0 results for "Newest"</p><div class="hh-empty-state"><h3>No results found</h3><p>Try different keywords, or <a href="mailto:support@mountainproject.com">contact support</a>.</p></div>';
    await flush();
    expect(list.querySelector('.hh-results-label')?.textContent).toBe('"Newest" 검색 결과 0개');
    expect(list.querySelector('.hh-empty-state p')?.textContent).toBe('다른 검색어를 입력하거나 고객 지원에 문의하세요.');
    expect(list.querySelector('a')?.getAttribute('href')).toBe('mailto:support@mountainproject.com');
    expect(translateHelpUi('An unknown request title')).toBeUndefined();
  });

  it('restores implicit option labels and respects site replacements without changing submitted values', () => {
    document.body.innerHTML = '<main id="help-hub-page"><select id="hh-form-cat"><option>Mobile App</option><option label="Other">Other</option></select></main>';
    const helper = new HelpHubLocalizer();
    const options = Array.from(document.querySelectorAll('option'));
    helper.apply(document);
    helper.apply(document);
    expect(options.map((option) => option.label)).toEqual(['모바일 앱', '기타']);
    expect(options.map((option) => option.value)).toEqual(['Mobile App', 'Other']);
    options[0]!.textContent = 'Account';
    helper.apply(options[0]!);
    expect(options[0]!.label).toBe('계정');
    expect(options[0]!.value).toBe('Account');
    options[1]!.label = 'Site supplied category';
    helper.restore();
    expect(options[0]!.hasAttribute('label')).toBe(false);
    expect(options[1]!.label).toBe('Site supplied category');
  });
});
