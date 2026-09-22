import type { DomTranslationTarget } from '../adapters/mountain-project-page-adapter';
import { OriginalPreservingRenderer } from './original-preserving-renderer';

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
});
