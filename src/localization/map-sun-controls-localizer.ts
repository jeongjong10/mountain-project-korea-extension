import { MAP_SELECTORS } from '../sites/mountain-project/contract/selectors/map';
import { translateMapSunControlText } from '../sites/mountain-project/contract/text/map';

type AttributeName = 'title' | 'aria-label' | 'alt';

interface TextState {
  original: string;
  translated: string;
}

interface AttributeState {
  original: string;
  translated: string;
}

const ATTRIBUTES: readonly AttributeName[] = ['title', 'aria-label', 'alt'];
function withWhitespace(source: string, translated: string): string {
  const leading = source.match(/^\s*/)?.[0] ?? '';
  const trailing = source.match(/\s*$/)?.[0] ?? '';
  return `${leading}${translated}${trailing}`;
}

function isWithinControls(node: Node): boolean {
  const element = node.nodeType === Node.ELEMENT_NODE
    ? node as Element
    : node.parentElement;
  return Boolean(element?.closest(MAP_SELECTORS.sunControls));
}

/** Localizes the same-origin map's fixed sun UI without touching calculated values. */
export class MapSunControlsLocalizer {
  private readonly textStates = new WeakMap<Text, TextState>();
  private readonly attributeStates = new WeakMap<Element, Map<AttributeName, AttributeState>>();
  private readonly trackedText = new Set<Text>();
  private readonly trackedAttributes = new Set<Element>();
  private observer: MutationObserver | undefined;
  private document: Document | undefined;

  connect(document: Document): void {
    if (this.document === document && this.observer) {
      this.apply(document);
      return;
    }

    this.disconnect();
    this.document = document;
    this.apply(document);

    const Observer = document.defaultView?.MutationObserver ?? MutationObserver;
    this.observer = new Observer((records) => {
      for (const record of records) {
        if (record.type === 'characterData' && isWithinControls(record.target)) {
          this.translateText(record.target as Text);
        } else if (record.type === 'attributes' && record.target instanceof Element) {
          this.translateAttributes(record.target);
        }
        for (const node of record.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.apply(node as Element);
          } else if (isWithinControls(node)) {
            this.translateText(node as Text);
          }
        }
      }
    });
    this.observer.observe(document.documentElement, {
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...ATTRIBUTES],
      subtree: true,
    });
  }

  disconnect(): void {
    this.observer?.disconnect();
    this.observer = undefined;
    this.trackedText.forEach((node) => {
      const state = this.textStates.get(node);
      if (state) {
        node.nodeValue = state.original;
        this.textStates.delete(node);
      }
    });
    this.trackedText.clear();
    this.trackedAttributes.forEach((element) => {
      const states = this.attributeStates.get(element);
      states?.forEach((state, name) => element.setAttribute(name, state.original));
      this.attributeStates.delete(element);
    });
    this.trackedAttributes.clear();
    this.document = undefined;
  }

  private apply(root: ParentNode): void {
    const controls = root instanceof Element && root.matches(MAP_SELECTORS.sunControls)
      ? [root]
      : Array.from(root.querySelectorAll(MAP_SELECTORS.sunControls));
    if (root instanceof Element && root.closest(MAP_SELECTORS.sunControls)) {
      controls.push(root.closest(MAP_SELECTORS.sunControls)!);
    }

    new Set(controls).forEach((container) => {
      this.translateSubtree(container);
    });
  }

  private translateSubtree(container: Element): void {
    const walker = container.ownerDocument.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
    );
    let current = walker.nextNode();
    while (current) {
      const parent = current.parentElement;
      if (parent && !parent.matches('script, style, noscript')) {
        this.translateText(current as Text);
      }
      current = walker.nextNode();
    }

    this.translateAttributes(container);
    container.querySelectorAll(ATTRIBUTES.map((name) => `[${name}]`).join(', '))
      .forEach((element) => this.translateAttributes(element));
  }

  private translateText(node: Text): void {
    const value = node.nodeValue ?? '';
    const state = this.textStates.get(node);
    if (state && value === state.translated) {
      return;
    }
    const translated = translateMapSunControlText(value);
    if (!translated) {
      if (state) {
        state.original = value;
        state.translated = value;
      }
      return;
    }

    const nextValue = withWhitespace(value, translated);
    if (state) {
      state.original = value;
      state.translated = nextValue;
    } else {
      const nextState = { original: value, translated: nextValue };
      this.textStates.set(node, nextState);
      this.trackedText.add(node);
    }
    node.nodeValue = nextValue;
  }

  private translateAttributes(element: Element): void {
    for (const name of ATTRIBUTES) {
      const value = element.getAttribute(name);
      const states = this.attributeStates.get(element);
      const state = states?.get(name);
      if (!value || (state && value === state.translated)) {
        continue;
      }
      const translated = translateMapSunControlText(value);
      if (!translated) {
        if (state) {
          state.original = value;
          state.translated = value;
        }
        continue;
      }
      if (state) {
        state.original = value;
        state.translated = translated;
      } else {
        const nextState = { original: value, translated };
        const nextStates = states ?? new Map<AttributeName, AttributeState>();
        nextStates.set(name, nextState);
        this.attributeStates.set(element, nextStates);
        this.trackedAttributes.add(element);
      }
      element.setAttribute(name, translated);
    }
  }
}
