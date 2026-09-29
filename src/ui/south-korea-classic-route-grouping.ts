import { UI } from './design-tokens';
import { parseAreaPath } from '../sites/mountain-project/contract/routes';
import { AREA_SELECTORS } from '../sites/mountain-project/contract/selectors/area';
import { SHARED_SELECTORS } from '../sites/mountain-project/contract/selectors/shared';
import { CLASSIC_ROUTE_SECTION_HEADING_PREFIXES } from '../sites/mountain-project/contract/text/sections';
import { normalizedSectionHeading } from '../sites/mountain-project/dom/authored-section';
import { isSouthKoreaAreaContext } from '../sites/mountain-project/dom/location-trail';

const UNLABELED_AREA = '지역 미표시';
const STYLE_ATTRIBUTE = 'data-mpkr-south-korea-route-grouping';
const STYLE_TEXT = `
${AREA_SELECTORS.page} tr.mpkr-area-route-group-heading > th {
  padding: 0.45rem 0.75rem;
  background: ${UI.color.accentSurface};
  color: ${UI.color.accentText};
  font-size: ${UI.font.small};
  text-align: left;
}
`;

interface RowState {
  readonly row: HTMLTableRowElement;
  readonly marker: Comment;
}

interface GroupState {
  readonly wrapper: HTMLTableSectionElement;
}

interface AreaLabel {
  readonly key: string;
  readonly label: string;
}

function areaKey(anchor: HTMLAnchorElement): string | undefined {
  try {
    return parseAreaPath(
      new URL(anchor.href, anchor.ownerDocument.baseURI).pathname,
    )?.id;
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
  root.querySelectorAll<HTMLAnchorElement>(SHARED_SELECTORS.areaLinks).forEach((anchor) => {
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
    if (
      child instanceof HTMLTableRowElement
      && child.classList.contains(AREA_SELECTORS.routeRowClass)
    ) {
      rows.push(child);
      continue;
    }
    if (!(child instanceof HTMLTableSectionElement) || child.dataset.mpkrAreaRouteGroup) {
      continue;
    }
    for (const row of Array.from(child.children)) {
      if (
        row instanceof HTMLTableRowElement
        && row.classList.contains(AREA_SELECTORS.routeRowClass)
      ) {
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

function isClassicHeading(heading: HTMLHeadingElement): boolean {
  const title = normalizedSectionHeading(heading);
  return CLASSIC_ROUTE_SECTION_HEADING_PREFIXES.some((prefix) => title.startsWith(prefix));
}

function classicRouteTables(root: ParentNode): HTMLTableElement[] {
  const tables = new Set<HTMLTableElement>();
  for (const heading of root.querySelectorAll<HTMLHeadingElement>(AREA_SELECTORS.sectionHeadings)) {
    if (!isClassicHeading(heading)) {
      continue;
    }
    const section = heading.closest(`.${AREA_SELECTORS.textSectionClass}`);
    let sibling = section?.nextElementSibling;
    while (sibling && !sibling.classList.contains(AREA_SELECTORS.textSectionClass)) {
      if (sibling.classList.contains(AREA_SELECTORS.responsiveTableClass)) {
        sibling.querySelectorAll<HTMLTableElement>(AREA_SELECTORS.routeTables)
          .forEach((table) => tables.add(table));
        break;
      }
      sibling = sibling.nextElementSibling;
    }
  }
  return Array.from(tables);
}

function columnCount(table: HTMLTableElement): number {
  const header = table.querySelector<HTMLTableRowElement>(AREA_SELECTORS.screenReaderHeader);
  return Math.max(header?.children.length ?? 0, 1);
}

export class SouthKoreaClassicRouteGrouping {
  private readonly rows: RowState[] = [];
  private readonly groups: GroupState[] = [];
  private style: HTMLStyleElement | undefined;
  private observer: MutationObserver | undefined;
  private currentUrl: URL | undefined;

  mount(
    root: ParentNode = document,
    currentUrl: URL = new URL(window.location.href),
  ): boolean {
    if (!isSouthKoreaAreaContext(currentUrl, root)) {
      return false;
    }
    this.currentUrl = currentUrl;
    const pageRoot = root instanceof HTMLElement && root.matches(AREA_SELECTORS.page)
      ? root
      : root.querySelector<HTMLElement>(AREA_SELECTORS.page);
    if (!pageRoot) {
      return false;
    }

    const labels = canonicalAreaLabels(pageRoot);
    for (const table of classicRouteTables(pageRoot)) {
      this.groupRoutes(table, labels);
    }
    if (!this.groups.length) {
      return false;
    }

    if (!this.style) {
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
          node instanceof Element && !node.matches('[data-mpkr-area-route-group]')
        )))) {
          this.mount(pageRoot.ownerDocument, this.currentUrl);
        }
      });
      this.observer.observe(pageRoot, { childList: true, subtree: true });
    }
    return true;
  }

  destroy(): void {
    this.observer?.disconnect();
    this.observer = undefined;
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
    this.rows.length = 0;
    this.groups.length = 0;
    this.currentUrl = undefined;
  }

  private groupRoutes(
    table: HTMLTableElement,
    labels: ReadonlyMap<string, string>,
  ): void {
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
      this.groups.push({ wrapper });
    }
  }
}
