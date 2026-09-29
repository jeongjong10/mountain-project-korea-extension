import { TRANSLATION_ACTION_CSS, setStatusMessage } from '../ui/message-style';
import { UI } from '../ui/design-tokens';
import type {
  DomTranslationTarget,
  RetranslateHandler,
  TranslationRenderer,
} from '../application/ports';
import { SHARED_SELECTORS } from '../sites/mountain-project/contract/selectors/shared';
import { STATS_SELECTORS } from '../sites/mountain-project/contract/selectors/stats';
import { COMMUNITY_SELECTORS } from '../sites/mountain-project/contract/selectors/community';
import {
  cloneStructuredListShell,
  renderStructuredTranslation,
} from './dom-translation-format';

interface Binding {
  target: DomTranslationTarget;
  presentation: Presentation;
  translated?: string;
  failureMessage?: string;
  copy?: HTMLElement;
}

interface Presentation {
  bindings: Binding[];
  forceOriginal: boolean;
  sectionRoot?: HTMLElement;
  block?: HTMLElement;
  body?: HTMLElement;
  toggle?: HTMLButtonElement;
  retranslate?: HTMLButtonElement;
  status?: HTMLElement;
  feedback?: HTMLElement;
  toggleHost?: HTMLElement;
  originalWrapper?: HTMLElement;
  lists: Map<Element, HTMLElement>;
  translatedCount: number;
}

interface InlineBinding {
  target: DomTranslationTarget;
  original: string;
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

export class OriginalPreservingRenderer implements TranslationRenderer {
  private style?: HTMLStyleElement;
  private readonly bindings = new Map<string, Binding>();
  private readonly presentations = new Set<Presentation>();
  private sectionPresentations = new WeakMap<HTMLElement, Presentation>();
  private originalDisplays = new WeakMap<HTMLElement, string>();
  private readonly inlineBindings = new Map<string, InlineBinding>();
  private retranslateHandler?: RetranslateHandler;

  setRetranslateHandler(handler: RetranslateHandler): void {
    this.retranslateHandler = handler;
  }

