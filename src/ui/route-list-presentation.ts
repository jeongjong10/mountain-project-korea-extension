import { UI } from './design-tokens';
import { parseRoutePath } from '../sites/mountain-project/contract/routes';
import { ROUTE_LIST_SELECTORS } from '../sites/mountain-project/contract/selectors/route-list';
import { SHARED_SELECTORS } from '../sites/mountain-project/contract/selectors/shared';

const STYLE_MARKER = 'data-mpkr-route-list-presentation';
const ROW_CLASS = 'mpkr-route-list-row';
const PRIMARY_LINK_CLASS = 'mpkr-route-list-primary';
const EXPANDED_LINK_CLASS = 'mpkr-route-list-primary-expanded';

const STYLE_TEXT = `
.${ROW_CLASS} {
  transition: background-color ${UI.motion.fast};
}

tr.${ROW_CLASS}:hover > td,
tr.${ROW_CLASS}:focus-within > td,
li.${ROW_CLASS}:hover,
li.${ROW_CLASS}:focus-within,
.route-list-item.${ROW_CLASS}:hover,
.route-list-item.${ROW_CLASS}:focus-within,
.classic-route.${ROW_CLASS}:hover,
.classic-route.${ROW_CLASS}:focus-within,
${ROUTE_LIST_SELECTORS.sidebarRow}.${ROW_CLASS}:hover,
${ROUTE_LIST_SELECTORS.sidebarRow}.${ROW_CLASS}:focus-within {
  background-color: ${UI.color.surfaceHover} !important;
}

.${PRIMARY_LINK_CLASS}:focus-visible {
  outline: 3px solid ${UI.color.link};
  outline-offset: 2px;
  border-radius: ${UI.radius.small};
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
    return Boolean(parseRoutePath(new URL(anchor.href, document.baseURI).pathname));
  } catch {
    return false;
  }
}

function candidateRows(root: ParentNode): HTMLElement[] {
  const rows = new Set<HTMLElement>();
  if (root instanceof HTMLElement && root.matches(ROUTE_LIST_SELECTORS.rows)) {
    rows.add(root);
  }
  root.querySelectorAll<HTMLElement>(ROUTE_LIST_SELECTORS.rows)
    .forEach((row) => rows.add(row));
  return Array.from(rows);
}

function primaryRouteLink(row: HTMLElement): HTMLAnchorElement | undefined {
  return Array.from(row.querySelectorAll<HTMLAnchorElement>(SHARED_SELECTORS.routeLinks))
    .find((anchor) => (
      routePath(anchor) && !anchor.closest(ROUTE_LIST_SELECTORS.secondaryContext)
    ));
}

// Expanding an inline link beside a rank, badge, or another action would
// move it onto its own line. Only expand an otherwise empty container.
function isOnlyContent(container: HTMLElement, anchor: HTMLAnchorElement): boolean {
  let current: Node = anchor;
  while (current !== container) {
    const parent = current.parentNode;
    if (!parent) return false;
    if (Array.from(parent.childNodes).some((node) => node !== current && (
      node.nodeType === Node.ELEMENT_NODE
      || (node.nodeType === Node.TEXT_NODE && Boolean(node.textContent?.trim()))
    ))) return false;
    current = parent;
  }
  return true;
}

function canSafelyExpand(row: HTMLElement, anchor: HTMLAnchorElement): boolean {
  const cell = anchor.closest('td');
  if (cell && cell.closest('tr') === row) {
    return cell === row.querySelector('td')
      && isOnlyContent(cell, anchor)
      && !anchor.closest(ROUTE_LIST_SELECTORS.secondaryContext);
  }
  return anchor.parentElement === row && isOnlyContent(row, anchor)
    && !row.querySelector('button, input, select, textarea');
}

export class RouteListPresentation {
  private observer: MutationObserver | undefined;
  private style: HTMLStyleElement | undefined;
  private root: ParentNode | undefined;
  private readonly rows = new Map<HTMLElement, string | null>();
  private readonly links = new Map<HTMLAnchorElement, string | null>();

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
    for (const [row, className] of this.rows) {
      this.restoreClassName(row, className);
    }
    for (const [link, className] of this.links) {
      this.restoreClassName(link, className);
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
      if (
        row instanceof HTMLAnchorElement
        || row.classList.contains(ROUTE_LIST_SELECTORS.screenReaderOnlyClass)
      ) {
        continue;
      }
      const primary = primaryRouteLink(row);
      if (!primary) {
        continue;
      }
      if (!this.rows.has(row)) {
        this.rows.set(row, row.getAttribute('class'));
      }
      if (!this.links.has(primary)) {
        this.links.set(primary, primary.getAttribute('class'));
      }
      row.classList.add(ROW_CLASS);
      primary.classList.add(PRIMARY_LINK_CLASS);
      if (canSafelyExpand(row, primary)) {
        primary.classList.add(EXPANDED_LINK_CLASS);
      }
      found = true;
    }
    return found;
  }

  private ensureStyle(root: ParentNode): void {
    if (this.style?.isConnected) {
      return;
    }
    const ownerDocument = root.nodeType === Node.DOCUMENT_NODE
      ? root as Document
      : root.ownerDocument;
    if (!ownerDocument) {
      return;
    }
    const style = ownerDocument.createElement('style');
    style.setAttribute(STYLE_MARKER, 'true');
    style.textContent = STYLE_TEXT;
    ownerDocument.head.append(style);
    this.style = style;
  }

  private restoreClassName(element: HTMLElement, className: string | null): void {
    if (className === null) {
      element.removeAttribute('class');
    } else {
      element.setAttribute('class', className);
    }
  }
}
