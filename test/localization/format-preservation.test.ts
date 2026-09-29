import type { TranslationProvider, TranslationRequest } from '@/core/translation-provider';
import { TranslationLedger } from '@/core/translation-record';
import { PageTranslationController } from '@/localization/page-translation-controller';
import { OriginalPreservingRenderer } from '@/rendering/original-preserving-renderer';
import { MountainProjectPageAdapter } from '@/sites/mountain-project/dom/page-adapter';
import { MountainProjectTranslationPolicy } from '@/sites/mountain-project/translation/mountain-project-translation-policy';
import { BRYAN_HYLENSKI_COMMENT_HTML } from '../fixtures/mountain-project/bryan-hylenski-comment';

class FormatProvider implements TranslationProvider {
  readonly id = 'format-provider';
  readonly requests: TranslationRequest[] = [];
  availability = async () => 'available' as const;
  constructor(private readonly transform: (text: string) => string = (text) => `번역 ${text}`) {}
  async translate(request: TranslationRequest): Promise<string> {
    this.requests.push(request);
    return this.transform(request.text);
  }
}

function createController(provider: TranslationProvider, pageKind: string) {
  return new PageTranslationController(
    provider,
    new TranslationLedger(),
    new MountainProjectPageAdapter(),
    new OriginalPreservingRenderer(),
    { pageKind, textPolicy: new MountainProjectTranslationPolicy() },
  );
}

