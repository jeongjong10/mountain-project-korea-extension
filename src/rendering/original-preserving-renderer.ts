import type { DomTranslationTarget } from '../adapters/mountain-project-page-adapter';

interface Binding {
  target: DomTranslationTarget;
  presentation: Presentation;
  translated?: string;
}

interface Presentation {
  bindings: Binding[];
  forceOriginal: boolean;
  sectionRoot?: HTMLElement;
  block?: HTMLElement;
  body?: HTMLElement;
  toggle?: HTMLButtonElement;
  originalWrapper?: HTMLElement;
}

const SAFE_TRANSLATION_TAGS = new Set([
  'BLOCKQUOTE',
  'DIV',
  'H3',
  'H4',
  'H5',
  'H6',
  'P',
  'PRE',
]);

export class OriginalPreservingRenderer {
  private readonly bindings = new Map<string, Binding>();
  private readonly presentations = new Set<Presentation>();
  private readonly sectionPresentations = new WeakMap<HTMLElement, Presentation>();
  private readonly originalDisplays = new WeakMap<HTMLElement, string>();

  track(target: DomTranslationTarget): void {
    const existing = this.bindings.get(target.id);
    if (existing) {
      this.showOriginal(existing.target, existing.presentation);
      existing.target = target;
      target.sourceElements.forEach((element) => {
        if (!this.originalDisplays.has(element)) {
          this.originalDisplays.set(element, element.style.display);
        }
      });
      return;
    }
    target.sourceElements.forEach((element) => {
      this.originalDisplays.set(element, element.style.display);
    });

    const sectionRoot = this.sectionRoot(target);
    let presentation = sectionRoot
      ? this.sectionPresentations.get(sectionRoot)
      : undefined;
    if (!presentation) {
      presentation = {
        bindings: [],
        forceOriginal: false,
        sectionRoot,
      };
      this.presentations.add(presentation);
      if (sectionRoot) {
        this.sectionPresentations.set(sectionRoot, presentation);
      }
    }

    const binding: Binding = { target, presentation };
    presentation.bindings.push(binding);
    this.bindings.set(target.id, binding);
  }

  reset(target: DomTranslationTarget): void {
    this.track(target);
    const binding = this.bindings.get(target.id);
    if (!binding) {
      return;
    }

    binding.translated = undefined;
    const presentation = binding.presentation;
    if (presentation.bindings.some((candidate) => candidate.translated)) {
      this.renderPresentationBody(presentation);
      this.applyPresentation(presentation);
      return;
    }

    presentation.block?.remove();
    presentation.block = undefined;
    presentation.body = undefined;
    presentation.toggle = undefined;
    presentation.bindings.forEach((candidate) => {
      this.showOriginal(candidate.target, presentation);
    });
    this.unwrapOriginalContent(presentation);
  }

  render(target: DomTranslationTarget, translated: string): void {
    if (!translated.trim()) {
      return;
    }

    this.track(target);
    const binding = this.bindings.get(target.id);
    if (!binding) {
      return;
    }

    binding.translated = translated.trim();
    this.ensurePresentation(binding.presentation);
    this.renderPresentationBody(binding.presentation);
    this.applyPresentation(binding.presentation);
  }

  destroy(): void {
    this.presentations.forEach((presentation) => {
      presentation.block?.remove();
      presentation.bindings.forEach((binding) => this.showOriginal(binding.target, presentation));
      this.unwrapOriginalContent(presentation);
    });
    this.bindings.clear();
    this.presentations.clear();
  }

  private sectionRoot(target: DomTranslationTarget): HTMLElement | undefined {
    if (target.category === 'comment') {
      return undefined;
    }
    for (const element of target.sourceElements) {
      if (element.classList.contains('fr-view')) {
        return element;
      }
      const root = element.closest<HTMLElement>('.fr-view');
      if (root) {
        return root;
      }
    }
    return undefined;
  }

