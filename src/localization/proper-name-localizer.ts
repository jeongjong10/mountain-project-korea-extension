import type { TranslationRecord } from '../core/translation-record';
import { SHARED_SELECTORS } from '../sites/mountain-project/contract/selectors/shared';
import { translateProperName } from '../sites/mountain-project/contract/text/names';

type ChangeListener = (record: TranslationRecord, element: HTMLElement) => void;

export class ProperNameLocalizer {
  private readonly restores: Array<() => void> = [];
  private readonly changed = new WeakSet<Node>();
  private readonly ids = new WeakMap<Node, string>();
  private nextId = 1;

  constructor(private readonly onChange?: ChangeListener) {}

  apply(root: ParentNode = document): void {
    const candidates = new Set<HTMLElement>();
    root.querySelectorAll<HTMLElement>(`h1, ${SHARED_SELECTORS.areaLinks}`)
      .forEach((element) => candidates.add(element));

    for (const element of candidates) {
      for (const node of Array.from(element.childNodes)) {
        if (node.nodeType !== Node.TEXT_NODE || this.changed.has(node)) {
          continue;
        }
        const source = node.nodeValue?.replace(/\s+/g, ' ').trim() ?? '';
        const translated = translateProperName(source);
        if (!translated) {
          continue;
        }

        const original = node.nodeValue ?? '';
        const leading = original.match(/^\s*/)?.[0] ?? '';
        const trailing = original.match(/\s*$/)?.[0] ?? '';
        node.nodeValue = `${leading}${translated}${trailing}`;
        this.changed.add(node);
        const id = this.idFor(node);
        this.onChange?.({
          id,
          category: 'name',
          source,
          translated,
          status: 'translated',
          machine: false,
        }, element);
        this.restores.push(() => {
          node.nodeValue = original;
          this.changed.delete(node);
        });
      }
    }
  }

  restore(): void {
    while (this.restores.length > 0) {
      this.restores.pop()?.();
    }
  }

  private idFor(node: Node): string {
    const existing = this.ids.get(node);
    if (existing) {
      return existing;
    }
    const id = `name-${this.nextId++}`;
    this.ids.set(node, id);
    return id;
  }
}
