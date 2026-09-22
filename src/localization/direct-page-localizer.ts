import {
  PATH_TRANSLATIONS,
  translateClassicVoteUiText,
  translateContactUserUiText,
  translateRouteFinderUiText,
  translateSunShadeUiText,
  translateUiText,
  translateUserProfileUiText,
  translatePlaceholder,
} from '../core/localization';
import type { TranslationRecord } from '../core/translation-record';

type Restore = () => void;
type ChangeListener = (record: TranslationRecord, element: HTMLElement) => void;

interface TextState {
  original: string;
  translated: string;
}

interface InputState {
  readonly kind: 'placeholder' | 'value';
  original: string;
  translated: string;
}

interface AttributeState {
  original: string;
  translated: string;
}

const TEXT_SELECTOR = [
  'a',
  'button',
  'label',
  'option',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'th',
  'td',
  'dt',
  'legend',
  'span',
  'strong',
  'b',
  'small',
  '.small',
  '#you-and-route .mt-quarter',
  '.mp-sidebar .small.text-warm',
  '.comments .form-char-count',
  '.text-section > div',
  '.pt-main-content .float-md-left',
  '[role="button"]',
  '[role="status"]',
  '[role="alert"]',
  '#sun-shade .mb-half',
  '#sun-shade svg text',
  '.is_classic_vote',
].join(',');

const INPUT_SELECTOR = [
  'input[placeholder]',
  'textarea[placeholder]',
  'input[type="submit"]',
  'input[type="button"]',
].join(',');

const TRANSLATABLE_ATTRIBUTES = ['title', 'aria-label', 'alt'] as const;
const ATTRIBUTE_SELECTOR = TRANSLATABLE_ATTRIBUTES
  .map((attribute) => `[${attribute}]`)
  .join(',');
const EXTENSION_CONTENT_SELECTOR = [
  '.mpkr-machine-translation',
  '.mpkr-original-section-content',
].join(', ');

function normalizePath(anchor: HTMLAnchorElement): string | undefined {
  try {
    return new URL(anchor.href, document.baseURI).pathname.replace(/\/+$/, '') || '/';
  } catch {
    return undefined;
  }
}

function withOriginalWhitespace(original: string, translated: string): string {
  const leading = original.match(/^\s*/)?.[0] ?? '';
  const trailing = original.match(/\s*$/)?.[0] ?? '';
  return `${leading}${translated}${trailing}`;
}

function normalizedText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function isExtensionContent(element: Element): boolean {
  return Boolean(element.closest(EXTENSION_CONTENT_SELECTOR));
}

function isRouteFinderUiElement(element: Element): boolean {
  return Boolean(element.closest([
    '#routeFinderForm',
    '.pt-main-content .float-md-left',
    '.pagination',
    '.screen-reader-only',
    '#finder-states',
  ].join(', ')))
    || element.matches('[role="status"], [role="alert"]');
}

function isClassicVoteUserData(element: Element): boolean {
  return Boolean(element.closest([
    '.is_classic_vote .route-name',
    '.is_classic_vote .user-content',
    '.is_classic_vote [data-route-name]',
    '.is_classic_vote a[href*="/route/"]',
    '.is_classic_vote a[href*="/area/"]',
    '.is_classic_vote a[href*="/user/"]',
  ].join(', ')));
}

function isProtectedUserProfileContent(element: Element): boolean {
  return Boolean(element.closest([
    '#user-profile #user-info h2',
    '#user-profile #user-info .location',
    '#user-profile #user-info .user-location',
    '#user-profile #user-info [data-user-location]',
    '#user-profile .fr-view',
    '#user-profile .comment-body',
    '#user-profile .user-content',
    '#user-profile .activity-body',
    '#user-profile .comment-table .comment-row > td > .row .col-md-12',
    '#user-profile .forum-message-table .forum-message-row > td > .mb-half > strong',
    '#user-profile .forum-message-table .forum-message-row > td > div:last-child',
    '#user-profile .photo-title',
    '#user-profile .photo-caption',
    '#user-profile a[href*="/route/"]',
    '#user-profile a[href*="/area/"]',
    '#user-profile a[href*="/photo/"]',
    '#user-profile .comment-body a[href*="/user/"]',
    '#user-profile .activity-body a[href*="/user/"]',
    '#user-profile .comment-author',
    '#user-profile .user-name',
    '#user-profile [rel="author"]',
    '.fr-view',
    '.comment-body',
    '.user-content',
    '.activity-body',
    '.forum-post-body',
    '.message-body',
    '.photo-title',
    '.photo-caption',
    'a[href*="/route/"]',
    'a[href*="/area/"]',
    '.comment-author',
    '.user-name',
    '[rel="author"]',
    '[data-user-name]',
  ].join(', ')));
}