  private ensurePresentation(presentation: Presentation): void {
    if (presentation.block) {
      return;
    }

    const first = presentation.bindings[0];
    if (!first) {
      return;
    }
    const ownerDocument = first.target.parent.ownerDocument;
    const block = ownerDocument.createElement('div');
    block.className = presentation.sectionRoot
      ? 'mpkr-machine-translation mpkr-section-translation'
      : 'mpkr-machine-translation';
    block.dataset.mpkrTranslationId = first.target.id;
    block.style.color = 'inherit';
    block.style.fontSize = 'inherit';
    block.style.lineHeight = '1.65';
    block.style.margin = presentation.sectionRoot ? '0' : '0.5rem 0';

    const body = ownerDocument.createElement('div');
    body.className = 'mpkr-translation-body';

    const toggle = ownerDocument.createElement('button');
    toggle.type = 'button';
    toggle.className = 'mpkr-original-toggle';
    toggle.textContent = '원문 보기';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', '이 섹션의 원문 보기');
    toggle.style.background = 'transparent';
    toggle.style.border = '0';
    toggle.style.color = '#52635a';
    toggle.style.cursor = 'pointer';
    toggle.style.font = 'inherit';
    toggle.style.fontSize = '0.75rem';
    toggle.style.marginTop = '0.35rem';
    toggle.style.padding = '0';
    toggle.style.textDecoration = 'underline';
    toggle.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      presentation.forceOriginal = !presentation.forceOriginal;
      this.applyPresentation(presentation);
    });

    block.append(body, toggle);
    presentation.block = block;
    presentation.body = body;
    presentation.toggle = toggle;

    if (presentation.sectionRoot) {
      this.wrapWholeRootOriginal(presentation);
      presentation.sectionRoot.insertBefore(block, presentation.sectionRoot.firstChild);
    } else {
      first.target.parent.insertBefore(block, first.target.insertBefore ?? null);
    }
  }

  private wrapWholeRootOriginal(presentation: Presentation): void {
    const root = presentation.sectionRoot;
    if (!root || !presentation.bindings.some((binding) => (
      binding.target.sourceElements.includes(root)
    ))) {
      return;
    }

    const wrapper = root.ownerDocument.createElement('div');
    wrapper.className = 'mpkr-original-section-content';
    while (root.firstChild) {
      wrapper.append(root.firstChild);
    }
    root.append(wrapper);
    presentation.originalWrapper = wrapper;
  }

  private unwrapOriginalContent(presentation: Presentation): void {
    const root = presentation.sectionRoot;
    const wrapper = presentation.originalWrapper;
    if (!root || !wrapper) {
      return;
    }
    while (wrapper.firstChild) {
      root.insertBefore(wrapper.firstChild, wrapper);
    }
    wrapper.remove();
    presentation.originalWrapper = undefined;
  }

  private renderPresentationBody(presentation: Presentation): void {
    const body = presentation.body;
    if (!body) {
      return;
    }
    body.replaceChildren();

    let currentList: HTMLElement | undefined;
    let currentListParent: Element | null = null;
    for (const binding of presentation.bindings) {
      if (!binding.translated) {
        continue;
      }
      const source = binding.target.sourceElements[0];
      if (source?.tagName === 'LI') {
        const listParent = source.parentElement;
        if (!currentList || currentListParent !== listParent) {
          currentList = body.ownerDocument.createElement(listParent?.tagName === 'OL' ? 'ol' : 'ul');
          currentList.style.margin = '0.35rem 0';
          currentList.style.paddingLeft = '1.4rem';
          body.append(currentList);
          currentListParent = listParent;
        }
        const item = body.ownerDocument.createElement('li');
        item.textContent = binding.translated;
        currentList.append(item);
        continue;
      }

      currentList = undefined;
      currentListParent = null;
      const tagName = source && SAFE_TRANSLATION_TAGS.has(source.tagName)
        ? source.tagName.toLowerCase()
        : 'div';
      const copy = body.ownerDocument.createElement(tagName);
      copy.textContent = binding.translated;
      copy.style.marginTop = body.childElementCount === 0 ? '0' : '0.65rem';
      copy.style.marginBottom = '0';
      body.append(copy);
    }
  }

  private applyPresentation(presentation: Presentation): void {
    const showOriginal = presentation.forceOriginal;

    if (presentation.block) {
      presentation.block.style.display = '';
    }
    if (presentation.toggle) {
      presentation.toggle.textContent = showOriginal ? '원문 숨기기' : '원문 보기';
      presentation.toggle.setAttribute('aria-expanded', String(showOriginal));
      presentation.toggle.setAttribute(
        'aria-label',
        showOriginal ? '이 섹션의 원문 숨기기' : '이 섹션의 원문 보기',
      );
    }

    presentation.bindings.forEach((binding) => {
      if (showOriginal || !binding.translated) {
        this.showOriginal(binding.target, presentation);
      } else {
        this.hideOriginal(binding.target, presentation);
      }
    });
  }

  private hideOriginal(target: DomTranslationTarget, presentation: Presentation): void {
    if (presentation.originalWrapper && target.sourceElements.includes(presentation.sectionRoot!)) {
      presentation.originalWrapper.style.display = 'none';
      return;
    }
    target.sourceElements.forEach((element) => {
      element.style.display = 'none';
    });
  }

  private showOriginal(target: DomTranslationTarget, presentation: Presentation): void {
    if (presentation.originalWrapper && target.sourceElements.includes(presentation.sectionRoot!)) {
      presentation.originalWrapper.style.display = '';
      return;
    }
    target.sourceElements.forEach((element) => {
      element.style.display = this.originalDisplays.get(element) ?? '';
    });
  }
}
