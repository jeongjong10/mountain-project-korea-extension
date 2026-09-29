import { UI } from './design-tokens';
import { AREA_SELECTORS } from '../sites/mountain-project/contract/selectors/area';
import { ROUTE_SELECTORS } from '../sites/mountain-project/contract/selectors/route';
import {
  SECTION_TITLE_TRANSLATIONS,
} from '../sites/mountain-project/contract/text/sections';
import {
  isAuthoredSectionBoundary,
  locateAuthoredSection,
  normalizedSectionHeading,
} from '../sites/mountain-project/dom/authored-section';

const STYLE_ATTRIBUTE = 'data-mpkr-area-section-presentation';
const LEGACY_STYLE_SELECTOR = 'style[data-mpkr-area-priority]';
const STYLE_TEXT = `
${AREA_SELECTORS.page} .mpkr-area-section-heading,
${ROUTE_SELECTORS.page} .mpkr-area-section-heading {
  position: relative;
  display: block;
  box-sizing: border-box;
  width: 100%;
  padding-right: 10.25rem;
  text-indent: 0;
  cursor: pointer;
  user-select: none;
  border-radius: ${UI.radius.small} ${UI.radius.small} 0 0;
  transition: background-color ${UI.motion.fast}, color ${UI.motion.fast};
}

${AREA_SELECTORS.page} .mpkr-area-section-heading:hover,
${ROUTE_SELECTORS.page} .mpkr-area-section-heading:hover {
  background: ${UI.color.headingHover};
  color: ${UI.color.linkHover};
}

${AREA_SELECTORS.page} .mpkr-area-section-heading:focus-visible,
${ROUTE_SELECTORS.page} .mpkr-area-section-heading:focus-visible {
  outline: 3px solid ${UI.color.link};
  outline-offset: 2px;
  background: ${UI.color.headingFocus};
  color: ${UI.color.linkActive};
}

${AREA_SELECTORS.page} .mpkr-area-section-hint,
${ROUTE_SELECTORS.page} .mpkr-area-section-hint {
  position: absolute;
  top: 50%;
  right: 1.45rem;
  color: ${UI.color.muted};
  font-size: ${UI.font.hint};
  font-weight: 400;
  line-height: 1.2;
  transform: translateY(-50%);
  white-space: nowrap;
}

${AREA_SELECTORS.page} .mpkr-area-section-heading:hover .mpkr-area-section-hint,
${ROUTE_SELECTORS.page} .mpkr-area-section-heading:hover .mpkr-area-section-hint,
${AREA_SELECTORS.page} .mpkr-area-section-heading:focus-visible .mpkr-area-section-hint,
${ROUTE_SELECTORS.page} .mpkr-area-section-heading:focus-visible .mpkr-area-section-hint {
  color: ${UI.color.linkHover};
}

${AREA_SELECTORS.page} .mpkr-area-section-chevron,
${ROUTE_SELECTORS.page} .mpkr-area-section-chevron {
  position: absolute;
  top: 50%;
  right: 0.35rem;
  width: 0.45rem;
  height: 0.45rem;
  border-right: 1.5px solid currentColor;
  border-bottom: 1.5px solid currentColor;
  transform: translateY(-65%) rotate(45deg);
  transition: transform 160ms ease;
}

${AREA_SELECTORS.page} .mpkr-area-section-heading[aria-expanded="true"] .mpkr-area-section-chevron,
${ROUTE_SELECTORS.page} .mpkr-area-section-heading[aria-expanded="true"] .mpkr-area-section-chevron {
  transform: translateY(-35%) rotate(225deg);
}

${AREA_SELECTORS.page} .mpkr-info-heading > h2,
${ROUTE_SELECTORS.page} .mpkr-info-heading > h2 {
  margin: 0;
}

${AREA_SELECTORS.page} .mpkr-classic-routes-heading {
  box-sizing: border-box;
  width: 100%;
}

@media (max-width: 575px) {
  ${AREA_SELECTORS.page} .mpkr-area-section-heading,
  ${ROUTE_SELECTORS.page} .mpkr-area-section-heading {
    padding-right: 1.6rem;
  }

  ${AREA_SELECTORS.page} .mpkr-area-section-hint,
  ${ROUTE_SELECTORS.page} .mpkr-area-section-hint {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  ${AREA_SELECTORS.page} .mpkr-area-section-chevron,
  ${ROUTE_SELECTORS.page} .mpkr-area-section-chevron,
  ${AREA_SELECTORS.page} .mpkr-area-section-heading,
  ${ROUTE_SELECTORS.page} .mpkr-area-section-heading {
    transition: none;
  }
}
`;

