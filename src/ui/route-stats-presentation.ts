const STYLE_MARKER = 'data-mpkr-route-stats-presentation';
const COMPACT_COLUMN_CLASS = 'mpkr-route-stats-compact-column';
const TICKS_COLUMN_CLASS = 'mpkr-route-stats-ticks-column';
const VIEWPORT_CLASS = 'mpkr-route-stats-list-viewport';
const SCROLLABLE_CLASS = 'mpkr-route-stats-list-viewport--scrollable';
const TABLE_CLASS = 'mpkr-route-stats-list-table';
const MORE_CLASS = 'mpkr-route-stats-more';
const ROW_LIMIT = 5;
const FALLBACK_ROW_HEIGHT_PX = 36;

interface CompactSectionDefinition {
  readonly sourceLabels: readonly string[];
  readonly translatedLabel: string;
}

const COMPACT_SECTIONS: readonly CompactSectionDefinition[] = [
  {
    sourceLabels: ['Suggested Ratings', '추천 난이도', '체감 난이도'],
    translatedLabel: '체감 난이도',
  },
  {
    sourceLabels: ['Star Ratings', 'Star Distribution', '별점 분포', '사용자 별점'],
    translatedLabel: '사용자 별점',
  },
  {
    sourceLabels: ['On To-Do Lists', 'To-Do Lists', '할 일 목록 등록', '등반 예정자'],
    translatedLabel: '등반 예정자',
  },
] as const;

const TICKS_LABELS = ['Ticks', '등반 기록'] as const;

const STYLE_TEXT = `
#route-stats .${COMPACT_COLUMN_CLASS} {
  max-height: none !important;
  overflow: visible !important;
  margin-bottom: 0.25rem !important;
}

#route-stats .${VIEWPORT_CLASS} {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  margin: 0 0 0.25rem;
}

#route-stats .${VIEWPORT_CLASS}.${SCROLLABLE_CLASS} {
  max-height: var(--mpkr-stats-five-row-height, ${FALLBACK_ROW_HEIGHT_PX * ROW_LIMIT}px);
  overflow-x: auto;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
}

#route-stats .${VIEWPORT_CLASS} > .${TABLE_CLASS} {
  width: 100%;
  min-width: 100%;
  margin-bottom: 0 !important;
}

#route-stats .${VIEWPORT_CLASS} td {
  overflow-wrap: anywhere;
}

#route-stats .${MORE_CLASS} {
  position: static !important;
  inset: auto !important;
  display: flex !important;
  align-items: center !important;
  width: 100% !important;
  height: auto !important;
  min-height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  background: none !important;
}

#route-stats .${TICKS_COLUMN_CLASS} {
  margin-top: 0.25rem !important;
}

@media (max-width: 767px) {
  #route-stats .${VIEWPORT_CLASS} {
    max-width: 100%;
  }

  #route-stats .${VIEWPORT_CLASS} > .${TABLE_CLASS} {
    font-size: inherit;
  }
}
`;

interface ManagedSection {
  readonly section: HTMLElement;
  readonly table: HTMLTableElement;
  readonly viewport: HTMLDivElement;
  readonly label: string;
}

function normalizeText(value: string | null | undefined): string {
  return value?.replace(/\s+/g, ' ').trim() ?? '';
}

function headingLeadText(heading: HTMLHeadingElement): string {
  const directText = Array.from(heading.childNodes)
    .filter((node): node is Text => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.nodeValue ?? '')
    .join(' ');
  return normalizeText(directText || heading.textContent).replace(/\s+[\d,]+$/, '');
}

function definitionFor(heading: HTMLHeadingElement): CompactSectionDefinition | undefined {
  const label = headingLeadText(heading);
  return COMPACT_SECTIONS.find((definition) => definition.sourceLabels.includes(label));
}

function isTicksHeading(heading: HTMLHeadingElement): boolean {
  return TICKS_LABELS.includes(headingLeadText(heading) as (typeof TICKS_LABELS)[number]);
}

function directTextNode(heading: HTMLHeadingElement): Text | undefined {
  return Array.from(heading.childNodes).find(
    (node): node is Text => node.nodeType === Node.TEXT_NODE && Boolean(node.nodeValue?.trim()),
  );
}

function withOriginalWhitespace(original: string, replacement: string): string {
  const leading = original.match(/^\s*/)?.[0] ?? '';
  const trailing = original.match(/\s*$/)?.[0] ?? '';
  return `${leading}${replacement}${trailing}`;
}

