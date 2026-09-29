import { TranslationLedger } from '@/core/translation-record';
import { PageTranslationController } from '@/localization/page-translation-controller';
import { OriginalPreservingRenderer } from '@/rendering/original-preserving-renderer';
import { MountainProjectPageAdapter } from '@/sites/mountain-project/dom/page-adapter';

const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

function post(body: string, id = 'post'): string {
  return `<tr class="message-row" id="${id}"><td>
    <div class="bio"><a href="/user/900000001/fixture-author">Fixture Author</a>
      <span class="text-warm">Sep 28, 2026</span></div>
    <div class="fr-view" style="display: block">${body}</div>
  </td></tr>`;
}

function forum(body: string): void {
  document.body.innerHTML = `<table id="forum-table"><tbody>${body}</tbody></table>`;
}

function appendPost(body: string, id: string): void {
  // Use a real table row: happy-dom drops <tr> in tbody.insertAdjacentHTML.
  const table = document.createElement('table');
  table.innerHTML = `<tbody>${post(body, id)}</tbody>`;
  document.querySelector('#forum-table tbody')!.append(table.querySelector('tr')!);
}

describe('forum authored targets', () => {
  let adapter: MountainProjectPageAdapter;
  let renderer: OriginalPreservingRenderer;
  let controller: PageTranslationController | undefined;

  beforeEach(() => {
    document.head.innerHTML = '<base href="https://www.mountainproject.com/">';
    document.body.innerHTML = '';
    vi.stubGlobal('IntersectionObserver', undefined);
    adapter = new MountainProjectPageAdapter();
    renderer = new OriginalPreservingRenderer();
  });

  afterEach(() => {
    controller?.destroy();
    controller = undefined;
    renderer.destroy();
    adapter.restore();
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('rescans only the original after structured rendering, including scoped roots', () => {
    forum(post('<p>Original climbing advice from Example Crag.</p>'));
    const source = document.querySelector<HTMLElement>('#post .fr-view')!;
    const target = adapter.collectCommentTargets()[0]!;
    renderer.render(target, target.source.replace('Original climbing advice', '원래 등반 조언'));
    const copy = document.querySelector<HTMLElement>('.mpkr-translation-body .fr-view')!;
    expect(copy.textContent).toContain('Example Crag');

    for (const root of [document, document.querySelector('#forum-table')!, source.parentElement!, source]) {
      const rescanned = adapter.collectCommentTargets(root);
      expect(rescanned, root instanceof Element ? root.outerHTML : document.body.innerHTML).toHaveLength(1);
      expect(rescanned[0]?.id).toBe(target.id);
      expect(rescanned[0]?.sourceElements).toEqual([source]);
      expect(rescanned[0]?.semanticSource).toBe('Original climbing advice from Example Crag.');
      expect(rescanned[0]?.source).toBe(target.source);
    }
    expect(adapter.collectCommentTargets(copy)).toEqual([]);
    expect(adapter.collectCommentTargets(copy.parentElement!)).toEqual([]);
  });

  it('collects nested quote markup once and keeps source nodes, links, authors and signatures', () => {
    forum(post(`<p>Original climbing advice <a href="/route/900000001/example" onclick="return false">Example Route</a>.</p>
      <blockquote><cite>Fixture Quoted Author</cite><div class="fr-view"><p>Quoted climbing advice.</p></div></blockquote>
      <pre><code>const rope = 60;</code></pre><div class="signature">Fixture signature</div>`));
    const source = document.querySelector<HTMLElement>('#post .fr-view')!;
    const originalNodes = [...source.childNodes];
    const originalHtml = source.innerHTML;
    const author = document.querySelector('.bio')!;
    const authorText = author.textContent;
    const link = source.querySelector<HTMLAnchorElement>('a')!;
    const clicked = vi.fn();
    link.addEventListener('click', (event) => { event.preventDefault(); clicked(); });
    const targets = adapter.collectCommentTargets();
    expect(targets).toHaveLength(1);
    expect(targets[0]?.source).not.toContain('Fixture Quoted Author');
    expect(targets[0]?.source).not.toContain('Fixture signature');
    expect(targets[0]?.source).not.toContain('const rope = 60;');
    expect(adapter.collectCommentTargets(source.querySelector('.fr-view')!)).toEqual([]);

    renderer.render(targets[0]!, targets[0]!.source
      .replace('Original climbing advice', '원래 등반 조언')
      .replace('Quoted climbing advice.', '인용된 등반 조언.'));
    const copy = document.querySelector('.mpkr-translation-body')!;
    expect(copy.querySelector('blockquote')?.textContent).toContain('인용된 등반 조언.');
    expect(copy.querySelector('.signature')?.textContent).toBe('Fixture signature');
    expect(copy.querySelector('code')?.textContent).toBe('const rope = 60;');
    expect(copy.querySelector('a')?.getAttribute('href')).toBe('/route/900000001/example');
    copy.querySelector<HTMLAnchorElement>('a')!.click();
    expect(clicked).toHaveBeenCalledOnce();
    expect(adapter.collectCommentTargets()).toHaveLength(1);

    document.querySelector<HTMLButtonElement>('.mpkr-original-toggle')!.click();
    expect(source.style.display).toBe('block');
    expect(source.innerHTML).toBe(originalHtml);
    expect([...source.childNodes]).toEqual(originalNodes);
    renderer.destroy();
    expect(author.textContent).toBe(authorText);
    expect(source.innerHTML).toBe(originalHtml);
    expect([...source.childNodes]).toEqual(originalNodes);
  });

  it('routes changes inside nested quote markup to the enclosing original post', () => {
    forum(post('<p>Original post.</p><blockquote><div class="fr-view"><p>Original quoted advice.</p></div></blockquote>'));
    const source = document.querySelector<HTMLElement>('#post .fr-view')!;
    const target = adapter.collectCommentTargets()[0]!;
    renderer.render(target, target.source);
    const observer = new MutationObserver(() => {});
    observer.observe(source, { childList: true, characterData: true, subtree: true });
    source.querySelector('blockquote p')!.textContent = 'Changed quoted advice.';
    const mutations = observer.takeRecords();
    observer.disconnect();

    const roots = adapter.mutationRoots(mutations);
    expect(roots).toEqual([source.parentElement]);
    const updated = roots.flatMap((root) => adapter.collectCommentTargets(root));
    expect(updated).toHaveLength(1);
    expect(updated[0]?.id).toBe(target.id);
    expect(updated[0]?.semanticSource).toContain('Changed quoted advice.');
    expect(updated[0]?.semanticSource).not.toContain('Original quoted advice.');
    expect(updated[0]?.sourceElements).toEqual([source]);
  });

  it('ignores editor roots and drafts inside a published post', () => {
    forum(post('<p>Published climbing advice.</p><div contenteditable="true"><div class="fr-view">Private nested draft.</div></div>')
      + post('<p>Private editable draft.</p>', 'editor')
      + post('<p>Private plaintext draft.</p>', 'plaintext')
      + post('<form><div class="fr-view">Private form draft.</div></form>', 'form-editor'));
    document.querySelector('#editor > td')!.setAttribute('contenteditable', 'true');
    document.querySelector('#plaintext .fr-view')!.setAttribute('contenteditable', 'plaintext-only');
    const targets = adapter.collectCommentTargets();
    expect(targets).toHaveLength(1);
    expect(targets[0]?.semanticSource).toBe('Published climbing advice.');
    expect(targets[0]?.source).not.toContain('Private');
    expect(document.querySelector('[contenteditable="true"]')?.textContent).toContain('Private');
  });

  it('updates one post, appends one reply and retranslates current originals without collecting copies', async () => {
    forum(post('<p>Original climbing advice.</p><blockquote><div class="fr-view"><p>Original quoted advice.</p></div></blockquote>'));
    const source = document.querySelector<HTMLElement>('#post .fr-view')!;
    const translate = vi.fn(async ({ text }: { text: string }) => text
      .replaceAll('Original climbing advice.', '원래 등반 조언.')
      .replaceAll('Original quoted advice.', '원래 인용 조언.')
      .replaceAll('Changed quoted advice.', '변경된 인용 조언.')
      .replaceAll('New reply advice.', '새 답글 조언.'));
    const ledger = new TranslationLedger();
    controller = new PageTranslationController(
      { id: 'forum-fixture', availability: async () => 'available', translate },
      ledger, adapter, renderer, { pageKind: 'forum-topic' },
    );
    await controller.start();
    await flush();
    expect(translate).toHaveBeenCalledTimes(1);

    source.querySelector('blockquote p')!.textContent = 'Changed quoted advice.';
    await flush();
    await flush();
    expect(translate).toHaveBeenCalledTimes(2);
    expect(document.querySelectorAll('.mpkr-machine-translation')).toHaveLength(1);
    expect(document.querySelector('.mpkr-translation-body')?.textContent).toContain('변경된 인용 조언.');

    appendPost('<p>New reply advice.</p>', 'reply');
    await flush();
    await flush();
    expect(translate).toHaveBeenCalledTimes(3);
    expect(document.querySelectorAll('.mpkr-machine-translation')).toHaveLength(2);
    const targets = adapter.collectCommentTargets();
    expect(targets).toHaveLength(2);
    expect(new Set(targets.map((target) => target.id)).size).toBe(2);
    expect(ledger.snapshot()).toHaveLength(2);

    await controller.retranslate([targets[0]!.id]);
    await flush();
    expect(translate).toHaveBeenCalledTimes(4);
    expect(translate.mock.lastCall?.[0].text).toContain('Changed quoted advice.');
    expect(translate.mock.lastCall?.[0].text).not.toContain('변경된 인용 조언.');
    expect(document.querySelectorAll('.mpkr-machine-translation')).toHaveLength(2);
    expect(document.querySelectorAll('.mpkr-original-toggle-host')).toHaveLength(2);
    controller.destroy();
    expect(source.textContent).toContain('Changed quoted advice.');
    expect(document.querySelectorAll('.mpkr-machine-translation')).toHaveLength(0);
  });

  it('translates a topic title with inline controls while preserving its original nodes', () => {
    document.body.innerHTML = '<div id="topic-guts"><h1>Climbing <em>partner</em> wanted</h1></div>';
    const heading = document.querySelector('h1')!;
    const originalNodes = [...heading.childNodes];
    const target = adapter.collectPageTargets()[0]!;
    expect(target.semanticSource).toBe('Climbing partner wanted');
    expect(target.renderMode).toBe('inline-copy');
    renderer.render(target, target.source.replace('Climbing', '등반').replace('partner', '파트너').replace('wanted', '구함'));
    expect(heading.querySelector('.mpkr-translation-body')?.textContent).toBe('등반 파트너 구함');
    expect(heading.querySelector('.mpkr-original-toggle')).not.toBeNull();
    expect(adapter.collectPageTargets()).toHaveLength(1);
    expect(adapter.collectPageTargets()[0]?.source).toBe(target.source);
    heading.querySelector<HTMLButtonElement>('.mpkr-original-toggle')!.click();
    expect(target.sourceElements[0]?.style.display).toBe('');
    renderer.destroy();
    adapter.restore();
    expect([...heading.childNodes]).toEqual(originalNodes);
    expect(heading.innerHTML).toBe('Climbing <em>partner</em> wanted');
  });

  it('translates listing titles with working links and leaves author and section links alone', () => {
    forum(`<tr><td><a class="topic" href="/forum/topic/123/example?page=2" onclick="return false"><strong>Climbing partner wanted</strong></a>
      <a href="/user/123/author">Fixture Author</a><a href="/forum/123/section">Section title</a></td></tr>`);
    const link = document.querySelector<HTMLAnchorElement>('a.topic')!;
    const originalNodes = [...link.childNodes];
    const clicked = vi.fn();
    link.addEventListener('click', (event) => { event.preventDefault(); clicked(); });
    const target = adapter.collectPageTargets()[0]!;
    expect(adapter.collectPageTargets()).toHaveLength(1);
    renderer.render(target, target.source.replace('Climbing partner wanted', '등반 파트너 구함'));
    const copy = document.querySelector<HTMLAnchorElement>('.mpkr-translation-body a')!;
    expect(copy.getAttribute('href')).toBe('/forum/topic/123/example?page=2');
    expect(copy.textContent).toBe('등반 파트너 구함');
    expect(copy.querySelector('button')).toBeNull();
    copy.click();
    expect(clicked).toHaveBeenCalledOnce();
    expect(document.querySelector('a[href*="/user/"]')?.textContent).toBe('Fixture Author');
    expect(adapter.collectPageTargets()).toHaveLength(1);
    expect(adapter.collectPageTargets()[0]?.source).toBe(target.source);
    link.setAttribute('href', '/forum/topic/123/updated?page=3');
    const updated = adapter.collectPageTargets()[0]!;
    expect(updated.id).toBe(target.id);
    expect(updated.source).not.toBe(target.source);
    renderer.reset(updated);
    renderer.render(updated, updated.source.replace('Climbing partner wanted', '등반 파트너 구함'));
    expect(document.querySelector('.mpkr-translation-body a')?.getAttribute('href')).toBe('/forum/topic/123/updated?page=3');
    renderer.destroy();
    expect([...link.childNodes]).toEqual(originalNodes);
  });

  it('observes title changes and additions and retranslates originals only once', async () => {
    document.body.innerHTML = `<div id="topic-guts"><h1>Original topic title</h1></div>
      <table id="forum-table"><tbody><tr><td><a href="/forum/topic/123/example"><strong>Original listing title</strong></a></td></tr></tbody></table>`;
    const translate = vi.fn(async ({ text }: { text: string }) => text.replace('Original', '원래').replace('Updated', '수정').replace('New', '새'));
    controller = new PageTranslationController(
      { id: 'forum-title-fixture', availability: async () => 'available', translate },
      new TranslationLedger(), adapter, renderer, { pageKind: 'forum' },
    );
    await controller.start();
    await flush();
    expect(translate).toHaveBeenCalledTimes(2);
    const titleSource = document.querySelector<HTMLElement>('#topic-guts h1 > .mpkr-forum-title-source')!;
    titleSource.firstChild!.nodeValue = 'Updated topic title';
    await flush();
    await flush();
    expect(translate).toHaveBeenCalledTimes(3);
    const cell = document.createElement('td');
    cell.innerHTML = '<a href="/forum/topic/456/example">New listing title</a>';
    document.querySelector('#forum-table tbody tr')!.append(cell);
    await flush();
    await flush();
    expect(translate).toHaveBeenCalledTimes(4);
    expect(adapter.collectPageTargets()).toHaveLength(3);
    const title = adapter.collectPageTargets().find((target) => target.sourceElements[0] === titleSource)!;
    await controller.retranslate([title.id]);
    await flush();
    expect(translate).toHaveBeenCalledTimes(5);
    expect(translate.mock.lastCall?.[0].text).toContain('Updated topic title');
    expect(translate.mock.lastCall?.[0].text).not.toContain('수정');
    expect(document.querySelectorAll('.mpkr-machine-translation')).toHaveLength(3);
  });

  it('keeps search card metadata and links intact while translating only the forum heading', () => {
    document.body.innerHTML = `<div id="onx-search">
      <a href="/forum/topic/123/example"><h3>Original <strong>forum title</strong></h3><p>By: Fixture Author | Sep 29, 2026</p><p>Original search excerpt.</p></a>
      <a href="/route/456/example"><h3>Original route title</h3></a>
      <a href="/user/789/example"><h3>Original user name</h3></a>
      <a href="https://example.com/forum/topic/123/example"><h3>External title</h3></a></div>`;
    const link = document.querySelector<HTMLAnchorElement>('#onx-search > a')!;
    const nodes = [...link.childNodes];
    const metadata = link.querySelector('p')!;
    const clicked = vi.fn();
    link.addEventListener('click', (event) => { event.preventDefault(); clicked(); });
    const original = adapter.collectPageTargets();
    expect(original.map((target) => target.semanticSource)).toEqual(['Original forum title']);
    const target = original[0]!;
    expect(target.source).not.toMatch(/Fixture Author|Sep 29|search excerpt/);
    renderer.render(target, target.source.replace('Original', '원래').replace('forum title', '포럼 제목'));
    expect(adapter.collectPageTargets()[0]?.source).toBe(target.source);
    expect(link.querySelector('.mpkr-translation-body h3')?.textContent).toBe('원래 포럼 제목');
    expect(link.querySelector('button')).toBeNull();
    expect(link.nextElementSibling?.matches('.mpkr-original-toggle-host')).toBe(true);
    expect(metadata.textContent).toBe('By: Fixture Author | Sep 29, 2026');
    link.querySelector<HTMLElement>('.mpkr-translation-body h3')!.click();
    expect(clicked).toHaveBeenCalledOnce();
    link.nextElementSibling!.querySelector<HTMLButtonElement>('.mpkr-original-toggle')!.click();
    expect(clicked).toHaveBeenCalledOnce();
    link.setAttribute('href', '/forum/topic/123/updated?page=2');
    expect(link.querySelector('.mpkr-translation-body')?.closest('a')?.getAttribute('href')).toBe('/forum/topic/123/updated?page=2');
    const source = target.sourceElements[0]!;
    source.querySelector('strong')!.textContent = 'updated forum title';
    const updatedText = adapter.collectPageTargets()[0]!;
    expect(updatedText.semanticSource).toBe('Original updated forum title');
    expect(updatedText.source).not.toBe(target.source);
    source.innerHTML = 'Original <em>updated forum title</em>';
    expect(adapter.collectPageTargets()[0]?.source).not.toBe(updatedText.source);
    renderer.destroy();
    expect([...link.childNodes]).toEqual(nodes);
    expect(link.querySelector('p')).toBe(metadata);
  });
});
