import { parseAreaPath } from '../sites/mountain-project/contract/routes';
import { southKoreaAreaName } from '../sites/mountain-project/contract/regions/south-korea';
import { AREA_SELECTORS } from '../sites/mountain-project/contract/selectors/area';

interface AnchorState {
  readonly node: Text;
  original: string;
  translated: string;
}

interface ContainerState {
  readonly ranks: WeakMap<HTMLElement, number>;
  nextRank: number;
}

function directRows(container: Element): HTMLElement[] {
  return Array.from(container.children).filter(
    (child): child is HTMLElement => (
      child instanceof HTMLElement && child.matches(AREA_SELECTORS.sidebarRow)
    ),
  );
}

function areaId(anchor: HTMLAnchorElement): string | undefined {
  try {
    return parseAreaPath(new URL(anchor.href, document.baseURI).pathname)?.id;
  } catch {
    return undefined;
  }
}

function directAnchor(row: HTMLElement): HTMLAnchorElement | undefined {
  return Array.from(row.children).find(
    (child): child is HTMLAnchorElement => child instanceof HTMLAnchorElement,
  );
}

function directTextNode(anchor: HTMLAnchorElement): Text | undefined {
  const nodes = Array.from(anchor.childNodes).filter(
    (node): node is Text => node.nodeType === Node.TEXT_NODE && Boolean(node.nodeValue?.trim()),
  );
  return nodes.length === 1 ? nodes[0] : undefined;
}

function withOriginalWhitespace(original: string, translated: string): string {
  const leading = original.match(/^\s*/)?.[0] ?? '';
  const trailing = original.match(/\s*$/)?.[0] ?? '';
  return `${leading}${translated}${trailing}`;
}

function displayedCount(row: HTMLElement): number {
  const countElements = row.querySelectorAll<HTMLElement>(AREA_SELECTORS.warmText);
  const text = countElements.item(countElements.length - 1)?.textContent ?? '';
  const value = Number.parseInt(text.replace(/[^\d]/g, ''), 10);
  return Number.isFinite(value) ? value : 0;
}

export class SouthKoreaAreaList {
  private observer: MutationObserver | undefined;
  private root: ParentNode | undefined;
  private anchorStates = new WeakMap<HTMLAnchorElement, AnchorState>();
  private containerStates = new WeakMap<Element, ContainerState>();
  private readonly managedAnchors = new Set<HTMLAnchorElement>();
  private readonly managedContainers = new Set<Element>();

  mount(root: ParentNode = document): boolean {
    this.root = root;
    const found = this.apply(root);

    if (root === document && !this.observer) {
      this.observer = new MutationObserver(() => {
        this.apply(document);
      });
      this.observe();
    }

    return found;
  }

  destroy(): void {
    this.observer?.disconnect();
    this.observer = undefined;

    for (const anchor of this.managedAnchors) {
      const state = this.anchorStates.get(anchor);
      if (state && state.node.parentNode === anchor) {
        state.node.nodeValue = state.original;
      }
    }

    for (const container of this.managedContainers) {
      const state = this.containerStates.get(container);
      if (!state || !container.isConnected) {
        continue;
      }
      this.placeRows(container, directRows(container).sort(
        (left, right) => (state.ranks.get(left) ?? 0) - (state.ranks.get(right) ?? 0),
      ));
    }

    this.managedAnchors.clear();
    this.managedContainers.clear();
    this.anchorStates = new WeakMap();
    this.containerStates = new WeakMap();
    this.root = undefined;
  }

  private apply(root: ParentNode): boolean {
    const containers = new Set<Element>();
    const rows = root instanceof Element && root.matches(AREA_SELECTORS.sidebarRow)
      ? [root, ...root.querySelectorAll<HTMLElement>(AREA_SELECTORS.sidebarRow)]
      : Array.from(root.querySelectorAll<HTMLElement>(AREA_SELECTORS.sidebarRow));

    for (const row of rows) {
      if (row.parentElement) {
        containers.add(row.parentElement);
      }
    }

    let found = false;
    this.withObserverPaused(() => {
      for (const container of containers) {
        const containerRows = directRows(container);
        if (!containerRows.some((row) => {
          const anchor = directAnchor(row);
          const id = anchor ? areaId(anchor) : undefined;
          return Boolean(southKoreaAreaName(id));
        })) {
          continue;
        }

        found = true;
        this.translateRows(containerRows);
        this.sortRows(container, containerRows);
      }
    });
    return found;
  }

  private translateRows(rows: HTMLElement[]): void {
    for (const row of rows) {
      const anchor = directAnchor(row);
      const id = anchor ? areaId(anchor) : undefined;
      const korean = southKoreaAreaName(id);
      if (!anchor || !korean) {
        continue;
      }

      const node = directTextNode(anchor);
      if (!node) {
        continue;
      }

      const translated = withOriginalWhitespace(node.nodeValue ?? '', korean);
      const existing = this.anchorStates.get(anchor);
      if (!existing || existing.node !== node) {
        this.anchorStates.set(anchor, {
          node,
          original: node.nodeValue ?? '',
          translated,
        });
      } else if (node.nodeValue !== existing.translated) {
        existing.original = node.nodeValue ?? '';
        existing.translated = withOriginalWhitespace(existing.original, korean);
      }

      const state = this.anchorStates.get(anchor)!;
      if (node.nodeValue !== state.translated) {
        node.nodeValue = state.translated;
      }
      this.managedAnchors.add(anchor);
    }
  }

  private sortRows(container: Element, rows: HTMLElement[]): void {
    let state = this.containerStates.get(container);
    if (!state) {
      state = { ranks: new WeakMap(), nextRank: 0 };
      this.containerStates.set(container, state);
    }
    for (const row of rows) {
      if (!state.ranks.has(row)) {
        state.ranks.set(row, state.nextRank++);
      }
    }

    const sorted = [...rows].sort((left, right) => (
      displayedCount(right) - displayedCount(left)
      || (state!.ranks.get(left) ?? 0) - (state!.ranks.get(right) ?? 0)
    ));
    if (rows.some((row, index) => row !== sorted[index])) {
      this.placeRows(container, sorted);
    }
    this.managedContainers.add(container);
  }

  private placeRows(container: Element, rows: HTMLElement[]): void {
    const boundary = directRows(container).at(-1)?.nextSibling ?? null;
    for (const row of rows) {
      container.insertBefore(row, boundary);
    }
  }

  private withObserverPaused(action: () => void): void {
    const observing = Boolean(this.observer);
    if (observing) {
      this.observer?.disconnect();
    }
    action();
    if (observing) {
      this.observe();
    }
  }

  private observe(): void {
    const target = this.root === document ? document.documentElement : this.root;
    if (target instanceof Node) {
      this.observer?.observe(target, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    }
  }
}