function componentSectionFor(heading: HTMLHeadingElement): HTMLElement | undefined {
  const section = heading.parentElement;
  return section && directTableFor(section) ? section : undefined;
}

function directTableFor(section: HTMLElement): HTMLTableElement | undefined {
  return Array.from(section.children).find(
    (child): child is HTMLTableElement => child.tagName === 'TABLE',
  );
}

function layoutColumnFor(section: HTMLElement): HTMLElement {
  const parent = section.parentElement;
  return parent instanceof HTMLElement && (
    parent.classList.contains('max-height')
    || Array.from(parent.classList).some((name) => name.startsWith('col-'))
  )
    ? parent
    : section;
}

function directChildContaining(parent: HTMLElement, child: HTMLElement): HTMLElement | undefined {
  return Array.from(parent.children).find(
    (candidate): candidate is HTMLElement => candidate instanceof HTMLElement && candidate.contains(child),
  );
}

function showMoreContainer(section: HTMLElement): HTMLElement | undefined {
  const button = Array.from(section.querySelectorAll<HTMLButtonElement>('button')).find((candidate) => {
    const label = normalizeText(candidate.textContent);
    return label === 'Show More' || label === '더 보기';
  });
  return button ? directChildContaining(section, button) : undefined;
}

function rowsFor(table: HTMLTableElement): HTMLTableRowElement[] {
  const body = table.tBodies.item(0);
  return body
    ? Array.from(body.children).filter(
      (row): row is HTMLTableRowElement => row.tagName === 'TR',
    )
    : [];
}

function measuredFiveRowHeight(rows: readonly HTMLTableRowElement[]): number {
  const heights = rows.slice(0, ROW_LIMIT).map((row) => {
    const rectHeight = row.getBoundingClientRect().height;
    return rectHeight > 0 ? rectHeight : row.offsetHeight;
  });
  if (heights.length === ROW_LIMIT && heights.every((height) => height > 0)) {
    return Math.ceil(heights.reduce((sum, height) => sum + height, 0));
  }
  return FALLBACK_ROW_HEIGHT_PX * ROW_LIMIT;
}

function restoreAttribute(element: Element, name: string, value: string | null): void {
  if (value === null) {
    element.removeAttribute(name);
  } else {
    element.setAttribute(name, value);
  }
}

export class RouteStatsPresentation {
  private root: ParentNode | undefined;
  private stats: HTMLElement | undefined;
  private style: HTMLStyleElement | undefined;
  private observer: MutationObserver | undefined;
  private readonly sections = new Map<HTMLTableElement, ManagedSection>();
  private readonly classSnapshots = new Map<HTMLElement, string | null>();
  private readonly headingSnapshots = new Map<Text, string>();
  private refreshQueued = false;
  private measurementFrame: number | undefined;
  private readonly handleResize = (): void => this.refresh();

  mount(root: ParentNode = document): boolean {
    if (this.root) {
      this.refresh();
      return true;
    }
    const stats = root.querySelector<HTMLElement>('#route-stats');
    const ownerDocument = stats?.ownerDocument;
    if (!stats || !ownerDocument?.head) {
      return false;
    }

    this.root = root;
    this.stats = stats;
    const style = ownerDocument.createElement('style');
    style.setAttribute(STYLE_MARKER, 'styles');
    style.textContent = STYLE_TEXT;
    ownerDocument.head.append(style);
    this.style = style;
    this.refresh();

    const Observer = ownerDocument.defaultView?.MutationObserver ?? MutationObserver;
    this.observer = new Observer(() => this.queueRefresh());
    this.observer.observe(stats, { childList: true, characterData: true, subtree: true });
    ownerDocument.defaultView?.addEventListener('resize', this.handleResize);
    return true;
  }

  destroy(): void {
    this.observer?.disconnect();
    this.observer = undefined;
    const ownerDocument = this.style?.ownerDocument;
    ownerDocument?.defaultView?.removeEventListener('resize', this.handleResize);
    if (this.measurementFrame !== undefined) {
      ownerDocument?.defaultView?.cancelAnimationFrame?.(this.measurementFrame);
      this.measurementFrame = undefined;
    }

    for (const [node, original] of this.headingSnapshots) {
      if (node.isConnected) {
        node.nodeValue = original;
      }
    }
    for (const managed of this.sections.values()) {
      if (managed.viewport.isConnected && managed.table.parentElement === managed.viewport) {
        managed.viewport.replaceWith(managed.table);
      }
    }
    for (const [element, className] of this.classSnapshots) {
      if (element.isConnected) {
        restoreAttribute(element, 'class', className);
      }
    }

    this.style?.remove();
    this.style = undefined;
    this.sections.clear();
    this.classSnapshots.clear();
    this.headingSnapshots.clear();
    this.root = undefined;
    this.stats = undefined;
    this.refreshQueued = false;
  }