  track(target: DomTranslationTarget): void {
    if (target.renderMode === 'inline') {
      const existing = this.inlineBindings.get(target.id);
      const source = target.sourceElements[0];
      if (!source) return;
      if (existing) {
        existing.target = target;
        return;
      }
      this.inlineBindings.set(target.id, {
        target,
        original: source.textContent ?? target.source,
      });
      return;
    }
    const existing = this.bindings.get(target.id);
    if (existing) {
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
        lists: new Map(),
        translatedCount: 0,
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
    if (target.renderMode === 'inline') {
      const binding = this.inlineBindings.get(target.id);
      const source = target.sourceElements[0];
      if (!source) return;
      if (binding) {
        binding.target = target;
        binding.original = source.textContent ?? target.source;
      } else {
        this.track(target);
      }
      return;
    }
    this.track(target);
    const binding = this.bindings.get(target.id);
    if (!binding) {
      return;
    }

    const presentation = binding.presentation;
    binding.failureMessage = undefined;
    this.removeCopy(binding);
    this.showOriginal(binding.target, presentation);
    if (presentation.translatedCount > 0) {
      return;
    }
    this.releaseEmptyPresentation(presentation);
  }

  render(target: DomTranslationTarget, translated: string): void {
    if (!translated.trim()) {
      return;
    }

    this.track(target);
    if (target.renderMode === 'inline') {
      const binding = this.inlineBindings.get(target.id);
      const source = binding?.target.sourceElements[0];
      if (!binding || !source) return;
      const leading = binding.original.match(/^\s*/)?.[0] ?? '';
      const trailing = binding.original.match(/\s*$/)?.[0] ?? '';
      source.textContent = `${leading}${translated}${trailing}`;
      return;
    }
    const binding = this.bindings.get(target.id);
    if (!binding) {
      return;
    }

    // Validate before replacing a completed copy or changing its state.
    const structuredCopy = target.format
      ? renderStructuredTranslation(target.format, translated, target.parent.ownerDocument)
      : undefined;
    binding.failureMessage = undefined;
    if (binding.translated === undefined) binding.presentation.translatedCount += 1;
    binding.translated = translated;
    this.ensurePresentation(binding.presentation);
    this.renderBinding(binding, structuredCopy);
    this.refreshPresentationState(binding.presentation);
    if (binding.presentation.forceOriginal) this.showOriginal(target, binding.presentation);
    else this.hideOriginal(target, binding.presentation);
  }

  showFailure(target: DomTranslationTarget, message: string): void {
    this.showSource(target, message);
  }

  preserveOriginal(target: DomTranslationTarget): void {
    this.showSource(target);
  }

  private showSource(target: DomTranslationTarget, message?: string): void {
    if (target.renderMode === 'inline') return;
    this.track(target);
    const binding = this.bindings.get(target.id);
    if (!binding) return;
    binding.failureMessage = message;
    this.ensurePresentation(binding.presentation);
    this.showOriginal(target, binding.presentation);
    this.refreshPresentationState(binding.presentation);
    if (!message && binding.presentation.feedback) binding.presentation.feedback.hidden = true;
  }

  hasFailureNotice(target: DomTranslationTarget): boolean {
    const status = this.bindings.get(target.id)?.presentation.status;
    return Boolean(status?.isConnected && !status.closest('[hidden]'));
  }

  remove(id: string): void {
    const inline = this.inlineBindings.get(id);
    if (inline) {
      const source = inline.target.sourceElements[0];
      if (source) source.textContent = inline.original;
      this.inlineBindings.delete(id);
      return;
    }
    const binding = this.bindings.get(id);
    if (!binding) return;
    this.removeCopy(binding);
    this.showOriginal(binding.target, binding.presentation);
    this.bindings.delete(id);
    const presentation = binding.presentation;
    presentation.bindings = presentation.bindings.filter((entry) => entry !== binding);
    if (presentation.translatedCount === 0) this.releaseEmptyPresentation(presentation);
    if (presentation.bindings.length === 0) {
      this.presentations.delete(presentation);
      if (presentation.sectionRoot) this.sectionPresentations.delete(presentation.sectionRoot);
    }
  }

  private releaseEmptyPresentation(presentation: Presentation): void {
    presentation.toggleHost?.remove();
    presentation.block?.remove();
    presentation.block = undefined;
    presentation.body = undefined;
    presentation.toggle = undefined;
    presentation.retranslate = undefined;
    presentation.status = undefined;
    presentation.feedback = undefined;
    presentation.toggleHost = undefined;
    presentation.lists.clear();
    presentation.bindings.forEach((binding) => this.showOriginal(binding.target, presentation));
    this.unwrapOriginalContent(presentation);
  }

  destroy(): void {
    this.style?.remove();
    this.style = undefined;
    this.inlineBindings.forEach((binding) => {
      const source = binding.target.sourceElements[0];
      if (source) source.textContent = binding.original;
    });
    this.inlineBindings.clear();
    this.presentations.forEach((presentation) => {
      presentation.toggleHost?.remove();
      presentation.block?.remove();
      presentation.bindings.forEach((binding) => this.showOriginal(binding.target, presentation));
      this.unwrapOriginalContent(presentation);
    });
    this.bindings.clear();
    this.presentations.clear();
    this.sectionPresentations = new WeakMap<HTMLElement, Presentation>();
    this.originalDisplays = new WeakMap<HTMLElement, string>();
  }

  private sectionRoot(target: DomTranslationTarget): HTMLElement | undefined {
    if (target.category === 'comment') {
      return undefined;
    }
    for (const element of target.sourceElements) {
      if (element.matches(SHARED_SELECTORS.authoredContent)) {
        return element;
      }
      const root = element.closest<HTMLElement>(SHARED_SELECTORS.authoredContent);
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
    if (!this.style) {
      this.style = ownerDocument.createElement('style');
      this.style.dataset.mpkrTranslationActions = '';
      this.style.textContent = TRANSLATION_ACTION_CSS;
      ownerDocument.head.append(this.style);
    }
    const inlineCopy = first.target.renderMode === 'inline-copy';
    const block = ownerDocument.createElement(inlineCopy ? 'span' : 'div');
    block.className = presentation.sectionRoot
      ? 'mpkr-machine-translation mpkr-section-translation'
      : 'mpkr-machine-translation';
    block.dataset.mpkrTranslationId = first.target.id;
    block.style.color = 'inherit';
    block.style.fontSize = 'inherit';
    block.style.lineHeight = inlineCopy ? 'inherit' : UI.font.bodyLineHeight;
    block.style.margin = inlineCopy || presentation.sectionRoot ? '0' : '0.5rem 0';

    const body = ownerDocument.createElement(inlineCopy ? 'span' : 'div');
    body.className = 'mpkr-translation-body';

    const status = ownerDocument.createElement(inlineCopy ? 'span' : 'div');
    status.className = 'mpkr-translation-status mpkr-status-message';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');
    const feedback = ownerDocument.createElement('span');
    feedback.className = 'mpkr-translation-feedback';
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');
    feedback.hidden = true;

    const toggle = ownerDocument.createElement('button');
    toggle.type = 'button';
    toggle.className = 'mpkr-original-toggle';
    toggle.textContent = presentation.forceOriginal ? '원문 숨기기' : '원문 보기';
    toggle.setAttribute('aria-expanded', String(presentation.forceOriginal));
    toggle.setAttribute('aria-label', presentation.forceOriginal ? '이 섹션의 원문 숨기기' : '이 섹션의 원문 보기');
    toggle.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      presentation.forceOriginal = !presentation.forceOriginal;
      this.applyPresentation(presentation);
    });

    const retranslate = ownerDocument.createElement('button');
    retranslate.type = 'button';
    retranslate.className = 'mpkr-retranslate';
    retranslate.textContent = '재번역';
    retranslate.setAttribute('aria-label', '이 섹션 다시 번역');
    retranslate.addEventListener('click', async (event) => {
      event.preventDefault();
      event.stopPropagation();
      const handler = this.retranslateHandler;
      if (!handler || retranslate.disabled) return;
      const targetIds = presentation.bindings
        .map((binding) => binding.target)
        .filter((target) => target.renderMode !== 'inline')
        .map((target) => target.id);
      if (targetIds.length === 0) return;

      retranslate.disabled = true;
      retranslate.setAttribute('aria-busy', 'true');
      feedback.hidden = false;
      feedback.textContent = '재번역 중…';
      try {
        const result = await handler(targetIds);
        feedback.textContent = result === 'preserved' ? '' : result === 'unchanged'
          ? '기존 번역과 같습니다.'
          : result === 'failed' ? '재번역하지 못했습니다. 다시 시도해 주세요.' : '번역을 갱신했습니다.';
        feedback.hidden = result === 'preserved' || result === 'failed' && !status.hidden;
      } catch {
        feedback.textContent = '재번역하지 못했습니다. 다시 시도해 주세요.';
        feedback.hidden = !status.hidden;
      } finally {
        retranslate.disabled = false;
        retranslate.removeAttribute('aria-busy');
      }
    });

    block.append(body, status);
    presentation.block = block;
    presentation.body = body;
    presentation.toggle = toggle;
    presentation.retranslate = retranslate;
    presentation.status = status;
    presentation.feedback = feedback;

    if (presentation.sectionRoot) {
      this.wrapWholeRootOriginal(presentation);
      presentation.sectionRoot.insertBefore(block, presentation.sectionRoot.firstChild);
    } else {
      first.target.parent.insertBefore(block, first.target.insertBefore ?? null);
    }

    const author = this.authorFor(first.target);
    if (first.target.actionPlacement) {
      const placement = first.target.actionPlacement;
      const toggleHost = ownerDocument.createElement('span');
      toggleHost.className = 'mpkr-original-toggle-host mpkr-translation-actions';
      toggleHost.append(toggle, retranslate, feedback);
      placement.parent.insertBefore(toggleHost, placement.insertBefore ?? null);
      presentation.toggleHost = toggleHost;
    } else if (first.target.category === 'comment' && author?.parentElement) {
      const toggleHost = ownerDocument.createElement('div');
      toggleHost.className = 'mpkr-original-toggle-host mpkr-translation-actions';
      author.insertAdjacentElement('afterend', toggleHost);
      toggleHost.append(toggle);
      toggleHost.append(retranslate, feedback);
      presentation.toggleHost = toggleHost;
    } else {
      const actions = ownerDocument.createElement('span');
      actions.className = 'mpkr-translation-actions';
      actions.append(toggle, retranslate, feedback);
      block.append(actions);
    }
    this.refreshPresentationState(presentation);
  }

