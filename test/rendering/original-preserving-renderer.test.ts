import type { DomTranslationTarget } from '@/application/ports';
import { OriginalPreservingRenderer } from '@/rendering/original-preserving-renderer';

function target(category: DomTranslationTarget['category']): DomTranslationTarget {
  const source = document.querySelector<HTMLElement>('#source')!;
  return {
    id: `${category}-1`,
    category,
    source: source.textContent ?? '',
    sourceElements: [source],
    parent: source.parentElement!,
    insertBefore: source.nextSibling,
  };
}

describe('OriginalPreservingRenderer', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div><p id="source">Original climbing description.</p></div>';
  });

  it('replaces inline text without changing its interactive parent and restores it', () => {
    document.body.innerHTML = '<button id="parent"><span id="source">  Open this answer  </span></button>';
    const source = document.querySelector<HTMLElement>('#source')!;
    const parent = document.querySelector<HTMLButtonElement>('#parent')!;
    const click = vi.fn();
    parent.addEventListener('click', click);
    const renderer = new OriginalPreservingRenderer();
    const inlineTarget: DomTranslationTarget = {
      id: 'help-inline', category: 'description', source: 'Open this answer',
      sourceElements: [source], parent, renderMode: 'inline',
    };

    renderer.render(inlineTarget, '답변 열기');
    expect(source.textContent).toBe('  답변 열기  ');
    parent.click();
    expect(click).toHaveBeenCalledOnce();
    expect(parent.querySelector('.mpkr-machine-translation')).toBeNull();

    renderer.destroy();
    expect(source.textContent).toBe('  Open this answer  ');
  });

  it.each(['remove', 'reset'] as const)('cleans an empty presentation after %s while pending bindings remain', (action) => {
    document.body.innerHTML = '<div class="fr-view"><p id="source">First paragraph.</p><p id="pending">Pending paragraph.</p></div>';
    const renderer = new OriginalPreservingRenderer();
    const first = target('description');
    const source = document.querySelector<HTMLElement>('#pending')!;
    const pending: DomTranslationTarget = { id: 'pending', category: 'description', source: source.textContent!, sourceElements: [source], parent: source.parentElement! };
    renderer.track(first);
    renderer.track(pending);
    renderer.render(first, '첫 문단');
    document.querySelector<HTMLButtonElement>('.mpkr-original-toggle')!.click();
    if (action === 'remove') renderer.remove(first.id);
    else renderer.reset(first);
    expect(document.querySelector('.mpkr-machine-translation')).toBeNull();
    expect(document.querySelector('.mpkr-original-toggle')).toBeNull();
    expect(source.style.display).toBe('');
    renderer.render(pending, '다음 문단');
    expect(document.querySelector('.mpkr-translation-body')?.textContent).toBe('다음 문단');
    expect(document.querySelectorAll('.mpkr-original-toggle')).toHaveLength(1);
    expect(document.querySelector('.mpkr-original-toggle')?.getAttribute('aria-expanded')).toBe('true');
    expect(document.querySelector('.mpkr-original-toggle')?.textContent).toBe('원문 숨기기');
    expect(source.style.display).toBe('');
    renderer.destroy();
  });

  it.each(['remove', 'reset'] as const)('normalizes the first translated paragraph margin after %s', (action) => {
    document.body.innerHTML = '<div class="fr-view"><p id="source">First paragraph.</p><p id="second">Second paragraph.</p></div>';
    const renderer = new OriginalPreservingRenderer();
    const first = target('description');
    const source = document.querySelector<HTMLElement>('#second')!;
    const second: DomTranslationTarget = { id: 'second', category: 'description', source: source.textContent!, sourceElements: [source], parent: source.parentElement! };
    renderer.render(first, '첫 문단');
    renderer.render(second, '둘째 문단');
    const secondCopy = document.querySelector<HTMLElement>('.mpkr-translation-body > p:last-child')!;
    expect(secondCopy.style.marginTop).toBe('0.65rem');
    if (action === 'remove') renderer.remove(first.id);
    else renderer.reset(first);
    expect(document.querySelector('.mpkr-translation-body')?.firstElementChild).toBe(secondCopy);
    expect(secondCopy.style.marginTop).toBe('0px');
    renderer.destroy();
  });

  it('shows Korean by default and exposes the original only through its toggle', () => {
    const source = document.querySelector<HTMLElement>('#source')!;
    const renderer = new OriginalPreservingRenderer();
    renderer.render(target('description'), '한국어 설명입니다.');

    const block = document.querySelector<HTMLElement>('.mpkr-machine-translation')!;
    const toggle = block.querySelector<HTMLButtonElement>('button')!;
    expect(source.style.display).toBe('none');
    expect(block.textContent).toContain('한국어 설명입니다.');
    expect(toggle.textContent).toBe('원문 보기');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.getAttribute('aria-label')).toBe('이 섹션의 원문 보기');

    toggle.click();
    expect(source.style.display).toBe('');
    expect(toggle.textContent).toBe('원문 숨기기');
    expect(toggle.querySelector('svg')).toBeNull();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');

    toggle.click();
    expect(source.style.display).toBe('none');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('keeps the original toggle from activating a containing site link', () => {
    document.body.innerHTML = '<a id="parent" href="/photo/1"><p id="source">Photo caption.</p></a>';
    const parent = document.querySelector<HTMLAnchorElement>('#parent')!;
    let parentClicks = 0;
    parent.addEventListener('click', () => { parentClicks += 1; });
    const renderer = new OriginalPreservingRenderer();
    renderer.render(target('description'), '사진 설명입니다.');

    document.querySelector<HTMLButtonElement>('.mpkr-original-toggle')!.click();

    expect(parentClicks).toBe(0);
    expect(document.querySelector<HTMLElement>('#source')?.style.display).toBe('');
  });

  it('places a comment toggle directly below the semantic author without changing the author link', () => {
    document.body.innerHTML = `
      <table class="main-comment"><tbody><tr>
        <td class="user"><a id="author" href="/user/7/climber">Climber Kim</a></td>
        <td><div class="comment-body"><span id="source">Original comment body.</span></div></td>
      </tr></tbody></table>
    `;
    const author = document.querySelector<HTMLAnchorElement>('#author')!;
    let authorClicks = 0;
    author.addEventListener('click', (event) => {
      event.preventDefault();
      authorClicks += 1;
    });
    const renderer = new OriginalPreservingRenderer();

    renderer.render(target('comment'), '번역된 댓글입니다.');

    const host = author.nextElementSibling as HTMLElement;
    const toggle = host.querySelector<HTMLButtonElement>('.mpkr-original-toggle')!;
    expect(host.classList.contains('mpkr-original-toggle-host')).toBe(true);
    expect(toggle.textContent).toBe('원문 보기');
    expect(document.querySelector('.mpkr-machine-translation .mpkr-original-toggle')).toBeNull();

    toggle.click();
    expect(authorClicks).toBe(0);
    expect(author.getAttribute('href')).toBe('/user/7/climber');
    expect(document.querySelector<HTMLElement>('#source')?.style.display).toBe('');

    renderer.destroy();
    expect(document.querySelector('.mpkr-original-toggle-host')).toBeNull();
    expect(author.nextElementSibling).toBeNull();
  });

  it('places retranslation beside the original control and sends the presentation target ids', async () => {
    document.body.innerHTML = `
      <table class="main-comment"><tbody><tr>
        <td class="user"><a id="author" href="/user/7/climber">Climber Kim</a></td>
        <td><div class="comment-body"><span id="source">Original comment body.</span></div></td>
      </tr></tbody></table>
    `;
    const renderer = new OriginalPreservingRenderer();
    const retranslate = vi.fn(async () => 'unchanged' as const);
    renderer.setRetranslateHandler(retranslate);
    renderer.render(target('comment'), '번역된 댓글입니다.');

    const host = document.querySelector<HTMLElement>('.mpkr-original-toggle-host')!;
    const originalButton = host.querySelector<HTMLButtonElement>('.mpkr-original-toggle')!;
    const retranslateButton = host.querySelector<HTMLButtonElement>('.mpkr-retranslate')!;
    expect(originalButton.nextElementSibling).toBe(retranslateButton);

    retranslateButton.click();
    await Promise.resolve();
    await Promise.resolve();

    expect(retranslate).toHaveBeenCalledWith(['comment-1']);
    expect(retranslateButton.textContent).toBe('재번역');
    expect(host.querySelector('.mpkr-translation-feedback')?.textContent).toBe('기존 번역과 같습니다.');
    expect(host.querySelector('.mpkr-translation-feedback')?.getAttribute('role')).toBe('status');
    expect(retranslateButton.disabled).toBe(false);
  });

  it('places a tick toggle below its user using the structural tick row landmark', () => {
    document.body.innerHTML = `
      <div id="route-stats"><div class="onx-stats-table"><table><tbody>
        <tr id="ticks.42">
          <td><a id="author" href="/user/42/climber">Tick Climber</a></td>
          <td><span id="source" class="mpkr-stats-tick-note-source">Original tick note.</span></td>
        </tr>
      </tbody></table></div></div>
    `;
    const author = document.querySelector<HTMLAnchorElement>('#author')!;
    const renderer = new OriginalPreservingRenderer();

    renderer.render(target('comment'), '번역된 등반 기록입니다.');

    expect(author.nextElementSibling?.classList.contains('mpkr-original-toggle-host')).toBe(true);
    expect(author.nextElementSibling?.querySelector('.mpkr-original-toggle')?.textContent)
      .toBe('원문 보기');
  });

  it('keeps the existing safe toggle position when no author can be found', () => {
    const renderer = new OriginalPreservingRenderer();

    renderer.render(target('comment'), '번역된 댓글입니다.');

    expect(document.querySelector('.mpkr-original-toggle-host')).toBeNull();
    expect(document.querySelector('.mpkr-machine-translation > .mpkr-translation-actions > .mpkr-original-toggle'))
      .not.toBeNull();
  });

  it('renders one coherent translation block and one original control per semantic section', () => {
    document.body.innerHTML = `
      <section class="text-section">
        <h2>Description</h2>
        <div class="fr-view">
          <p id="first">First paragraph.</p>
          <p id="second">Second paragraph.</p>
        </div>
      </section>
    `;
    const first = document.querySelector<HTMLElement>('#first')!;
    const second = document.querySelector<HTMLElement>('#second')!;
    const section = document.querySelector<HTMLElement>('.fr-view')!;
    const renderer = new OriginalPreservingRenderer();
    const firstTarget: DomTranslationTarget = {
      id: 'description-first',
      category: 'description',
      source: first.textContent ?? '',
      sourceElements: [first],
      parent: section,
      insertBefore: first.nextSibling,
    };
    const secondTarget: DomTranslationTarget = {
      id: 'description-second',
      category: 'description',
      source: second.textContent ?? '',
      sourceElements: [second],
      parent: section,
      insertBefore: second.nextSibling,
    };

    renderer.track(firstTarget);
    renderer.track(secondTarget);
    renderer.render(secondTarget, '두 번째 문단입니다.');
    renderer.render(firstTarget, '첫 번째 문단입니다.');

    const blocks = section.querySelectorAll<HTMLElement>('.mpkr-section-translation');
    const body = section.querySelector<HTMLElement>('.mpkr-translation-body')!;
    const toggles = section.querySelectorAll<HTMLButtonElement>('.mpkr-original-toggle');
    expect(blocks).toHaveLength(1);
    expect(toggles).toHaveLength(1);
    expect(body.querySelectorAll('p')).toHaveLength(2);
    expect(Array.from(body.querySelectorAll('p')).map((element) => element.textContent)).toEqual([
      '첫 번째 문단입니다.',
      '두 번째 문단입니다.',
    ]);
    expect(blocks[0]?.textContent).not.toContain('기계 번역');
    expect(first.style.display).toBe('none');
    expect(second.style.display).toBe('none');

    toggles[0]?.click();
    expect(first.style.display).toBe('');
    expect(second.style.display).toBe('');
    expect(toggles[0]?.getAttribute('aria-expanded')).toBe('true');
  });

  it('preserves list structure inside a section translation', () => {
    document.body.innerHTML = `
      <div class="fr-view">
        <ul><li id="first">Bring a rack.</li><li id="second">Carry small nuts.</li></ul>
      </div>
    `;
    const section = document.querySelector<HTMLElement>('.fr-view')!;
    const items = Array.from(section.querySelectorAll<HTMLElement>('li'));
    const renderer = new OriginalPreservingRenderer();
    items.forEach((item, index) => {
      const itemTarget: DomTranslationTarget = {
        id: `safety-${index}`,
        category: 'safety',
        source: item.textContent ?? '',
        sourceElements: [item],
        parent: item.parentElement!,
        insertBefore: item.nextSibling,
      };
      renderer.track(itemTarget);
      renderer.render(itemTarget, index === 0 ? '랙을 준비하세요.' : '작은 너트를 챙기세요.');
    });

    const translatedList = section.querySelector<HTMLElement>('.mpkr-translation-body > ul')!;
    expect(translatedList).not.toBeNull();
    expect(Array.from(translatedList.children).map((item) => item.textContent)).toEqual([
      '랙을 준비하세요.',
      '작은 너트를 챙기세요.',
    ]);
    expect(section.querySelectorAll('.mpkr-original-toggle')).toHaveLength(1);
  });

  it('keeps a whole fr-view target collapsible and restores its exact child nodes', () => {
    document.body.innerHTML = `
      <div class="fr-view" id="source">Direct text<br><strong>and inline markup.</strong></div>
    `;
    const section = document.querySelector<HTMLElement>('#source')!;
    const originalNodes = Array.from(section.childNodes);
    const renderer = new OriginalPreservingRenderer();
    renderer.render(target('access'), '직접 텍스트와 인라인 마크업입니다.');

    expect(Array.from(section.children)
      .filter((element) => element.classList.contains('mpkr-section-translation'))).toHaveLength(1);
    expect(section.querySelector<HTMLElement>('.mpkr-original-section-content')?.style.display)
      .toBe('none');
    section.hidden = true;
    expect(section.querySelector('.mpkr-section-translation')).not.toBeNull();

    renderer.destroy();
    expect(section.querySelector('.mpkr-section-translation')).toBeNull();
    expect(section.querySelector('.mpkr-original-section-content')).toBeNull();
    expect(Array.from(section.childNodes)).toEqual(originalNodes);
  });

  it.each([
    'description',
    'access',
    'safety',
    'comment',
  ] as const)('applies the Korean-first default to the %s category', (category) => {
    const source = document.querySelector<HTMLElement>('#source')!;
    const renderer = new OriginalPreservingRenderer();
    renderer.render(target(category), `${category} 번역`);

    expect(source.style.display).toBe('none');
    expect(document.querySelector<HTMLElement>('.mpkr-machine-translation')?.style.display).toBe('');
  });

  it('does not alter the DOM for an empty translation', () => {
    const source = document.querySelector<HTMLElement>('#source')!;
    const renderer = new OriginalPreservingRenderer();

    renderer.render(target('comment'), '   ');

    expect(source.style.display).toBe('');
    expect(document.querySelector('.mpkr-machine-translation')).toBeNull();
  });

  it('restores original inline display values and removes every translation on destroy', () => {
    document.body.innerHTML = `
      <div id="first-parent"><p id="source" style="display: inline-block">First original</p></div>
      <div id="second-parent"><p id="second" style="display: flex">Second original</p></div>
    `;
    const first = document.querySelector<HTMLElement>('#source')!;
    const second = document.querySelector<HTMLElement>('#second')!;
    const renderer = new OriginalPreservingRenderer();
    renderer.render(target('description'), '첫 번째 번역');
    renderer.render({
      id: 'comment-2',
      category: 'comment',
      source: second.textContent ?? '',
      sourceElements: [second],
      parent: second.parentElement!,
      insertBefore: second.nextSibling,
    }, '두 번째 번역');

    expect(first.style.display).toBe('none');
    expect(second.style.display).toBe('none');

    renderer.destroy();
    expect(document.querySelector('.mpkr-machine-translation')).toBeNull();
    expect(first.style.display).toBe('inline-block');
    expect(second.style.display).toBe('flex');
  });

  it('can render the same section again after destroy without reusing detached presentation state', () => {
    document.body.innerHTML = '<div class="fr-view"><p id="source">Original text.</p></div>';
    const renderer = new OriginalPreservingRenderer();

    renderer.render(target('description'), '첫 번째 번역');
    renderer.destroy();
    renderer.render(target('description'), '두 번째 번역');

    expect(document.querySelectorAll('.mpkr-section-translation')).toHaveLength(1);
    expect(document.querySelector('.mpkr-translation-body')?.textContent).toBe('두 번째 번역');
    expect(document.querySelector<HTMLElement>('#source')?.style.display).toBe('none');
  });
});