  private queueRefresh(): void {
    if (this.refreshQueued) {
      return;
    }
    this.refreshQueued = true;
    queueMicrotask(() => {
      this.refreshQueued = false;
      this.refresh();
    });
  }

  private refresh(): void {
    if (!this.stats) {
      return;
    }

    const headings = Array.from(
      this.stats.querySelectorAll<HTMLHeadingElement>('.onx-stats-table h3'),
    );
    for (const heading of headings) {
      const definition = definitionFor(heading);
      if (definition) {
        this.prepareCompactSection(heading, definition);
      } else if (isTicksHeading(heading)) {
        const section = componentSectionFor(heading);
        if (section) {
          this.addClass(layoutColumnFor(section), TICKS_COLUMN_CLASS);
        }
      }
    }

    for (const managed of this.sections.values()) {
      if (managed.table.isConnected) {
        this.updateViewport(managed);
      }
    }
    this.scheduleMeasurement();
  }

  private prepareCompactSection(
    heading: HTMLHeadingElement,
    definition: CompactSectionDefinition,
  ): void {
    const section = componentSectionFor(heading);
    const table = section ? directTableFor(section) : undefined;
    if (!section || !table) {
      return;
    }

    this.translateHeading(heading, definition.translatedLabel);
    this.addClass(layoutColumnFor(section), COMPACT_COLUMN_CLASS);
    this.addClass(table, TABLE_CLASS);

    let managed = this.sections.get(table);
    if (!managed) {
      const viewport = table.ownerDocument.createElement('div');
      viewport.className = VIEWPORT_CLASS;
      table.before(viewport);
      viewport.append(table);
      managed = {
        section,
        table,
        viewport,
        label: definition.translatedLabel,
      };
      this.sections.set(table, managed);
    }

    const more = showMoreContainer(section);
    if (more && !managed.viewport.contains(more)) {
      this.addClass(more, MORE_CLASS);
    }
    this.updateViewport(managed);
  }

  private updateViewport(managed: ManagedSection): void {
    const rows = rowsFor(managed.table);
    const scrollable = rows.length > ROW_LIMIT;
    managed.viewport.classList.toggle(SCROLLABLE_CLASS, scrollable);
    if (scrollable) {
      managed.viewport.style.setProperty(
        '--mpkr-stats-five-row-height',
        `${measuredFiveRowHeight(rows)}px`,
      );
      managed.viewport.tabIndex = 0;
      managed.viewport.setAttribute('role', 'region');
      managed.viewport.setAttribute(
        'aria-label',
        `${managed.label} 목록, ${ROW_LIMIT}명씩 스크롤`,
      );
    } else {
      managed.viewport.style.removeProperty('--mpkr-stats-five-row-height');
      managed.viewport.removeAttribute('tabindex');
      managed.viewport.removeAttribute('role');
      managed.viewport.removeAttribute('aria-label');
    }
  }

  private scheduleMeasurement(): void {
    const ownerWindow = this.stats?.ownerDocument.defaultView;
    if (!ownerWindow?.requestAnimationFrame || this.measurementFrame !== undefined) {
      return;
    }
    this.measurementFrame = ownerWindow.requestAnimationFrame(() => {
      this.measurementFrame = undefined;
      for (const managed of this.sections.values()) {
        if (managed.table.isConnected) {
          this.updateViewport(managed);
        }
      }
    });
  }

  private translateHeading(heading: HTMLHeadingElement, translated: string): void {
    const node = directTextNode(heading);
    if (!node) {
      return;
    }
    if (!this.headingSnapshots.has(node)) {
      this.headingSnapshots.set(node, node.nodeValue ?? '');
    }
    const next = withOriginalWhitespace(node.nodeValue ?? '', translated);
    if (node.nodeValue !== next) {
      node.nodeValue = next;
    }
  }

  private addClass(element: HTMLElement, className: string): void {
    if (!this.classSnapshots.has(element)) {
      this.classSnapshots.set(element, element.getAttribute('class'));
    }
    element.classList.add(className);
  }
}