  private refreshPresentationState(presentation: Presentation): void {
    const hasTranslation = presentation.translatedCount > 0;
    const failure = presentation.bindings.find((binding) => binding.failureMessage)?.failureMessage;
    if (presentation.body) presentation.body.hidden = !hasTranslation;
    if (presentation.toggle) presentation.toggle.hidden = !hasTranslation;
    if (presentation.status) {
      setStatusMessage(presentation.status, failure ?? '');
      presentation.status.hidden = !failure;
    }
  }

  private authorFor(target: DomTranslationTarget): HTMLElement | undefined {
    const source = target.sourceElements[0];
    if (!source) {
      return undefined;
    }
    const forumAuthor = source.closest(COMMUNITY_SELECTORS.topicRow)
      ?.querySelector<HTMLElement>(COMMUNITY_SELECTORS.topicAuthor);
    if (forumAuthor) return forumAuthor;
    const activityAuthor = source.closest(COMMUNITY_SELECTORS.activityRow)
      ?.querySelector<HTMLElement>(COMMUNITY_SELECTORS.activityAuthor);
    if (activityAuthor) return activityAuthor;

    const tickRow = source.closest<HTMLElement>(STATS_SELECTORS.tickRowLandmark);
    if (tickRow) {
      return tickRow.querySelector<HTMLElement>(STATS_SELECTORS.tickAuthor) ?? undefined;
    }

    const commentBody = target.parent.matches(SHARED_SELECTORS.commentBody)
      ? target.parent
      : source.closest<HTMLElement>(SHARED_SELECTORS.commentBody);
    const localAuthor = commentBody?.querySelector<HTMLElement>(SHARED_SELECTORS.commentAuthor);
    if (localAuthor) {
      return localAuthor;
    }

    const commentContainer = commentBody?.closest<HTMLElement>(SHARED_SELECTORS.commentContainer);
    return commentContainer?.querySelector<HTMLElement>(SHARED_SELECTORS.commentAuthor) ?? undefined;
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

  private readonly sourceForCopy = new WeakMap<Element, Element>();

  private insertInSourceOrder(parent: HTMLElement, copy: HTMLElement, source?: Element): void {
    if (source) this.sourceForCopy.set(copy, source);
    let next: Element | null = null;
    for (let sibling = parent.lastElementChild; sibling; sibling = sibling.previousElementSibling) {
      const siblingSource = this.sourceForCopy.get(sibling);
      if (!source || !siblingSource || !(source.compareDocumentPosition(siblingSource) & Node.DOCUMENT_POSITION_FOLLOWING)) break;
      next = sibling;
    }
    parent.insertBefore(copy, next);
  }

  private renderBinding(binding: Binding, structuredCopy?: HTMLElement): void {
    const { presentation } = binding;
    const body = presentation.body!;
    const source = binding.target.sourceElements[0];
    const previous = binding.copy;
    const previousParent = previous?.parentElement;
    const previousNext = previous?.nextSibling ?? null;
    previous?.remove();

    let parent = previousParent ?? body;
    if (!previousParent && source?.tagName === 'LI' && source.parentElement) {
      const listSource = source.parentElement;
      let list = presentation.lists.get(listSource);
      if (!list) {
        list = binding.target.format
          ? cloneStructuredListShell(binding.target.format, body.ownerDocument)
          : undefined;
        list ??= body.ownerDocument.createElement(listSource.tagName === 'OL' ? 'ol' : 'ul');
        list.style.margin = '0.35rem 0';
        list.style.paddingLeft = '1.4rem';
        presentation.lists.set(listSource, list);
        this.insertInSourceOrder(body, list, listSource);
      }
      parent = list;
    }
    const copy = structuredCopy ?? body.ownerDocument.createElement(
      source?.tagName === 'LI' ? 'li'
        : source && SAFE_TRANSLATION_TAGS.has(source.tagName) ? source.tagName.toLowerCase() : 'div',
    );
    if (!binding.target.format) copy.textContent = binding.translated ?? '';
    if (copy.tagName !== 'LI' && binding.target.renderMode !== 'inline-copy') {
      copy.style.marginTop = '0.65rem';
      copy.style.marginBottom = '0';
    }
    binding.copy = copy;
    if (previousParent) previousParent.insertBefore(copy, previousNext);
    else this.insertInSourceOrder(parent, copy, source);
    if (parent === body && copy === body.firstElementChild && binding.target.renderMode !== 'inline-copy') {
      copy.style.marginTop = '0';
      const next = copy.nextElementSibling as HTMLElement | null;
      if (next && !['UL', 'OL'].includes(next.tagName)) next.style.marginTop = '0.65rem';
    }
  }

  private removeCopy(binding: Binding): void {
    if (binding.translated) binding.presentation.translatedCount -= 1;
    binding.translated = undefined;
    binding.copy?.remove();
    binding.copy = undefined;
    for (const [source, list] of binding.presentation.lists) {
      if (!list.childElementCount) {
        list.remove();
        binding.presentation.lists.delete(source);
      }
    }
    const first = binding.presentation.body?.firstElementChild as HTMLElement | null | undefined;
    if (first && !['UL', 'OL'].includes(first.tagName)) first.style.marginTop = '0';
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