interface SectionState {
  readonly heading: HTMLHeadingElement;
  readonly body: HTMLDivElement;
  readonly marker: Comment;
  readonly nodes: Node[];
  readonly chevron: HTMLSpanElement;
  readonly hint: HTMLSpanElement;
  readonly attributes: ReadonlyMap<string, string | null>;
  readonly onClick: (event: MouseEvent) => void;
  readonly onKeyDown: (event: KeyboardEvent) => void;
  readonly title: string;
  readonly structuralSnapshot?: ElementSnapshot;
  readonly nativeExpanderSnapshot?: HiddenSnapshot;
}

interface ElementSnapshot {
  readonly element: HTMLElement;
  readonly className: string | null;
  readonly style: string | null;
  readonly hidden: string | null;
}

interface HiddenSnapshot {
  readonly element: HTMLElement;
  readonly hidden: string | null;
}

interface InfoHeadingState {
  readonly details: HTMLElement;
  readonly wrapper: HTMLDivElement;
}

interface DecoratedHeadingState {
  readonly heading: HTMLHeadingElement;
  readonly className: string | null;
}

interface AreaHeightWrapperState {
  readonly wrapper: HTMLElement;
  readonly className: string | null;
  readonly style: string | null;
}

function containsAuthoredSection(wrapper: HTMLElement): boolean {
  return Array.from(wrapper.querySelectorAll<HTMLHeadingElement>('h2, h3')).some((heading) => {
    return locateAuthoredSection(heading) !== undefined;
  });
}

type SectionPageKind = 'area' | 'route';

class PageSectionPresentation {
  private readonly sections: SectionState[] = [];
  private readonly infoHeadings: InfoHeadingState[] = [];
  private readonly decoratedHeadings: DecoratedHeadingState[] = [];
  private readonly areaHeightWrappers: AreaHeightWrapperState[] = [];
  private style: HTMLStyleElement | undefined;
  private observer: MutationObserver | undefined;

  constructor(private readonly pageKind: SectionPageKind) {}

  mount(root: ParentNode = document): boolean {
    const pageSelector = this.pageKind === 'area'
      ? AREA_SELECTORS.page
      : ROUTE_SELECTORS.page;
    const pageRoot = root instanceof HTMLElement && root.matches(pageSelector)
      ? root
      : root.querySelector<HTMLElement>(pageSelector);
    if (!pageRoot) {
      return false;
    }

    if (this.pageKind === 'area') {
      this.neutralizeAreaHeightWrappers(pageRoot);
    }
    this.mountInfoHeadings(pageRoot);

    const managedHeadings = new Set(this.sections.map((state) => state.heading));
    this.sections.forEach((state) => this.absorbDynamicBodyNodes(state));
    for (const heading of pageRoot.querySelectorAll<HTMLHeadingElement>('h2, h3')) {
      const title = normalizedSectionHeading(heading);
      if (
        !title
        || managedHeadings.has(heading)
        || (this.pageKind === 'route' && !SECTION_TITLE_TRANSLATIONS[title])
      ) {
        continue;
      }
      const section = locateAuthoredSection(heading);
      if (section) {
        this.collapseSection(
          heading,
          section.structuralNode,
          SECTION_TITLE_TRANSLATIONS[title] ?? title,
        );
      }
    }

    if (this.pageKind === 'area') {
      this.decorateClassicRouteHeadings(pageRoot);
    }

    if (
      !this.sections.length
      && !this.infoHeadings.length
      && !this.decoratedHeadings.length
      && !this.areaHeightWrappers.length
    ) {
      return false;
    }

    if (!this.style) {
      pageRoot.ownerDocument.querySelectorAll(LEGACY_STYLE_SELECTOR)
        .forEach((legacyStyle) => legacyStyle.remove());
      const style = pageRoot.ownerDocument.createElement('style');
      style.setAttribute(STYLE_ATTRIBUTE, 'true');
      style.textContent = STYLE_TEXT;
      pageRoot.ownerDocument.head.append(style);
      this.style = style;
    }
    if (!this.observer) {
      const Observer = pageRoot.ownerDocument.defaultView?.MutationObserver ?? MutationObserver;
      this.observer = new Observer((records) => {
        if (records.some((record) => Array.from(record.addedNodes).some((node) => (
          node instanceof Element
          && !node.matches(
            '.mpkr-area-section-chevron, .mpkr-area-section-hint, .mpkr-area-section-body, .mpkr-info-heading',
          )
        )))) {
          this.mount(pageRoot.ownerDocument);
        }
      });
      this.observer.observe(pageRoot, { childList: true, subtree: true });
    }
    return true;
  }