function isUserProfileActionText(value: string): boolean {
  return /^(?:View (?:Comment|Message|Post|Reply|Change)|Load More|Previous|Next)$/
    .test(normalizedText(value));
}

function isProtectedContactUserContent(element: Element): boolean {
  return Boolean(element.closest([
    'a[href*="/user/"]',
    '.recipient-name',
    '.user-name',
    '[data-recipient-name]',
    '[data-user-name]',
  ].join(', ')));
}

function rootMatchesOrContains(root: ParentNode, selector: string): boolean {
  return (root instanceof Element && root.matches(selector))
    || Boolean(root.querySelector(selector));
}

export class DirectPageLocalizer {
  private readonly restores: Restore[] = [];
  private readonly textStates = new WeakMap<Text, TextState>();
  private readonly inputStates = new WeakMap<
    HTMLInputElement | HTMLTextAreaElement,
    InputState
  >();
  private readonly attributeStates = new WeakMap<Element, Map<string, AttributeState>>();
  private readonly ids = new WeakMap<Node, string>();
  private observer: MutationObserver | undefined;
  private nextId = 1;
  private routeFinderDocument = false;
  private sunShadeDocument = false;
  private userProfileDocument = false;
  private contactUserDocument = false;

  constructor(private readonly onChange?: ChangeListener) {}

  apply(root: ParentNode = document): void {
    const ownerDocument = root instanceof Document ? root : root.ownerDocument;
    const path = ownerDocument?.location?.pathname.replace(/\/+$/, '');
    this.routeFinderDocument = this.routeFinderDocument
      || path === '/route-finder'
      || Boolean(root.querySelector('#routeFinderForm'));
    this.sunShadeDocument = this.sunShadeDocument
      || Boolean(path && /^\/(?:area|route)\/\d+(?:\/[^/]+)?$/.test(path))
      || rootMatchesOrContains(root, '#climb-area-page, #route-page');
    this.userProfileDocument = this.userProfileDocument
      || Boolean(path && /^\/user\/\d+\/[^/]+(?:\/(?:contributions|community))?$/.test(path))
      || rootMatchesOrContains(root, '#user-profile');
    this.contactUserDocument = this.contactUserDocument
      || Boolean(path && /^\/contact-user\/\d+$/.test(path))
      || rootMatchesOrContains(root, '#contact-user, [data-contact-user], form[action*="/contact-user"]');
    this.translateTree(root);
    if (root === document && !this.observer) {
      this.observer = new MutationObserver((records) => {
        for (const record of records) {
          if (record.type === 'characterData') {
            this.translateTextMutation(record.target);
          }
          if (record.type === 'attributes' && record.target instanceof Element) {
            this.translateAttributeMutation(record.target, record.attributeName);
          }
          for (const node of record.addedNodes) {
            if (node instanceof Element) {
              this.translateTree(node);
            } else {
              this.translateTextMutation(node);
            }
          }
        }
      });
      this.observer.observe(document.documentElement, {
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: [
          'placeholder',
          'value',
          ...TRANSLATABLE_ATTRIBUTES,
        ],
        subtree: true,
      });
    }
  }

  restore(): void {
    this.observer?.disconnect();
    this.observer = undefined;
    while (this.restores.length > 0) {
      this.restores.pop()?.();
    }
    this.routeFinderDocument = false;
    this.sunShadeDocument = false;
    this.userProfileDocument = false;
    this.contactUserDocument = false;
  }

