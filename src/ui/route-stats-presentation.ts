import { UI } from './design-tokens';
import { STATS_SELECTORS } from '../sites/mountain-project/contract/selectors/stats';
import { BOOTSTRAP_COLUMN_CLASS_PREFIX } from '../sites/mountain-project/contract/selectors/shared';
import {
  COMPACT_STATS_SECTIONS,
  type CompactStatsSectionContract,
} from '../sites/mountain-project/contract/text/stats';
import { locateStatsTicksSection } from '../sites/mountain-project/dom/route-stats-layout';
import { StatsProgressiveList } from './stats-progressive-list';

const STYLE_MARKER = 'data-mpkr-route-stats-presentation';
const COMPACT_COLUMN_CLASS = 'mpkr-route-stats-compact-column';
const TICKS_COLUMN_CLASS = 'mpkr-route-stats-ticks-column';
const TICKS_VIEWPORT_CLASS = 'mpkr-route-stats-ticks-viewport';
const VIEWPORT_CLASS = 'mpkr-route-stats-list-viewport';
const SCROLLABLE_CLASS = 'mpkr-route-stats-list-viewport--scrollable';
const SCROLL_AFFORDANCE_CLASS = 'mpkr-route-stats-scroll-affordance';
const SCROLL_AFFORDANCE_HIDDEN_CLASS = 'mpkr-route-stats-scroll-affordance--hidden';
const TABLE_CLASS = 'mpkr-route-stats-list-table';
const MORE_CLASS = 'mpkr-route-stats-more';
const PARTNER_FINDER_CELL_CLASS = 'mpkr-route-stats-partner-finder-cell';
const PARTNER_FINDER_NAME_CLASS = 'mpkr-route-stats-partner-finder-name';
const PARTNER_FINDER_LABEL_CLASS = 'mpkr-route-stats-partner-finder-label';
const ROW_LIMIT = 5;
const FALLBACK_ROW_HEIGHT_PX = 36;
const TICKS_DESKTOP_MAX_HEIGHT_PX = 500;
const TICKS_MOBILE_MAX_HEIGHT_PX = 200;

const STYLE_TEXT = `
${STATS_SELECTORS.root} .${VIEWPORT_CLASS} [hidden],
${STATS_SELECTORS.root} .${TICKS_VIEWPORT_CLASS} [hidden] {
  display: none !important;
}
${STATS_SELECTORS.root} .${COMPACT_COLUMN_CLASS} {
  box-sizing: border-box;
  flex: 1 1 33.333333% !important;
  width: 33.333333% !important;
  min-width: 0 !important;
  max-width: 33.333333% !important;
  max-height: none !important;
  overflow: visible !important;
  margin-bottom: 0.25rem !important;
}

${STATS_SELECTORS.root} .${VIEWPORT_CLASS} {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  height: var(--mpkr-stats-five-row-height, ${FALLBACK_ROW_HEIGHT_PX * ROW_LIMIT}px);
  margin: 0 0 0.25rem;
  overflow: hidden;
}

${STATS_SELECTORS.root} .${VIEWPORT_CLASS}.${SCROLLABLE_CLASS} {
  max-height: var(--mpkr-stats-five-row-height, ${FALLBACK_ROW_HEIGHT_PX * ROW_LIMIT}px);
  overflow-x: auto;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
}

${STATS_SELECTORS.root} .${SCROLL_AFFORDANCE_CLASS} {
  position: sticky;
  z-index: 2;
  bottom: 0;
  left: 0;
  box-sizing: border-box;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 0.25rem;
  width: 100%;
  height: 1.75rem;
  margin-top: -1.75rem;
  padding: 0 0 0.2rem;
  color: #444;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.96) 68%);
  font-size: ${UI.font.caption};
  font-weight: 600;
  line-height: 1;
  pointer-events: none;
  opacity: 1;
  transition: opacity 140ms ease, visibility 140ms ease;
}

${STATS_SELECTORS.root} .${SCROLL_AFFORDANCE_CLASS} > span:last-child {
  font-size: 1rem;
  line-height: 0.75;
}

${STATS_SELECTORS.root} .${SCROLL_AFFORDANCE_CLASS}.${SCROLL_AFFORDANCE_HIDDEN_CLASS} {
  opacity: 0;
  visibility: hidden;
}

${STATS_SELECTORS.root} .${VIEWPORT_CLASS} > .${TABLE_CLASS} {
  width: 100%;
  min-width: 100%;
  margin-bottom: 0 !important;
}

${STATS_SELECTORS.root} .${VIEWPORT_CLASS} td {
  overflow-wrap: anywhere;
}

${STATS_SELECTORS.root} .${PARTNER_FINDER_CELL_CLASS} {
  box-sizing: border-box;
  display: flex;
  align-items: baseline;
  gap: 0.375rem;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}

${STATS_SELECTORS.root} .${PARTNER_FINDER_NAME_CLASS} {
  display: block;
  flex: 1 1 auto;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

${STATS_SELECTORS.root} .${PARTNER_FINDER_LABEL_CLASS} {
  display: block;
  flex: 0 0 auto;
  width: auto;
  min-width: 0;
  white-space: nowrap;
}

${STATS_SELECTORS.root} .${MORE_CLASS} {
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

${STATS_SELECTORS.root} .${TICKS_COLUMN_CLASS} {
  box-sizing: border-box;
  float: none !important;
  clear: both;
  flex: 0 0 100% !important;
  width: 100% !important;
  min-width: 0 !important;
  max-width: none !important;
  max-height: none !important;
  overflow: visible !important;
  margin-top: 0.25rem !important;
}

${STATS_SELECTORS.root} .${TICKS_VIEWPORT_CLASS} {
  box-sizing: border-box;
  width: 100%;
  max-height: ${TICKS_DESKTOP_MAX_HEIGHT_PX}px !important;
  overflow-x: auto !important;
  overflow-y: auto !important;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
}

${STATS_SELECTORS.root} .${TICKS_VIEWPORT_CLASS} > table {
  width: 100%;
  min-width: 100%;
  margin-bottom: 0 !important;
}

@media (prefers-reduced-motion: reduce) {
  ${STATS_SELECTORS.root} .${SCROLL_AFFORDANCE_CLASS} {
    transition: none;
  }
}


@media (max-width: 767px) {
  ${STATS_SELECTORS.root} .${COMPACT_COLUMN_CLASS} {
    flex: 0 0 100% !important;
    width: 100% !important;
    max-width: 100% !important;
  }

  ${STATS_SELECTORS.root} .${VIEWPORT_CLASS} {
    max-width: 100%;
  }

  ${STATS_SELECTORS.root} .${VIEWPORT_CLASS} > .${TABLE_CLASS} {
    font-size: inherit;
  }

  ${STATS_SELECTORS.root} .${PARTNER_FINDER_LABEL_CLASS} {
    font-size: ${UI.font.caption};
    line-height: 1.25;
  }

  ${STATS_SELECTORS.root} .${TICKS_VIEWPORT_CLASS} {
    max-height: ${TICKS_MOBILE_MAX_HEIGHT_PX}px !important;
  }
}
`;