  destroy(): void {
    this.observer?.disconnect();
    this.observer = undefined;
    for (const state of this.sections) {
      state.heading.removeEventListener('click', state.onClick);
      state.heading.removeEventListener('keydown', state.onKeyDown);
      state.chevron.remove();
      state.hint.remove();
      if (state.nativeExpanderSnapshot) {
        const { element, hidden } = state.nativeExpanderSnapshot;
        if (hidden === null) element.removeAttribute('hidden');
        else element.setAttribute('hidden', hidden);
      }
      for (const [name, value] of state.attributes) {
        if (value === null) {
          state.heading.removeAttribute(name);
        } else {
          state.heading.setAttribute(name, value);
        }
      }
      const parent = state.body.parentNode;
      if (parent) {
        for (const node of state.nodes) {
          parent.insertBefore(node, state.body);
        }
      }
      state.body.remove();
      state.marker.remove();
      if (state.structuralSnapshot) {
        const { element, className, style, hidden } = state.structuralSnapshot;
        if (className === null) element.removeAttribute('class');
        else element.setAttribute('class', className);
        if (style === null) element.removeAttribute('style');
        else element.setAttribute('style', style);
        if (hidden === null) element.removeAttribute('hidden');
        else element.setAttribute('hidden', hidden);
      }
    }

    for (const state of this.infoHeadings) {
      state.wrapper.remove();
    }
    for (const state of this.decoratedHeadings) {
      if (state.className === null) {
        state.heading.removeAttribute('class');
      } else {
        state.heading.setAttribute('class', state.className);
      }
    }
    for (const state of this.areaHeightWrappers) {
      if (state.className === null) {
        state.wrapper.removeAttribute('class');
      } else {
        state.wrapper.setAttribute('class', state.className);
      }
      if (state.style === null) {
        state.wrapper.removeAttribute('style');
      } else {
        state.wrapper.setAttribute('style', state.style);
      }
    }

    this.style?.remove();
    this.style = undefined;
    this.sections.length = 0;
    this.infoHeadings.length = 0;
    this.decoratedHeadings.length = 0;
    this.areaHeightWrappers.length = 0;
  }

  private neutralizeAreaHeightWrappers(pageRoot: HTMLElement): void {
    const managed = new Set(this.areaHeightWrappers.map((state) => state.wrapper));
    pageRoot.querySelectorAll<HTMLElement>(AREA_SELECTORS.constrainedNarrativeWrapper)
      .forEach((wrapper) => {
      if (managed.has(wrapper) || !containsAuthoredSection(wrapper)) {
        return;
      }

      this.areaHeightWrappers.push({
        wrapper,
        className: wrapper.getAttribute('class'),
        style: wrapper.getAttribute('style'),
      });
      wrapper.classList.remove(...AREA_SELECTORS.constrainedNarrativeClasses);
      wrapper.style.removeProperty('max-height');
      wrapper.style.removeProperty('height');
      wrapper.style.removeProperty('overflow');
      wrapper.style.removeProperty('overflow-y');
      if (!wrapper.getAttribute('style')?.trim()) {
        wrapper.removeAttribute('style');
      }
    });
  }

