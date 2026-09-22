const SECTION_TITLES: Readonly<Record<string, string>> = {
  Description: '설명',
  '설명': '설명',
  'Getting There': '가는 방법',
  '가는 방법': '가는 방법',
  Location: '위치',
  '위치': '위치',
  Protection: '보호 장비',
  '보호 장비': '보호 장비',
  Descent: '하강',
  '하강': '하강',
};
const UNLABELED_AREA = '지역 미표시';
const AREA_HEIGHT_WRAPPER_SELECTOR = [
  '.max-height',
  '.max-height-xs-600',
  '.max-height-md-600',
  '.max-height-processed',
].join('');
const AREA_HEIGHT_CLASSES = [
  'max-height',
  'max-height-xs-600',
  'max-height-md-600',
  'max-height-processed',
] as const;

const STYLE_TEXT = `
#climb-area-page .mpkr-area-section-heading,
#route-page .mpkr-area-section-heading {
  position: relative;
  display: block;
  box-sizing: border-box;
  width: 100%;
  padding-right: 10.25rem;
  text-indent: 0;
  cursor: pointer;
  user-select: none;
  border-radius: 2px 2px 0 0;
  transition: background-color 150ms ease, color 150ms ease;
}

#climb-area-page .mpkr-area-section-heading:hover,
#route-page .mpkr-area-section-heading:hover {
  background: rgba(0, 96, 169, 0.12);
  color: #004b84;
}

#climb-area-page .mpkr-area-section-heading:focus-visible,
#route-page .mpkr-area-section-heading:focus-visible {
  outline: 3px solid #0060a9;
  outline-offset: 2px;
  background: rgba(0, 96, 169, 0.14);
  color: #003e70;
}

#climb-area-page .mpkr-area-section-hint,
#route-page .mpkr-area-section-hint {
  position: absolute;
  top: 50%;
  right: 1.45rem;
  color: #7a8791;
  font-size: 0.9rem;
  font-weight: 400;
  line-height: 1.2;
  transform: translateY(-50%);
  white-space: nowrap;
}

#climb-area-page .mpkr-area-section-heading:hover .mpkr-area-section-hint,
#route-page .mpkr-area-section-heading:hover .mpkr-area-section-hint,
#climb-area-page .mpkr-area-section-heading:focus-visible .mpkr-area-section-hint,
#route-page .mpkr-area-section-heading:focus-visible .mpkr-area-section-hint {
  color: #004f8c;
}

#climb-area-page .mpkr-area-section-chevron,
#route-page .mpkr-area-section-chevron {
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

#climb-area-page .mpkr-area-section-heading[aria-expanded="true"] .mpkr-area-section-chevron,
#route-page .mpkr-area-section-heading[aria-expanded="true"] .mpkr-area-section-chevron {
  transform: translateY(-35%) rotate(225deg);
}

#climb-area-page .mpkr-info-heading > h2,
#route-page .mpkr-info-heading > h2 {
  margin: 0;
}

#climb-area-page .mpkr-classic-routes-heading {
  box-sizing: border-box;
  width: 100%;
}

@media (max-width: 575px) {
  #climb-area-page .mpkr-area-section-heading,
  #route-page .mpkr-area-section-heading {
    padding-right: 1.6rem;
  }

  #climb-area-page .mpkr-area-section-hint,
  #route-page .mpkr-area-section-hint {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  #climb-area-page .mpkr-area-section-chevron,
  #route-page .mpkr-area-section-chevron,
  #climb-area-page .mpkr-area-section-heading,
  #route-page .mpkr-area-section-heading {
    transition: none;
  }
}

#climb-area-page tr.mpkr-area-route-group-heading > th {
  padding: 0.45rem 0.75rem;
  background: #e8f0eb;
  color: #294c39;
  font-size: 0.85rem;
  text-align: left;
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
}

interface RowState {
  readonly row: HTMLTableRowElement;
  readonly marker: Comment;
}

interface GroupState {
  readonly wrapper: HTMLTableSectionElement;
  readonly heading: HTMLTableRowElement;
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

interface AreaLabel {
  readonly key: string;
  readonly label: string;
}

function normalizedHeadingText(heading: HTMLHeadingElement): string {
  return Array.from(heading.childNodes)
    .filter((node) => (
      node.nodeType !== 8
      && (!(node instanceof HTMLElement) || !node.matches(
        'a, button, .mpkr-area-section-hint, .mpkr-area-section-chevron',
      ))
    ))
    .map((node) => node.textContent ?? '')
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function containsAreaNarrative(wrapper: HTMLElement): boolean {
  return Array.from(wrapper.querySelectorAll<HTMLHeadingElement>('h2, h3')).some((heading) => {
    const title = normalizedHeadingText(heading);
    return (title === 'Description' || title === '설명'
      || title === 'Getting There' || title === '가는 방법')
      && directSectionBodyNode(heading) !== undefined;
  });
}

function directSectionBodyNode(heading: HTMLHeadingElement): Element | undefined {
  let sibling = heading.nextElementSibling;
  while (sibling) {
    if (isHeadingBoundary(sibling)) {
      return undefined;
    }
    if (sibling.classList.contains('fr-view')) {
      return sibling;
    }
    const nested = sibling.querySelector('.fr-view');
    if (nested) {
      return sibling;
    }
    sibling = sibling.nextElementSibling;
  }
  return undefined;
}

function isHeadingBoundary(node: Node): boolean {
  return node instanceof Element
    && (node.matches('h1, h2, h3') || node.querySelector('h1, h2, h3') !== null);
}

function areaKey(anchor: HTMLAnchorElement): string | undefined {
  try {
    const path = new URL(anchor.href, document.baseURI).pathname.replace(/\/+$/, '');
    return path.match(/^\/area\/(\d+)(?:\/|$)/)?.[1];
  } catch {
    return undefined;
  }
}

function normalizedAreaLabel(anchor: HTMLAnchorElement): string | undefined {
  const label = anchor.textContent?.replace(/\s+/g, ' ').trim();
  return label || undefined;
}

function isTruncatedLabel(label: string): boolean {
  return /(?:\u2026|\.\.\.)/.test(label);
}

function isBetterAreaLabel(current: string, candidate: string): boolean {
  const currentTruncated = isTruncatedLabel(current);
  const candidateTruncated = isTruncatedLabel(candidate);
  if (currentTruncated !== candidateTruncated) {
    return !candidateTruncated;
  }
  return candidate.length > current.length;
}

function canonicalAreaLabels(root: ParentNode): ReadonlyMap<string, string> {
  const labels = new Map<string, string>();
  root.querySelectorAll<HTMLAnchorElement>('a[href*="/area/"]').forEach((anchor) => {
    const key = areaKey(anchor);
    const candidate = normalizedAreaLabel(anchor);
    if (!key || !candidate) {
      return;
    }

    const current = labels.get(key);
    if (!current || isBetterAreaLabel(current, candidate)) {
      labels.set(key, candidate);
    }
  });
  return labels;
}

function directRouteRows(table: HTMLTableElement): HTMLTableRowElement[] {
  const rows: HTMLTableRowElement[] = [];
  for (const child of Array.from(table.children)) {
    if (child instanceof HTMLTableRowElement && child.classList.contains('route-row')) {
      rows.push(child);
      continue;
    }
    if (!(child instanceof HTMLTableSectionElement) || child.dataset.mpkrAreaRouteGroup) {
      continue;
    }
    for (const row of Array.from(child.children)) {
      if (row instanceof HTMLTableRowElement && row.classList.contains('route-row')) {
        rows.push(row);
      }
    }
  }
  return rows;
}

function explicitArea(
  row: HTMLTableRowElement,
  labels: ReadonlyMap<string, string>,
): AreaLabel | undefined {
  for (const anchor of Array.from(row.querySelectorAll<HTMLAnchorElement>('a[href]'))) {
    const key = areaKey(anchor);
    if (!key) {
      continue;
    }
    const label = labels.get(key) ?? normalizedAreaLabel(anchor);
    if (label) {
      return { key, label };
    }
  }
  return undefined;
}

function classicRouteTables(root: ParentNode): HTMLTableElement[] {
  const headings = root.querySelectorAll<HTMLHeadingElement>('#climb-area-page h2');
  const tables = new Set<HTMLTableElement>();
  for (const heading of headings) {
    const title = normalizedHeadingText(heading);
    if (!title.startsWith('Classic Climbing Routes') && !title.startsWith('클래식 루트')) {
      continue;
    }
    const section = heading.closest('.text-section');
    let sibling = section?.nextElementSibling;
    while (sibling && !sibling.classList.contains('text-section')) {
      if (sibling.classList.contains('table-responsive')) {
        sibling.querySelectorAll<HTMLTableElement>('table.route-table').forEach((table) => tables.add(table));
        break;
      }
      sibling = sibling.nextElementSibling;
    }
  }
  return Array.from(tables);
}

function columnCount(table: HTMLTableElement): number {
  const header = table.querySelector<HTMLTableRowElement>('tr.screen-reader-only');
  return Math.max(header?.children.length ?? 0, 1);
}

export class SouthKoreaAreaPriority {
  private readonly sections: SectionState[] = [];
  private readonly infoHeadings: InfoHeadingState[] = [];
  private readonly decoratedHeadings: DecoratedHeadingState[] = [];
  private readonly areaHeightWrappers: AreaHeightWrapperState[] = [];
  private readonly rows: RowState[] = [];
  private readonly groups: GroupState[] = [];
  private style: HTMLStyleElement | undefined;
  private observer: MutationObserver | undefined;

  mount(root: ParentNode = document): boolean {
    const pageRoot = root.querySelector<HTMLElement>('#climb-area-page, #route-page');
    if (!pageRoot) {
      return false;
    }

    if (pageRoot.id === 'climb-area-page') {
      this.neutralizeAreaHeightWrappers(pageRoot);
    }
    this.mountInfoHeadings(pageRoot);

    const managedHeadings = new Set(this.sections.map((state) => state.heading));
    this.sections.forEach((state) => this.absorbDynamicBodyNodes(state));
    for (const heading of pageRoot.querySelectorAll<HTMLHeadingElement>('h2, h3')) {
      const title = normalizedHeadingText(heading);
      const label = SECTION_TITLES[title];
      if (!label || managedHeadings.has(heading)) {
        continue;
      }
      const bodyNode = directSectionBodyNode(heading);
      if (bodyNode) {
        this.collapseSection(heading, bodyNode, label);
      }
    }

    if (pageRoot.id === 'climb-area-page') {
      this.decorateClassicRouteHeadings(pageRoot);
      const labels = canonicalAreaLabels(pageRoot);
      for (const table of classicRouteTables(pageRoot)) {
        this.groupRoutes(table, labels);
      }
    }

    if (
      !this.sections.length
      && !this.groups.length
      && !this.infoHeadings.length
      && !this.decoratedHeadings.length
      && !this.areaHeightWrappers.length
    ) {
      return false;
    }

    if (!this.style) {
      const style = pageRoot.ownerDocument.createElement('style');
      style.dataset.mpkrAreaPriority = 'styles';
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

    for (const state of this.rows) {
      if (state.marker.parentNode) {
        state.marker.parentNode.replaceChild(state.row, state.marker);
      }
    }
    for (const group of this.groups) {
      group.wrapper.remove();
    }

    this.style?.remove();
    this.style = undefined;
    this.sections.length = 0;
    this.infoHeadings.length = 0;
    this.decoratedHeadings.length = 0;
    this.areaHeightWrappers.length = 0;
    this.rows.length = 0;
    this.groups.length = 0;
  }

  private neutralizeAreaHeightWrappers(pageRoot: HTMLElement): void {
    const managed = new Set(this.areaHeightWrappers.map((state) => state.wrapper));
    pageRoot.querySelectorAll<HTMLElement>(AREA_HEIGHT_WRAPPER_SELECTOR).forEach((wrapper) => {
      if (managed.has(wrapper) || !containsAreaNarrative(wrapper)) {
        return;
      }

      this.areaHeightWrappers.push({
        wrapper,
        className: wrapper.getAttribute('class'),
        style: wrapper.getAttribute('style'),
      });
      wrapper.classList.remove(...AREA_HEIGHT_CLASSES);
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
    const body = ownerDocument.createElement('div');
    body.className = 'mpkr-area-section-body';
    body.id = this.uniqueContentId(ownerDocument);

    const nodes: Node[] = [];
    let node = heading.nextSibling;
    while (node) {
      const next = node.nextSibling;
      if (isHeadingBoundary(node)) {
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

    const attributeNames = ['class', 'role', 'tabindex', 'aria-expanded', 'aria-controls', 'aria-label'];
    const attributes = new Map(attributeNames.map((name) => [name, heading.getAttribute(name)]));
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
      if (isHeadingBoundary(sibling)) {
        break;
      }
      const next = sibling.nextSibling;
      state.nodes.push(sibling);
      state.body.append(sibling);
      sibling = next;
    }
  }


  private mountInfoHeadings(pageRoot: HTMLElement): void {
    const pageKind = pageRoot.id === 'climb-area-page' ? 'area' : 'route';
    const selector = pageKind === 'area'
      ? '#climb-area-page .description-details'
      : '#route-page .main-content .description-details';
    const title = pageKind === 'area' ? '지역 정보' : '루트 정보';
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
      const title = normalizedHeadingText(heading);
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

  private groupRoutes(table: HTMLTableElement, labels: ReadonlyMap<string, string>): void {
    const rows = directRouteRows(table);
    if (!rows.length) {
      return;
    }

    const grouped = new Map<string, { label: string; rows: HTMLTableRowElement[] }>();
    rows.forEach((row) => {
      const area = explicitArea(row, labels);
      const key = area?.key ?? UNLABELED_AREA;
      const group = grouped.get(key) ?? { label: area?.label ?? UNLABELED_AREA, rows: [] };
      group.rows.push(row);
      grouped.set(key, group);
    });

    for (const row of rows) {
      const marker = row.ownerDocument.createComment('mpkr-area-route-position');
      row.parentNode?.insertBefore(marker, row);
      this.rows.push({ row, marker });
    }

    for (const group of grouped.values()) {
      const wrapper = table.ownerDocument.createElement('tbody');
      wrapper.dataset.mpkrAreaRouteGroup = group.label;
      const heading = table.ownerDocument.createElement('tr');
      heading.className = 'mpkr-area-route-group-heading';
      const cell = table.ownerDocument.createElement('th');
      cell.scope = 'rowgroup';
      cell.colSpan = columnCount(table);
      cell.textContent = group.label;
      heading.append(cell);
      wrapper.append(heading, ...group.rows);
      table.append(wrapper);
      this.groups.push({ wrapper, heading });
    }
  }
}
