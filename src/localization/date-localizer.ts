import type { TranslationRecord } from '../core/translation-record';
import { DATE_SELECTORS } from '../sites/mountain-project/contract/selectors/date';
import { localizeEnglishDateText } from '../sites/mountain-project/contract/text/date';

type ChangeListener = (record: TranslationRecord, element: HTMLElement) => void;

interface DateTextState {
  original: string;
  translated: string;
}

function rootMatches(root: ParentNode, selector: string): root is Element {
  return root instanceof Element && root.matches(selector);
}

function normalizedText(element: Element | null | undefined): string {
  return element?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
}

function textNodesWithin(element: Element): Text[] {
  const ownerDocument = element.ownerDocument;
  const walker = ownerDocument.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    nodes.push(current as Text);
    current = walker.nextNode();
  }
  return nodes;
}

export class DateLocalizer {
  private readonly states = new WeakMap<Text, DateTextState>();
  private readonly restores: Array<() => void> = [];
  private readonly ids = new WeakMap<Node, string>();
  private nextId = 1;

  constructor(private readonly onChange?: ChangeListener) {}

  apply(root: ParentNode): void {
    const candidates = new Set<Element>();
    this.addMatches(root, DATE_SELECTORS.explicitMetadata, candidates);
    this.addMatches(root, DATE_SELECTORS.statsTickDate, candidates);
    this.addMatches(root, DATE_SELECTORS.userActivityDate, candidates);
    this.addUserBioDates(root, candidates);
    this.addDescriptionDates(root, candidates);
    this.addDateTableCells(root, candidates);

    for (const element of candidates) {
      for (const node of textNodesWithin(element)) {
        this.localizeNode(node, element);
      }
    }
  }

  restore(): void {
    while (this.restores.length > 0) {
      this.restores.pop()?.();
    }
  }

  private addMatches(root: ParentNode, selector: string, target: Set<Element>): void {
    if (rootMatches(root, selector)) {
      target.add(root);
    }
    root.querySelectorAll(selector).forEach((element) => target.add(element));
  }

  private addUserBioDates(root: ParentNode, target: Set<Element>): void {
    const elements: Element[] = [];
    if (rootMatches(root, DATE_SELECTORS.userBioMetadata)) {
      elements.push(root);
    }
    elements.push(...root.querySelectorAll(DATE_SELECTORS.userBioMetadata));
    for (const element of elements) {
      const text = normalizedText(element);
      const previousLabel = normalizedText(element.previousElementSibling);
      if (/^Last Visit:/i.test(text) || /^(?:Member Since|가입일)$/i.test(previousLabel)) {
        target.add(element);
      }
    }
  }

  private addDescriptionDates(root: ParentNode, target: Set<Element>): void {
    const rows: Element[] = [];
    if (rootMatches(root, DATE_SELECTORS.descriptionRows)) {
      rows.push(root);
    }
    rows.push(...root.querySelectorAll(DATE_SELECTORS.descriptionRows));
    for (const row of rows) {
      const cells = row instanceof HTMLTableRowElement
        ? row.cells
        : row.querySelectorAll('th, td');
      const label = normalizedText(cells[0]).replace(/:$/, '');
      if (/^(?:Shared By|공유한 사람)$/i.test(label) && cells[1]) {
        target.add(cells[1]);
      }
    }
  }

  private addDateTableCells(root: ParentNode, target: Set<Element>): void {
    const tables: HTMLTableElement[] = [];
    if (root instanceof HTMLTableElement) {
      tables.push(root);
    } else if (root instanceof Element) {
      const containingTable = root.closest<HTMLTableElement>('table');
      if (containingTable) {
        tables.push(containingTable);
      }
    }
    tables.push(...root.querySelectorAll<HTMLTableElement>(DATE_SELECTORS.tables));
    for (const table of tables) {
      const dateColumns = new Set<number>();
      for (const row of Array.from(table.rows)) {
        Array.from(row.cells).forEach((cell, index) => {
          if (cell instanceof HTMLTableCellElement
            && cell.tagName === 'TH'
            && /^(?:Date|날짜)$/i.test(normalizedText(cell))) {
            dateColumns.add(index);
          }
        });
      }
      if (dateColumns.size === 0) {
        continue;
      }
      for (const row of Array.from(table.rows)) {
        for (const index of dateColumns) {
          const cell = row.cells[index];
          if (cell && cell.tagName === 'TD') {
            target.add(cell);
          }
        }
      }
    }
  }

  private localizeNode(node: Text, owner: Element): void {
    const current = node.nodeValue ?? '';
    const state = this.states.get(node);
    if (state && current === state.translated) {
      return;
    }
    const translated = localizeEnglishDateText(current);
    if (!translated) {
      if (state) {
        state.original = current;
        state.translated = current;
      }
      return;
    }

    if (state) {
      state.original = current;
      state.translated = translated;
    } else {
      const nextState = { original: current, translated };
      this.states.set(node, nextState);
      this.restores.push(() => {
        node.nodeValue = nextState.original;
        this.states.delete(node);
      });
    }
    node.nodeValue = translated;
    this.onChange?.({
      id: `date-${this.idFor(node)}`,
      category: 'ui',
      source: current.trim(),
      translated: translated.trim(),
      status: 'translated',
      machine: false,
    }, owner as HTMLElement);
  }

  private idFor(node: Node): string {
    const existing = this.ids.get(node);
    if (existing) {
      return existing;
    }
    const id = String(this.nextId++);
    this.ids.set(node, id);
    return id;
  }
}