  private translateTree(root: ParentNode): void {
    this.userProfileDocument = this.userProfileDocument
      || rootMatchesOrContains(root, '#user-profile');
    this.contactUserDocument = this.contactUserDocument
      || rootMatchesOrContains(root, '#contact-user, [data-contact-user], form[action*="/contact-user"]');
    if (root instanceof Element && isExtensionContent(root)) {
      return;
    }
    if (root instanceof Element && root.matches(TEXT_SELECTOR)) {
      this.translateElement(root);
    }
    root.querySelectorAll<HTMLElement>(TEXT_SELECTOR).forEach((element) => {
      if (!isExtensionContent(element)) {
        this.translateElement(element);
      }
    });
    if (root instanceof Element && root.matches(INPUT_SELECTOR)) {
      this.translateInput(root as HTMLInputElement | HTMLTextAreaElement);
    }
    root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(INPUT_SELECTOR)
      .forEach((element) => {
        if (!isExtensionContent(element)) {
          this.translateInput(element);
        }
      });
    if (root instanceof Element && root.matches(ATTRIBUTE_SELECTOR)) {
      this.translateAttributes(root);
    }
    root.querySelectorAll<HTMLElement>(ATTRIBUTE_SELECTOR)
      .forEach((element) => {
        if (!isExtensionContent(element)) {
          this.translateAttributes(element);
        }
      });
  }

  private translateTextMutation(node: Node): void {
    if (node.nodeType !== Node.TEXT_NODE) {
      return;
    }

    const parent = node.parentElement;
    if (parent?.matches(TEXT_SELECTOR) && !isExtensionContent(parent)) {
      this.translateElement(parent);
    }
  }

  private translateAttributeMutation(element: Element, attribute: string | null): void {
    if (!attribute) {
      return;
    }
    if (isExtensionContent(element)) {
      return;
    }
    if ((attribute === 'placeholder' || attribute === 'value')
      && element.matches(INPUT_SELECTOR)) {
      this.translateInput(element as HTMLInputElement | HTMLTextAreaElement);
    }
    if ((TRANSLATABLE_ATTRIBUTES as readonly string[]).includes(attribute)) {
      this.translateAttributes(element);
    }
  }

  private translateElement(element: Element): void {
    let pathTranslation: string | undefined;
    if (element instanceof HTMLAnchorElement) {
      const path = normalizePath(element);
      if (path) {
        pathTranslation = PATH_TRANSLATIONS[path];
      }
    }

    const textNodes = Array.from(element.childNodes).filter(
      (node): node is Text => node.nodeType === Node.TEXT_NODE && Boolean(node.nodeValue?.trim()),
    );
    if (textNodes.length === 0) {
      return;
    }

    for (const [index, node] of textNodes.entries()) {
      const state = this.textStates.get(node);
      const original = node.nodeValue ?? '';
      if (state && (
        original === state.translated
        || normalizedText(original) === normalizedText(state.translated)
      )) {
        continue;
      }
      const translated = index === 0 && textNodes.length === 1 && pathTranslation
        ? pathTranslation
        : this.translateFixedUiText(original, element)
          ?? (this.routeFinderDocument && isRouteFinderUiElement(element)
            ? translateRouteFinderUiText(original)
            : undefined);
      if (!translated) {
        if (state) {
          state.original = original;
          state.translated = original;
        }
        continue;
      }

      const translatedWithWhitespace = withOriginalWhitespace(original, translated);
      if (state) {
        state.original = original;
        state.translated = translatedWithWhitespace;
      } else {
        const nextState: TextState = {
          original,
          translated: translatedWithWhitespace,
        };
        this.textStates.set(node, nextState);
        this.restores.push(() => {
          node.nodeValue = nextState.original;
          this.textStates.delete(node);
        });
      }
      node.nodeValue = translatedWithWhitespace;
      this.onChange?.({
        id: this.idFor(node),
        category: 'ui',
        source: original.trim(),
        translated,
        status: 'translated',
        machine: false,
      }, element as HTMLElement);
    }
  }