interface ManagedSection {
  expanded: boolean;
  readonly section: HTMLElement;
  readonly table: HTMLTableElement;
  readonly viewport: HTMLDivElement;
  readonly scrollAffordance: HTMLDivElement;
  readonly handleAffordanceScroll: () => void;
  readonly label: string;
}

interface PositionSnapshot {
  readonly element: HTMLElement;
  readonly parent: HTMLElement;
  readonly nextSibling: Node | null;
}

interface ManagedTicksTable {
  readonly table: HTMLTableElement;
  readonly viewport: HTMLDivElement;
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

function definitionFor(heading: HTMLHeadingElement): CompactStatsSectionContract | undefined {
  const label = headingLeadText(heading);
  return COMPACT_STATS_SECTIONS.find((definition) => definition.sourceLabels.includes(label));
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
  const table = Array.from(section.children).find(
    (child): child is HTMLTableElement => child.tagName === 'TABLE',
  );
  if (table) {
    return table;
  }
  const viewport = Array.from(section.children).find(
    (child) => child.classList.contains(VIEWPORT_CLASS),
  );
  return viewport
    ? Array.from(viewport.children).find(
      (child): child is HTMLTableElement => child.tagName === 'TABLE',
    )
    : undefined;
}

function layoutColumnFor(section: HTMLElement): HTMLElement {
  const parent = section.parentElement;
  return parent && (
    parent.classList.contains(STATS_SELECTORS.maxHeightClass)
    || Array.from(parent.classList).some((name) => (
      name.startsWith(BOOTSTRAP_COLUMN_CLASS_PREFIX)
    ))
  )
    ? parent
    : section;
}

function directChildContaining(parent: HTMLElement, child: HTMLElement): HTMLElement | undefined {
  return Array.from(parent.children).find(
    (candidate) => candidate.contains(child),
  ) as HTMLElement | undefined;
}

function showMoreContainer(section: HTMLElement): HTMLElement | undefined {
  const button = Array.from(section.querySelectorAll<HTMLButtonElement>('button')).find((candidate) => {
    const label = normalizeText(candidate.textContent);
    return label === 'Show More' || label === '더 보기';
  });
  if (!button) return undefined;
  const viewport = button.closest<HTMLElement>(`.${VIEWPORT_CLASS}, .${TICKS_VIEWPORT_CLASS}`);
  return directChildContaining(viewport ?? section, button);
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

function isPartnerFinderLabel(element: HTMLElement): boolean {
  const label = normalizeText(element.textContent);
  return label === 'In Partner Finder' || label === '파트너 찾기에 등록됨';
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
  private readonly ticksPositions = new Map<HTMLElement, PositionSnapshot>();
  private readonly ticksTables = new Map<HTMLTableElement, ManagedTicksTable>();
  private readonly progressive = new Map<HTMLTableElement, StatsProgressiveList>();
  private refreshQueued = false;
  private measurementFrame: number | undefined;
  private passive = false;
  private readonly handleResize = (): void => this.refresh();

  mount(root: ParentNode = document): boolean {
    if (this.root) {
      if (!this.passive) {
        this.refresh();
      }
      return true;
    }
    const stats = root.querySelector<HTMLElement>(STATS_SELECTORS.root);
    const ownerDocument = stats?.ownerDocument;
    if (!stats || !ownerDocument?.head) {
      return false;
    }

    this.root = root;
    this.stats = stats;
    if (ownerDocument.head.querySelector(`style[${STYLE_MARKER}="styles"]`)) {
      this.passive = true;
      return true;
    }
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
    for (const list of this.progressive.values()) list.destroy();
    this.progressive.clear();
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
      managed.viewport.removeEventListener('scroll', managed.handleAffordanceScroll);
      if (managed.viewport.isConnected && managed.table.parentElement === managed.viewport) {
        managed.viewport.replaceWith(managed.table);
      }
    }
    for (const managed of this.ticksTables.values()) {
      if (managed.viewport.isConnected && managed.table.parentElement === managed.viewport) {
        managed.viewport.replaceWith(managed.table);
      }
    }
    for (const snapshot of Array.from(this.ticksPositions.values()).reverse()) {
      if (!snapshot.element.isConnected || !snapshot.parent.isConnected) {
        continue;
      }
      const reference = snapshot.nextSibling?.parentNode === snapshot.parent
        ? snapshot.nextSibling
        : null;
      snapshot.parent.insertBefore(snapshot.element, reference);
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
    this.ticksPositions.clear();
    this.ticksTables.clear();
    this.root = undefined;
    this.stats = undefined;
    this.refreshQueued = false;
    this.passive = false;
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
    for (const [table, list] of this.progressive) {
      if (!this.stats.contains(table)) {
        list.destroy();
        this.progressive.delete(table);
        this.sections.delete(table);
        this.ticksTables.delete(table);
      }
    }

    const headings = Array.from(
      this.stats.querySelectorAll<HTMLHeadingElement>(STATS_SELECTORS.componentHeadings),
    );
    for (const heading of headings) {
      const definition = definitionFor(heading);
      if (definition) {
        this.prepareCompactSection(heading, definition);
      }
    }
    this.prepareTicksLayout();

    for (const managed of this.sections.values()) {
      if (managed.table.isConnected) {
        this.updateViewport(managed);
        this.progressive.get(managed.table)?.refresh(showMoreContainer(managed.section));
      }
    }
    this.synchronizeCompactViewportHeights();
    this.scheduleMeasurement();
  }

  private prepareTicksLayout(): void {
    if (!this.stats) {
      return;
    }
    const located = locateStatsTicksSection(
      this.stats,
      this.stats.ownerDocument.location?.href,
    );
    if (!located.ok) {
      return;
    }

    const { layoutItem, layoutParent } = located.value;
    if (!this.ticksPositions.has(layoutItem)) {
      this.ticksPositions.set(layoutItem, {
        element: layoutItem,
        parent: layoutParent,
        nextSibling: layoutItem.nextSibling,
      });
    }
    this.addClass(layoutItem, TICKS_COLUMN_CLASS);
    const table = layoutItem.querySelector<HTMLTableElement>('table');
    const tableParent = table?.parentElement;
    const section = tableParent?.classList.contains(TICKS_VIEWPORT_CLASS)
      ? tableParent.parentElement
      : tableParent;
    if (table && section) {
      let managed = this.ticksTables.get(table);
      if (!managed) {
        const viewport = table.ownerDocument.createElement('div');
        viewport.className = TICKS_VIEWPORT_CLASS;
        viewport.tabIndex = 0;
        viewport.setAttribute('role', 'region');
        viewport.setAttribute('aria-label', '등반 기록 목록');
        table.before(viewport);
        viewport.append(table);
        managed = { table, viewport };
        this.ticksTables.set(table, managed);
        this.progressive.set(table, new StatsProgressiveList(table, viewport, false, () => {}));
      }
      const more = showMoreContainer(section);
      if (more) this.addClass(more, MORE_CLASS);
      this.progressive.get(table)?.refresh(more);
    }
    if (layoutParent.lastElementChild !== layoutItem) {
      layoutParent.append(layoutItem);
    }
  }

  private prepareCompactSection(
    heading: HTMLHeadingElement,
    definition: CompactStatsSectionContract,
  ): void {
    const section = componentSectionFor(heading);
    const table = section ? directTableFor(section) : undefined;
    if (!section || !table) {
      return;
    }

    this.translateHeading(heading, definition.translatedLabel);
    this.addClass(layoutColumnFor(section), COMPACT_COLUMN_CLASS);
    this.addClass(table, TABLE_CLASS);
    for (const label of section.querySelectorAll<HTMLElement>('.small.text-warm')) {
      if (isPartnerFinderLabel(label)) {
        const cell = label.closest<HTMLTableCellElement>('td');
        const name = cell
          ? Array.from(cell.children).find(
            (child): child is HTMLAnchorElement => child.tagName === 'A',
          )
          : undefined;
        if (!cell || !name) {
          continue;
        }
        this.addClass(cell, PARTNER_FINDER_CELL_CLASS);
        this.addClass(name, PARTNER_FINDER_NAME_CLASS);
        this.addClass(label, PARTNER_FINDER_LABEL_CLASS);
      }
    }

    let managed = this.sections.get(table);
    if (!managed) {
      const viewport = table.ownerDocument.createElement('div');
      viewport.className = VIEWPORT_CLASS;
      table.before(viewport);
      viewport.append(table);
      const scrollAffordance = table.ownerDocument.createElement('div');
      scrollAffordance.className = SCROLL_AFFORDANCE_CLASS;
      scrollAffordance.setAttribute('aria-hidden', 'true');
      const affordanceLabel = table.ownerDocument.createElement('span');
      affordanceLabel.textContent = '더 있음';
      const affordanceIcon = table.ownerDocument.createElement('span');
      affordanceIcon.textContent = '⌄';
      scrollAffordance.append(affordanceLabel, affordanceIcon);
      viewport.append(scrollAffordance);
      let ownedSection: ManagedSection | undefined;
      const handleAffordanceScroll = () => {
        if (ownedSection) this.updateScrollAffordance(ownedSection);
      };
      ownedSection = {
        expanded: false,
        section,
        table,
        viewport,
        scrollAffordance,
        handleAffordanceScroll,
        label: definition.translatedLabel,
      };
      managed = ownedSection;
      viewport.addEventListener('scroll', managed.handleAffordanceScroll, { passive: true });
      this.sections.set(table, managed);
      const compact = managed;
      this.progressive.set(table, new StatsProgressiveList(table, viewport, true, () => {
        compact.expanded = true;
        this.updateViewport(compact);
        this.synchronizeCompactViewportHeights();
      }));
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
      managed.viewport.tabIndex = 0;
      managed.viewport.setAttribute('role', 'region');
      managed.viewport.setAttribute(
        'aria-label',
        `${managed.label} 목록, 추가 항목이 있으며 ${ROW_LIMIT * (managed.expanded ? 2 : 1)}명씩 스크롤 가능`,
      );
    } else {
      managed.viewport.removeAttribute('tabindex');
      managed.viewport.removeAttribute('role');
      managed.viewport.removeAttribute('aria-label');
    }
    this.updateScrollAffordance(managed);
  }

  private updateScrollAffordance(managed: ManagedSection): void {
    const hasAdditionalRows = rowsFor(managed.table).length > ROW_LIMIT;
    const hasOverflow = managed.viewport.scrollHeight > managed.viewport.clientHeight + 1;
    const reachedEnd = hasOverflow
      && managed.viewport.scrollTop + managed.viewport.clientHeight
        >= managed.viewport.scrollHeight - 1;
    managed.scrollAffordance.hidden = !hasAdditionalRows;
    managed.scrollAffordance.classList.toggle(
      SCROLL_AFFORDANCE_HIDDEN_CLASS,
      hasAdditionalRows && reachedEnd,
    );
  }

  private synchronizeCompactViewportHeights(): void {
    const managedSections = Array.from(this.sections.values()).filter(
      (managed) => managed.table.isConnected,
    );
    if (managedSections.length === 0) {
      return;
    }
    const heightSources = managedSections.filter(
      (managed) => rowsFor(managed.table).length >= ROW_LIMIT,
    );
    const sharedHeight = Math.max(...(heightSources.length > 0
      ? heightSources
      : managedSections).map((managed) => (
      measuredFiveRowHeight(rowsFor(managed.table)) * (managed.expanded ? 2 : 1)
    )));
    for (const managed of managedSections) {
      managed.viewport.style.setProperty('--mpkr-stats-five-row-height', `${sharedHeight}px`);
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
      this.synchronizeCompactViewportHeights();
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