  private collapseSection(
    heading: HTMLHeadingElement,
    bodyNode: Element,
    title: string,
  ): void {
    const ownerDocument = heading.ownerDocument;
    const structuralElement = bodyNode instanceof HTMLElement
      && bodyNode.matches(AREA_SELECTORS.legacyTextSectionBody)
      ? bodyNode
      : undefined;
    const structuralSnapshot = structuralElement
      ? {
          element: structuralElement,
          className: structuralElement.getAttribute('class'),
          style: structuralElement.getAttribute('style'),
          hidden: structuralElement.getAttribute('hidden'),
        }
      : undefined;
    if (structuralElement) {
      structuralElement.classList.remove('collapse', 'show');
      structuralElement.removeAttribute('hidden');
      structuralElement.style.removeProperty('display');
      structuralElement.style.removeProperty('height');
      if (!structuralElement.getAttribute('style')?.trim()) {
        structuralElement.removeAttribute('style');
      }
    }
    const body = ownerDocument.createElement('div');
    body.className = 'mpkr-area-section-body';
    body.id = this.uniqueContentId(ownerDocument);

    const nodes: Node[] = [];
    let node = heading.nextSibling;
    while (node) {
      const next = node.nextSibling;
      if (isAuthoredSectionBoundary(node)) {
        break;
      }
      nodes.push(node);
      node = next;
    }
    if (!nodes.includes(bodyNode)) {
      return;
    }

    const marker = ownerDocument.createComment('mpkr-area-section-body-position');
    bodyNode.parentNode?.insertBefore(marker, nodes[0]!);
    marker.parentNode?.insertBefore(body, marker.nextSibling);
    body.append(...nodes);

    const chevron = ownerDocument.createElement('span');
    chevron.className = 'mpkr-area-section-chevron';
    chevron.setAttribute('aria-hidden', 'true');

    const hint = ownerDocument.createElement('span');
    hint.className = 'mpkr-area-section-hint';
    hint.setAttribute('aria-hidden', 'true');

    const attributeNames = [
      'class',
      'role',
      'tabindex',
      'aria-expanded',
      'aria-controls',
      'aria-label',
      'data-toggle',
      'data-target',
    ];
    const attributes = new Map(attributeNames.map((name) => [name, heading.getAttribute(name)]));
    heading.removeAttribute('data-toggle');
    heading.removeAttribute('data-target');
    const nativeExpander = heading.querySelector<HTMLElement>(AREA_SELECTORS.legacyTextSectionExpander);
    const nativeExpanderSnapshot = nativeExpander
      ? { element: nativeExpander, hidden: nativeExpander.getAttribute('hidden') }
      : undefined;
    nativeExpander?.setAttribute('hidden', '');
    heading.classList.add(
      'title-with-border-bottom',
      'mb-1',
      'mpkr-info-heading',
      'mpkr-area-section-heading',
    );
    heading.setAttribute('role', 'button');
    heading.setAttribute('tabindex', '0');
    heading.setAttribute('aria-controls', body.id);
    heading.append(hint, chevron);

    const onClick = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest('a, button, input, select, textarea')) {
        return;
      }
      const state = this.sections.find((candidate) => candidate.heading === heading);
      if (state) {
        this.setExpanded(state, body.hasAttribute('hidden'));
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }
      event.preventDefault();
      const state = this.sections.find((candidate) => candidate.heading === heading);
      if (state) {
        this.setExpanded(state, body.hasAttribute('hidden'));
      }
    };
    heading.addEventListener('click', onClick);
    heading.addEventListener('keydown', onKeyDown);

    const state: SectionState = {
      heading,
      body,
      marker,
      nodes,
      chevron,
      hint,
      attributes,
      onClick,
      onKeyDown,
      title,
      structuralSnapshot,
      nativeExpanderSnapshot,
    };
    this.sections.push(state);
    this.setExpanded(state, false);
  }

  private setExpanded(state: SectionState, expanded: boolean): void {
    state.body.hidden = !expanded;
    state.heading.setAttribute('aria-expanded', String(expanded));
    state.heading.setAttribute('aria-label', `${state.title} ${expanded ? '내용 접기' : '내용 펼치기'}`);
    state.hint.textContent = expanded ? '눌러서 접기' : '눌러서 내용 보기';
  }

  private absorbDynamicBodyNodes(state: SectionState): void {
    let sibling = state.body.nextSibling;
    while (sibling) {
      if (isAuthoredSectionBoundary(sibling)) {
        break;
      }
      const next = sibling.nextSibling;
      state.nodes.push(sibling);
      state.body.append(sibling);
      sibling = next;
    }
  }


  private mountInfoHeadings(pageRoot: HTMLElement): void {
    const selector = this.pageKind === 'area'
      ? `${AREA_SELECTORS.page} .description-details`
      : `${ROUTE_SELECTORS.page} ${ROUTE_SELECTORS.mainContent} .description-details`;
    const title = this.pageKind === 'area' ? '지역 정보' : '루트 정보';
    const managedDetails = new Set(this.infoHeadings.map((state) => state.details));

    pageRoot.ownerDocument.querySelectorAll<HTMLElement>(selector).forEach((details) => {
      if (managedDetails.has(details)) {
        return;
      }
      const wrapper = details.ownerDocument.createElement('div');
      wrapper.className = 'title-with-border-bottom mb-1 mpkr-info-heading';
      const heading = details.ownerDocument.createElement('h2');
      heading.textContent = title;
      wrapper.append(heading);
      details.before(wrapper);
      this.infoHeadings.push({ details, wrapper });
    });
  }

  private decorateClassicRouteHeadings(pageRoot: HTMLElement): void {
    const managed = new Set(this.decoratedHeadings.map((state) => state.heading));
    pageRoot.querySelectorAll<HTMLHeadingElement>('h2, h3').forEach((heading) => {
      const title = normalizedSectionHeading(heading);
      if (
        managed.has(heading)
        || (!title.startsWith('Classic Climbing Routes') && !title.startsWith('클래식 루트'))
      ) {
        return;
      }
      this.decoratedHeadings.push({
        heading,
        className: heading.getAttribute('class'),
      });
      heading.classList.add(
        'title-with-border-bottom',
        'mb-1',
        'mpkr-info-heading',
        'mpkr-classic-routes-heading',
      );
    });
  }

  private uniqueContentId(ownerDocument: Document): string {
    let index = this.sections.length + 1;
    let id = `mpkr-area-section-${index}`;
    while (ownerDocument.getElementById(id)) {
      index += 1;
      id = `mpkr-area-section-${index}`;
    }
    return id;
  }

}

export class AreaPageSectionPresentation extends PageSectionPresentation {
  constructor() {
    super('area');
  }
}

export class RoutePageSectionPresentation extends PageSectionPresentation {
  constructor() {
    super('route');
  }
}