describe('global authored-format preservation', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', undefined);
    document.head.innerHTML = '<base href="https://www.mountainproject.com/">';
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    ['Area', 'climb-area-page', 'area'],
    ['Route', 'route-page', 'route'],
  ])('preserves %s paragraphs, nested lists, links, emphasis, breaks, and icon order', async (_, rootId, pageKind) => {
    document.body.innerHTML = `
      <main id="${rootId}"><section><h2>Description</h2><div class="fr-view">
        <p class="copy" style="color:red">Line one<br>Line two <strong>Bold</strong>
          <em>Emphasis</em> <a id="unsafe-id" href="/route/1/example" onclick="return false" data-track="x">Open</a>
          <img class="inline-icon" src="/img/camera.svg" alt="camera" onerror="bad()"><script>bad()</script></p>
        <ol class="steps" start="3"><li value="5">Parent<ul class="children"><li>Child</li></ul></li></ol>
      </div></section></main>`;
    const originalAnchor = document.querySelector<HTMLAnchorElement>('#unsafe-id')!;
    const originalClick = vi.fn();
    originalAnchor.addEventListener('click', originalClick);
    const provider = new FormatProvider((text) => text
      .replace('Line one', '첫째 줄')
      .replace('Line two', '둘째 줄')
      .replace('Bold', '굵게')
      .replace('Emphasis', '강조')
      .replace('Open', '열기')
      .replace('Parent', '상위')
      .replace('Child', '하위'));
    const controller = createController(provider, pageKind);

    await controller.start();
    const copy = document.querySelector<HTMLElement>('.mpkr-translation-body .copy')!;
    expect(copy.childNodes[1]?.nodeName).toBe('BR');
    expect(copy.querySelector('strong')?.textContent).toBe('굵게');
    expect(copy.querySelector('em')?.textContent).toBe('강조');
    const anchor = copy.querySelector<HTMLAnchorElement>('a')!;
    expect(anchor.getAttribute('href')).toBe('/route/1/example');
    expect(anchor.hasAttribute('onclick')).toBe(false);
    expect(anchor.hasAttribute('data-track')).toBe(false);
    expect(anchor.hasAttribute('id')).toBe(false);
    expect(copy.hasAttribute('style')).toBe(false);
    expect(copy.querySelector('script')).toBeNull();
    expect(copy.querySelector('img.inline-icon')?.nextSibling).toBeNull();
    expect(copy.querySelector('img')?.hasAttribute('onerror')).toBe(false);
    anchor.click();
    expect(originalClick).toHaveBeenCalledOnce();

    const list = document.querySelector<HTMLOListElement>('.mpkr-translation-body ol.steps')!;
    expect(list.getAttribute('start')).toBe('3');
    expect(list.firstElementChild?.getAttribute('value')).toBe('5');
    expect(list.querySelector('ul.children > li')?.textContent).toContain('하위');
    controller.destroy();
  });

  it('preserves comment and photo link formatting without touching metadata', async () => {
    document.body.innerHTML = `
      <div id="photo-popup-body"><div class="photo-core">
        <div class="photo-caption">Photo <a href="/photo/1"><strong>caption</strong></a><br>next line</div>
      </div></div>
      <div class="comment-list"><div class="comment-body">
        <span id="1-full">Comment <strong>bold</strong><br><a href="/route/1">route link</a></span>
        <time datetime="2026-09-28">Sep 28, 2026</time>
      </div></div>`;
    const controller = createController(new FormatProvider((text) => text
      .replace('Photo', '사진')
      .replace('caption', '설명')
      .replace('next line', '다음 줄')
      .replace('Comment', '댓글')
      .replace('bold', '강조')
      .replace('route link', '루트 링크')), 'photo');

    await controller.start();

    const rendered = Array.from(document.querySelectorAll<HTMLElement>('.mpkr-translation-body'));
    expect(rendered.some((body) => body.querySelector('a[href="/photo/1"] strong')?.textContent === '설명')).toBe(true);
    expect(rendered.some((body) => body.querySelector('a[href="/route/1"]')?.textContent === '루트 링크')).toBe(true);
    expect(rendered.every((body) => body.querySelector('br') !== null)).toBe(true);
    expect(document.querySelector('time')?.textContent).toBe('Sep 28, 2026');
    controller.destroy();
  });

  it('translates a synthetic long comment by original blank-line paragraphs', async () => {
    document.body.innerHTML = `<div class="comment-list">${BRYAN_HYLENSKI_COMMENT_HTML}</div>`;
    const provider = new FormatProvider((text) => text
      .replace('The imaginary training hall contains three colored rooms', '가상의 연습장에는 색깔이 다른 방 세 개가 있습니다')
      .replace('For the sample diagram', '샘플 도식은')
      .replace('this fictional room diagram', '이 가상 방 도식')
      .replace('At the end of the exercise', '연습이 끝나면'));
    const controller = createController(provider, 'area');

    await controller.start();

    expect(provider.requests).toHaveLength(3);
    expect(provider.requests.every(({ text }) => !/MPKRDOM_[A-Z0-9]+_V_\d+\s*MPKRDOM_/u.test(text))).toBe(true);
    const translated = document.querySelector<HTMLElement>('.mpkr-translation-body > span')!;
    expect(translated.textContent).toContain('가상의 연습장에는 색깔이 다른 방 세 개가 있습니다');
    expect(translated.textContent).toContain('샘플 도식은');
    expect(translated.textContent).toContain('연습이 끝나면');
    expect(translated.querySelectorAll('br')).toHaveLength(4);
    expect(translated.querySelector<HTMLAnchorElement>('a')?.href)
      .toBe('https://example.com/fixture-diagram');
    expect(translated.querySelector('a')?.textContent).toBe('이 가상 방 도식');
    expect(document.getElementById('900000401-full')?.style.display).toBe('none');
    controller.destroy();
  });

  it.each(['area', 'route'])('recovers %s prose with corrupted break markers using original lines', async (pageKind) => {
    document.body.innerHTML = `<section><h2>Description</h2><div class="fr-view">
      <p id="source">First sentence.<br>Second sentence.<br><br>Third sentence with <a href="https://example.com/diagram">a diagram</a>.<br>Fourth sentence: author@example.com.</p>
    </div></section>`;
    const source = document.querySelector<HTMLElement>('#source')!;
    const originalNodes = Array.from(source.childNodes);
    const originalText = source.textContent;
    const provider = new FormatProvider((text) => {
      if (text.includes('First sentence.') && text.includes('Second sentence.')) {
        return text.replace(/ZXQX*\d+QXZ/u, '');
      }
      return text.replace('First sentence.', '첫 문장.')
        .replace('Second sentence.', '둘째 문장.')
        .replace('Third sentence with', '셋째 문장과')
        .replace('a diagram', '도식')
        .replace('Fourth sentence:', '넷째 문장:');
    });
    const controller = createController(provider, pageKind);
    try {
      await controller.start();

      expect(provider.requests).toHaveLength(5);
      const copy = document.querySelector('.mpkr-translation-body p')!;
      expect(copy.textContent).toBe('첫 문장.둘째 문장.셋째 문장과 도식.넷째 문장: author@example.com.');
      expect(copy.querySelectorAll('br')).toHaveLength(4);
      expect(copy.querySelector('a')?.getAttribute('href')).toBe('https://example.com/diagram');
      expect(document.querySelector<HTMLElement>('.mpkr-translation-status')?.hidden).toBe(true);
      expect(source.style.display).toBe('none');
      document.querySelector<HTMLButtonElement>('.mpkr-original-toggle')!.click();
      expect(source.style.display).toBe('');
    } finally {
      controller.destroy();
    }
    expect(source.textContent).toBe(originalText);
    expect(Array.from(source.childNodes)).toEqual(originalNodes);
    expect(document.querySelector('.mpkr-machine-translation')).toBeNull();
  });

  it('keeps the entire original when line recovery still damages a protected email', async () => {
    document.body.innerHTML = `<section><h2>Description</h2><div class="fr-view">
      <p id="source">First sentence.<br>Second sentence.<br>Contact author@example.com.</p>
    </div></section>`;
    const provider = new FormatProvider((text) => text.includes('First sentence.') && text.includes('Second sentence.')
      || text.includes('Contact')
      ? text.replace(/ZXQX*\d+QXZ/u, '')
      : `번역 ${text}`);
    const controller = createController(provider, 'area');
    try {
      await controller.start();
      expect(provider.requests).toHaveLength(4);
      expect(document.querySelector<HTMLElement>('#source')?.style.display).toBe('');
      expect(document.querySelector('.mpkr-translation-body')?.textContent).toBe('');
      expect(document.querySelector<HTMLElement>('.mpkr-translation-status')?.hidden).toBe(true);
    } finally {
      controller.destroy();
    }
  });

  it('does not split a damaged break inside a link for recovery', async () => {
    document.body.innerHTML = `<section><h2>Description</h2><div class="fr-view">
      <p id="source"><a href="https://example.com/diagram">First sentence.<br>Second sentence.</a></p>
    </div></section>`;
    const provider = new FormatProvider((text) => text.replace(/ZXQX*\d+QXZ/u, ''));
    const controller = createController(provider, 'area');
    try {
      await controller.start();
      expect(provider.requests).toHaveLength(1);
      expect(document.querySelector<HTMLElement>('#source')?.style.display).toBe('');
      expect(document.querySelector<HTMLElement>('.mpkr-translation-status')?.hidden).toBe(true);
    } finally {
      controller.destroy();
    }
  });

  it('keeps separated stats tick text runs on their original sides of an inline icon', async () => {
    document.body.innerHTML = `<div id="route-stats"><div class="onx-stats-table"><table><tbody>
      <tr id="ticks.1"><td><a href="/user/1">User</a></td><td><div class="small"><div id="details"><strong>Sep 28, 2026</strong> First note <img id="tick-icon" src="/img/x.svg"> Second note</div></div></td></tr>
    </tbody></table></div></div>`;
    const before = document.body.innerHTML;
    const provider = new FormatProvider((text) => text.replace('First note', '첫 메모').replace('Second note', '둘째 메모'));
    const controller = createController(provider, 'route-stats');

    await controller.start();

    expect(provider.requests.map(({ text }) => text)).toEqual([' First note ', ' Second note']);
    const icon = document.querySelector('#tick-icon')!;
    const translations = Array.from(document.querySelectorAll<HTMLElement>('#details > .mpkr-machine-translation'));
    expect(translations).toHaveLength(2);
    expect(translations[0]!.compareDocumentPosition(icon) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(icon.compareDocumentPosition(translations[1]!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    controller.destroy();
    expect(document.body.innerHTML).toBe(before);
  });

  it('preserves forum block, pre newlines, code, and nested list structure', async () => {
    document.body.innerHTML = `<table id="forum-table"><tbody><tr class="message-row"><td>
      <div class="bio"><a href="/user/1">Alex</a></div>
      <div class="fr-view"><blockquote><p>Quoted line</p></blockquote><pre>first line\n  second line</pre>
        <p>Use <code>git status</code> safely.</p><ul class="forum-list"><li>Parent<ul><li>Child</li></ul></li></ul>
        <div class="signature">Original signature</div></div>
    </td></tr></tbody></table>`;
    const provider = new FormatProvider((text) => text
      .replace('Quoted line', '인용문')
      .replace('first line', '첫 줄')
      .replace('second line', '둘째 줄')
      .replace('Parent', '상위')
      .replace('Child', '하위'));
    const ledger = new TranslationLedger();
    const controller = new PageTranslationController(
      provider, ledger, new MountainProjectPageAdapter(), new OriginalPreservingRenderer(),
      { pageKind: 'forum-topic', textPolicy: new MountainProjectTranslationPolicy() },
    );

    await controller.start();

    expect(ledger.snapshot()).toEqual([
      expect.objectContaining({ status: 'translated' }),
    ]);
    const copy = document.querySelector<HTMLElement>('.mpkr-translation-body > .fr-view')!;
    expect(copy.querySelector('blockquote p')?.textContent).toBe('인용문');
    expect(copy.querySelector('pre')?.textContent).toBe('첫 줄\n  둘째 줄');
    expect(copy.querySelector('code')?.textContent).toBe('git status');
    expect(copy.querySelector('.forum-list > li > ul > li')?.textContent).toContain('하위');
    expect(copy.querySelector('.signature')?.textContent).toBe('Original signature');
    controller.destroy();
  });

  it('leaves the original visible when structural placeholders keep count but break nesting', async () => {
    document.body.innerHTML = '<main id="route-page"><section><h2>Description</h2><div class="fr-view"><p id="source"><strong>Bold text</strong></p></div></section></main>';
    const provider = new FormatProvider((text) => {
      const tokens = text.match(/ZXQX*\d+QXZ/gu) ?? [];
      if (tokens.length < 2) return text;
      return text.replace(tokens[0]!, '__SWAP__').replace(tokens[1]!, tokens[0]!).replace('__SWAP__', tokens[1]!);
    });
    const ledger = new TranslationLedger();
    const controller = new PageTranslationController(
      provider, ledger, new MountainProjectPageAdapter(), new OriginalPreservingRenderer(),
      { pageKind: 'route', textPolicy: new MountainProjectTranslationPolicy() },
    );

    await controller.start();

    expect(ledger.snapshot()[0]).toMatchObject({ status: 'preserved' });
    expect(document.querySelector<HTMLElement>('#source')?.style.display).toBe('');
    expect(document.querySelector<HTMLElement>('.mpkr-translation-status')?.hidden).toBe(true);
    expect(document.querySelector<HTMLButtonElement>('.mpkr-original-toggle')?.hidden).toBe(true);
    expect(document.querySelector('.mpkr-retranslate')).not.toBeNull();
    controller.destroy();
  });

  it('keeps the previous structured translation when retranslation breaks nesting', async () => {
    document.body.innerHTML = '<section><h2>Description</h2><div class="fr-view"><p id="source"><strong>Bold text</strong></p></div></section>';
    let corrupt = false;
    const provider = new FormatProvider((text) => {
      const translated = text.replace('Bold text', '굵은 글씨');
      if (!corrupt) return translated;
      const tokens = translated.match(/ZXQX*\d+QXZ/gu)!;
      return translated.replace(tokens[0]!, '__SWAP__').replace(tokens[1]!, tokens[0]!).replace('__SWAP__', tokens[1]!);
    });
    const ledger = new TranslationLedger();
    const controller = new PageTranslationController(provider, ledger,
      new MountainProjectPageAdapter(), new OriginalPreservingRenderer(),
      { pageKind: 'route', textPolicy: new MountainProjectTranslationPolicy() });
    try {
      await controller.start();
      const copy = document.querySelector('.mpkr-translation-body p')!;
      const record = ledger.snapshot()[0]!;
      corrupt = true;

      expect(await controller.retranslate([record.id])).toBe('preserved');
      expect(copy.isConnected).toBe(true);
      expect(copy.querySelector('strong')?.textContent).toBe('굵은 글씨');
      expect(ledger.get(record.id)).toEqual(record);
      expect(document.querySelector<HTMLElement>('#source')?.style.display).toBe('none');
      document.querySelector<HTMLButtonElement>('.mpkr-original-toggle')!.click();
      expect(document.querySelector<HTMLElement>('#source')?.style.display).toBe('');
      expect(document.querySelector('#source strong')?.textContent).toBe('Bold text');
    } finally {
      controller.destroy();
    }
  });
});
