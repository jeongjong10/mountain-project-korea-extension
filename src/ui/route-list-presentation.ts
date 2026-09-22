const STYLE_MARKER = 'data-mpkr-route-list-presentation';
const ROW_CLASS = 'mpkr-route-list-row';
const PRIMARY_LINK_CLASS = 'mpkr-route-list-primary';
const EXPANDED_LINK_CLASS = 'mpkr-route-list-primary-expanded';

const ROW_SELECTOR = [
  'tr.route-row',
  'table.route-table tr:not(.screen-reader-only)',
  'li.route-row',
  '.route-list-item',
  '.classic-route',
  '.lef-nav-row',
].join(',');

const SECONDARY_CONTEXT_SELECTOR = [
  '.scoreStars',
  '.route-stars',
  '.rating',
  '.actions',
  '.action',
  '.dropdown',
  '.menu',
  'button',
  'label',
].join(',');

const STYLE_TEXT = `
.${ROW_CLASS} {
  transition: background-color 140ms ease;
}

tr.${ROW_CLASS}:hover > td,
tr.${ROW_CLASS}:focus-within > td,
li.${ROW_CLASS}:hover,
li.${ROW_CLASS}:focus-within,
.route-list-item.${ROW_CLASS}:hover,
.route-list-item.${ROW_CLASS}:focus-within,
.classic-route.${ROW_CLASS}:hover,
.classic-route.${ROW_CLASS}:focus-within,
.lef-nav-row.${ROW_CLASS}:hover,
.lef-nav-row.${ROW_CLASS}:focus-within {
  background-color: #edf5fa !important;
}

.${PRIMARY_LINK_CLASS}:focus-visible {
  outline: 3px solid #0060a9;
  outline-offset: 2px;
  border-radius: 2px;
}

.${EXPANDED_LINK_CLASS} {
  box-sizing: border-box;
  display: block;
  width: 100%;
  min-height: 2rem;
  padding: 0.3rem 0.35rem;
}

@media (prefers-reduced-motion: reduce) {
  .${ROW_CLASS} {
    transition: none;
  }
}
`;

function routePath(anchor: HTMLAnchorElement): boolean {
  try {
    return /^\/route\/\d+(?:\/|$)/.test(new URL(anchor.href, document.baseURI).pathname);
  } catch {
    return false;
  }
}

function candidateRows(root: ParentNode): HTMLElement[] {
  const rows = new Set<HTMLElement>();
  if (root instanceof HTMLElement && root.matches(ROW_SELECTOR)) {
    rows.add(root);
  }
  root.querySelectorAll<HTMLElement>(ROW_SELECTOR).forEach((row) => rows.add(row));
  return Array.from(rows);
}

function primaryRouteLink(row: HTMLElement): HTMLAnchorElement | undefined {
  return Array.from(row.querySelectorAll<HTMLAnchorElement>('a[href*="/route/"]'))
    .find((anchor) => routePath(anchor) && !anchor.closest(SECONDARY_CONTEXT_SELECTOR));
}

function canSafelyExpand(row: HTMLElement, anchor: HTMLAnchorElement): boolean {
  const cell = anchor.closest('td');
  if (cell && cell.closest('tr') === row) {
    return cell === row.querySelector('td') && !anchor.closest(SECONDARY_CONTEXT_SELECTOR);
  }
  return anchor.parentElement === row && !row.querySelector('button, input, select, textarea');
}

export class RouteListPresentation {
  private observer: MutationObserver | undefined;
  private style: HTMLStyleElement | undefined;
  private root: ParentNode | undefined;
  private readonly rows = new Set<HTMLElement>();
  private readonly links = new Set<HTMLAnchorElement>();

  mount(root: ParentNode = document): boolean {
    this.root = root;
    this.ensureStyle(root);
    const found = this.apply(root);

    if (root === document && !this.observer) {
      this.observer = new MutationObserver((records) => {
        for (const record of records) {
          for (const node of record.addedNodes) {
            if (node instanceof Element) {
              this.apply(node);
            }
          }
        }
      });
      this.observer.observe(document.documentElement, { childList: true, subtree: true });
    }
    return found;
  }

  destroy(): void {
    this.observer?.disconnect();
    this.observer = undefined;
    for (const row of this.rows) {
      row.classList.remove(ROW_CLASS);
    }
    for (const link of this.links) {
      link.classList.remove(PRIMARY_LINK_CLASS, EXPANDED_LINK_CLASS);
    }
    this.rows.clear();
    this.links.clear();
    this.style?.remove();
    this.style = undefined;
    this.root = undefined;
  }

  private apply(root: ParentNode): boolean {
    let found = false;
    for (const row of candidateRows(root)) {
      if (row instanceof HTMLAnchorElement || row.classList.contains('screen-reader-only')) {
        continue;
      }
      const primary = primaryRouteLink(row);
      if (!primary) {
        continue;
      }
      row.classList.add(ROW_CLASS);
      primary.classList.add(PRIMARY_LINK_CLASS);
      if (canSafelyExpand(row, primary)) {
        primary.classList.add(EXPANDED_LINK_CLASS);
      }
      this.rows.add(row);
      this.links.add(primary);
      found = true;
    }
    return found;
  }

  private ensureStyle(root: ParentNode): void {
    if (this.style?.isConnected) {
      return;
    }
    const ownerDocument = root instanceof Document ? root : root.ownerDocument;
    if (!ownerDocument) {
      return;
    }
    const style = ownerDocument.createElement('style');
    style.setAttribute(STYLE_MARKER, 'true');
    style.textContent = STYLE_TEXT;
    ownerDocument.head.append(style);
    this.style = style;
  }
}