  private translateInput(element: HTMLInputElement | HTMLTextAreaElement): void {
    const existing = this.inputStates.get(element);
    if (existing) {
      const original = existing.kind === 'placeholder'
        ? element.placeholder
        : (element as HTMLInputElement).value;
      if (original === existing.translated) {
        return;
      }
      const translated = existing.kind === 'placeholder'
        ? translatePlaceholder(original)
        : this.translateFixedUiText(original, element);
      existing.original = original;
      existing.translated = translated ?? original;
      if (!translated) {
        return;
      }
      this.writeInput(element, existing.kind, translated);
      this.recordInputChange(element, existing.kind, original, translated);
      return;
    }

    if (element.placeholder) {
      const translated = translatePlaceholder(element.placeholder);
      if (translated) {
        const original = element.placeholder;
        const state: InputState = { kind: 'placeholder', original, translated };
        this.inputStates.set(element, state);
        this.writeInput(element, state.kind, translated);
        this.recordInputChange(element, state.kind, original, translated);
        this.restores.push(() => {
          this.writeInput(element, state.kind, state.original);
          this.inputStates.delete(element);
        });
        return;
      }
    }

    if (element instanceof HTMLInputElement) {
      const translated = this.translateFixedUiText(element.value, element);
      if (translated) {
        const original = element.value;
        const state: InputState = { kind: 'value', original, translated };
        this.inputStates.set(element, state);
        this.writeInput(element, state.kind, translated);
        this.recordInputChange(element, state.kind, original, translated);
        this.restores.push(() => {
          this.writeInput(element, state.kind, state.original);
          this.inputStates.delete(element);
        });
      }
    }
  }

  private writeInput(
    element: HTMLInputElement | HTMLTextAreaElement,
    kind: InputState['kind'],
    value: string,
  ): void {
    if (kind === 'placeholder') {
      element.placeholder = value;
    } else {
      (element as HTMLInputElement).value = value;
    }
  }

  private recordInputChange(
    element: HTMLInputElement | HTMLTextAreaElement,
    kind: InputState['kind'],
    original: string,
    translated: string,
  ): void {
    this.onChange?.({
      id: kind === 'placeholder' ? `${this.idFor(element)}-placeholder` : this.idFor(element),
      category: 'ui',
      source: original,
      translated,
      status: 'translated',
      machine: false,
    }, element);
  }

  private translateAttributes(element: Element): void {
    for (const attribute of TRANSLATABLE_ATTRIBUTES) {
      const original = element.getAttribute(attribute);
      const states = this.attributeStates.get(element);
      const state = states?.get(attribute);
      if (!original || (state && original === state.translated)) {
        continue;
      }
      const translated = this.translateFixedUiText(original, element);
      if (!translated) {
        if (state) {
          state.original = original;
          state.translated = original;
        }
        continue;
      }

      if (state) {
        state.original = original;
        state.translated = translated;
      } else {
        const nextState: AttributeState = { original, translated };
        const nextStates = states ?? new Map<string, AttributeState>();
        nextStates.set(attribute, nextState);
        this.attributeStates.set(element, nextStates);
        this.restores.push(() => {
          element.setAttribute(attribute, nextState.original);
          nextStates.delete(attribute);
        });
      }
      element.setAttribute(attribute, translated);
      this.onChange?.({
        id: this.idForAttribute(element, attribute),
        category: 'ui',
        source: original.trim(),
        translated,
        status: 'translated',
        machine: false,
      }, element as HTMLElement);
    }
  }

  private idForAttribute(element: Element, attribute: string): string {
    return `${this.idFor(element)}-${attribute}`;
  }

  private translateFixedUiText(value: string, element: Element): string | undefined {
    if (element.closest('.is_classic_vote')) {
      return isClassicVoteUserData(element)
        ? undefined
        : translateClassicVoteUiText(value);
    }
    if (this.contactUserDocument) {
      return isProtectedContactUserContent(element)
        ? undefined
        : translateContactUserUiText(value) ?? translateUiText(value);
    }
    if (this.userProfileDocument) {
      const profileTranslation = translateUserProfileUiText(value);
      return isProtectedUserProfileContent(element) && !isUserProfileActionText(value)
        ? undefined
        : profileTranslation ?? translateUiText(value);
    }
    if (this.sunShadeDocument && element.closest('#sun-shade')) {
      return translateSunShadeUiText(value) ?? translateUiText(value);
    }
    return translateUiText(value);
  }

  private idFor(node: Node): string {
    const existing = this.ids.get(node);
    if (existing) {
      return existing;
    }
    const id = `ui-${this.nextId++}`;
    this.ids.set(node, id);
    return id;
  }
}
