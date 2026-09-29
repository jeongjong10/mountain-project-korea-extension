import {
  PATH_TRANSLATIONS,
  translateClassicVoteUiText,
  translateContactUserUiText,
  translateRouteFinderUiText,
  translateSunShadeUiText,
  translateUiText,
  translateUserProfileUiText,
  translatePlaceholder,
} from '../sites/mountain-project/contract/text/localization';
import type { TranslationRecord } from '../core/translation-record';
import {
  detectPath,
  normalizeMountainProjectPath,
} from '../sites/mountain-project/contract/routes';
import { USER_SELECTORS } from '../sites/mountain-project/contract/selectors/user';
import { AREA_SELECTORS } from '../sites/mountain-project/contract/selectors/area';
import { ROUTE_SELECTORS } from '../sites/mountain-project/contract/selectors/route';
import { SHARED_SELECTORS } from '../sites/mountain-project/contract/selectors/shared';
import {
  ROUTE_FINDER_SELECTORS,
  ROUTE_FINDER_UI_SCOPE,
} from '../sites/mountain-project/contract/selectors/route-finder';
import { DateLocalizer } from './date-localizer';
import { FORUM_SELECTORS } from '../sites/mountain-project/contract/selectors/forum';
import { SEARCH_SELECTORS } from '../sites/mountain-project/contract/selectors/search';
import { translateForumUi, translateForumPlaceholder } from '../sites/mountain-project/contract/text/forum';
import { COMMUNITY_SELECTORS } from '../sites/mountain-project/contract/selectors/community';
import { BROWSING_PAGE_KINDS, translateCommunityUi } from '../sites/mountain-project/contract/text/community';
import { SECTION_TITLE_TRANSLATIONS } from '../sites/mountain-project/contract/text/sections';
import { HELP_SELECTORS } from '../sites/mountain-project/contract/selectors/help';
import { translateHelpPlaceholder, translateHelpUi } from '../sites/mountain-project/contract/text/help';
import { ABOUT_SELECTORS } from '../sites/mountain-project/contract/selectors/about';
import { translateAboutUi } from '../sites/mountain-project/contract/text/about';
import { HelpHubLocalizer } from './help-hub-localizer';
import {
  translateContributionOverlayUiText,
  translateContributionPlaceholder,
  translateContributionRouteSortFragment,
  translateContributionUiText,
} from '../sites/mountain-project/contract/text/contribution';
import { CONTRIBUTION_SELECTORS } from '../sites/mountain-project/contract/selectors/contribution';
import { translateContributionFaqUiText } from '../sites/mountain-project/contract/text/contribution-faq';
import {
  isKnownHeaderDropdownUiText,
  translateDropdownUiText,
} from '../sites/mountain-project/contract/text/dropdown';
import {
  DROPDOWN_SELECTORS,
  DROPDOWN_UI_SELECTOR,
} from '../sites/mountain-project/contract/selectors/dropdown';
import { PARTNER_FINDER_SELECTORS } from '../sites/mountain-project/contract/selectors/partner-finder';
import {
  translatePartnerFinderPlaceholder,
  translatePartnerFinderResultUi,
  translatePartnerFinderSearchUi,
  translatePartnerFinderUi,
} from '../sites/mountain-project/contract/text/partner-finder';

type Restore = () => void;
type ChangeListener = (record: TranslationRecord, element: HTMLElement) => void;

interface TextState {
  original: string;
  translated: string;
}

interface InputState {
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
  `${ROUTE_SELECTORS.youAndRoute} .mt-quarter`,
  SHARED_SELECTORS.directUiText,
  ROUTE_FINDER_SELECTORS.resultSummary,
  '[role="button"]',
  '[role="menuitem"]',
  '[role="status"]',
  '[role="alert"]',
  '.dropdown-header',
  `${ROUTE_SELECTORS.sunShade} .mb-half`,
  `${ROUTE_SELECTORS.sunShade} svg text`,
  ROUTE_SELECTORS.classicVote,
  USER_SELECTORS.actionCard,
  COMMUNITY_SELECTORS.uiExtra,
  FORUM_SELECTORS.uiText,
  SEARCH_SELECTORS.uiText,
  HELP_SELECTORS.uiText,
  CONTRIBUTION_SELECTORS.helperText,
  CONTRIBUTION_SELECTORS.uiText,
  PARTNER_FINDER_SELECTORS.uiText,
  DROPDOWN_UI_SELECTOR,
].join(',');

const INPUT_SELECTOR = [
  'input[placeholder]',
  'textarea[placeholder]',
  '#flag-content-form input[type="submit"]:not([name])',
].join(',');

const TRANSLATABLE_ATTRIBUTES = ['title', 'aria-label', 'alt'] as const;
const ATTRIBUTE_SELECTOR = TRANSLATABLE_ATTRIBUTES
  .map((attribute) => `[${attribute}]`)
  .join(',');
const EXTENSION_CONTENT_SELECTOR = [
  '.mpkr-machine-translation',
  '.mpkr-original-toggle-host',
  '.mpkr-translation-notice',
  '.mpkr-original-section-content',
  HELP_SELECTORS.inlineSource,
].join(', ');

function normalizePath(anchor: HTMLAnchorElement): string | undefined {
  try {
    return normalizeMountainProjectPath(
      new URL(anchor.href, anchor.ownerDocument.baseURI).pathname,
    );
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

function partnerFinderResultHeadingFragments(
  element: Element,
  textNodes: readonly Text[],
): ReadonlyMap<Text, string> | undefined {
  if (!element.matches(PARTNER_FINDER_SELECTORS.resultCountHeading)) return undefined;

  const match = normalizedText(element.textContent ?? '')
    .match(/^Found ([\d,]+) possible partners who:$/u);
  if (!match || textNodes.length !== 2) return undefined;

  const countChild = Array.from(element.children).filter(
    (child) => normalizedText(child.textContent ?? '') === match[1],
  );
  if (countChild.length !== 1) return undefined;

  const children = Array.from(element.childNodes);
  const countIndex = children.indexOf(countChild[0]!);
  const prefixIndex = children.indexOf(textNodes[0]!);
  const suffixIndex = children.indexOf(textNodes[1]!);
  if (prefixIndex >= countIndex || suffixIndex <= countIndex
    || normalizedText(textNodes[0]!.nodeValue ?? '') !== 'Found'
    || normalizedText(textNodes[1]!.nodeValue ?? '') !== 'possible partners who:') {
    return undefined;
  }

  return new Map([
    [textNodes[0]!, '가능한 파트너 '],
    [textNodes[1]!, '명:'],
  ]);
}

function isExtensionContent(element: Element): boolean {
  return Boolean(element.closest(EXTENSION_CONTENT_SELECTOR));
}

function isRouteFinderUiElement(element: Element): boolean {
  return Boolean(element.closest(ROUTE_FINDER_UI_SCOPE))
    || element.matches('[role="status"], [role="alert"]');
}

function isClassicVoteUserData(element: Element): boolean {
  return Boolean(element.closest(ROUTE_SELECTORS.classicVoteUserData));
}

function isProtectedUserProfileContent(element: Element): boolean {
  return Boolean(element.closest(USER_SELECTORS.protectedProfileContent));
}

function isUserProfileActionText(value: string): boolean {
  return /^(?:View (?:Comment|Message|Post|Reply|Change)|Load More|Previous|Next)$/
    .test(normalizedText(value));
}

function isProtectedContactUserContent(element: Element): boolean {
  return Boolean(element.closest(USER_SELECTORS.protectedContactContent));
}

function isProtectedEntityLinkText(element: Element, value: string): boolean {
  const entityLink = element.closest<HTMLAnchorElement>('a[href]');
  if (!entityLink) return false;
  const rawHref = entityLink.getAttribute('href')?.trim() ?? '';
  if (!rawHref || rawHref.startsWith('#')) return false;
  const path = normalizePath(entityLink) ?? '';
  const isEntityPage = /^\/(?:area|route|photo)\/\d+(?:\/[^/]+)?$/.test(path)
    || /^\/user\/\d+\/[^/]+(?:\/(?:contributions|community))?$/.test(path);
  if (!isEntityPage) return false;
  // Entity cards also contain fixed metadata and navigation; their names stay protected.
  if (element.closest(ROUTE_FINDER_SELECTORS.resultMetadata)) return false;
  if (path.startsWith('/user/') && element.closest(USER_SELECTORS.profileNavigation)
    && /^(?:Out There|Contributions|Community)(?: \([\d,]+\))?$/.test(normalizedText(value))) {
    return false;
  }
  if (normalizedText(value) === 'View Comment'
    && entityLink.hash.startsWith('#Comment-')
    && (entityLink.matches(USER_SELECTORS.activityAction)
      || entityLink.closest(COMMUNITY_SELECTORS.activityRow))) return false;
  return !(element.closest(DROPDOWN_SELECTORS.headerFixedItem)
    && isKnownHeaderDropdownUiText(value));
}

function isContributionCancelAction(element: Element, value: string): boolean {
  return element.matches('a.cancel') && normalizedText(value) === 'Cancel';
}

function isProtectedContributionAuthoredContent(element: Element): boolean {
  const textChangeForm = element.closest<HTMLFormElement>(
    'form[action$="/improvement/text-climb"]',
  );
  return Boolean(textChangeForm && element.closest('.fr-element, .fr-view'));
}

function isRouteSortInstructionFragment(element: Element): boolean {
  return Boolean(element.closest(
    'form[action$="/improvement/route-sort"] .mt-2.text-nowrap',
  ));
}

function isDropdownUiElement(element: Element): boolean {
  return element.matches(DROPDOWN_UI_SELECTOR);
}

function isProtectedDropdownAuthoredData(element: Element): boolean {
  return Boolean(element.closest(DROPDOWN_SELECTORS.protectedAuthoredData));
}

function isSearchUiElement(element: Element): boolean {
  // Result cards can contain dictionary words in authored titles and snippets.
  if (element.closest('a[href]')) return false;
  if (element.closest(SEARCH_SELECTORS.controls)) return true;
  // The category filter is a group of label/count pairs. Recognize that shape,
  // not generated React classes, a fixed position, or the current result counts.
  const pair = element.parentElement;
  const group = pair?.parentElement;
  if (!pair || !group || !group.closest(SEARCH_SELECTORS.root)) return false;
  const categories = new Set(['Show All', 'Routes', 'Areas', 'Users', 'Photos', 'Forums']);
  const names = new Set([...categories, ...[...categories].map(name => translateForumUi(name))]);
  const pairs = [...group.children];
  return pairs.length >= 2 && pairs.every(item => {
    const [label, count] = [...item.children];
    return item.children.length === 2 && label?.tagName === 'DIV' && count?.tagName === 'DIV'
      && label.children.length === 0 && count.children.length === 0
      && names.has(normalizedText(label.textContent ?? ''))
      && /^(?:[\d,]*|Loading(?:\.\.\.|…))$/.test(normalizedText(count.textContent ?? ''));
  }) && element === pair.firstElementChild;
}

function partnerFinderResultCell(element: Element): HTMLTableCellElement | undefined {
  const cell = element.closest<HTMLTableCellElement>('td');
  const row = cell?.closest<HTMLTableRowElement>(PARTNER_FINDER_SELECTORS.resultRows);
  return row?.querySelector(PARTNER_FINDER_SELECTORS.profileLink) ? cell ?? undefined : undefined;
}

function lineIndexWithinCell(cell: HTMLTableCellElement, node: Text): number {
  if (cell.querySelector('br')) {
    const walker = cell.ownerDocument.createTreeWalker(cell, 5);
    let line = 0;
    for (let current = walker.nextNode(); current; current = walker.nextNode()) {
      if (current === node) return line;
      if (current instanceof HTMLBRElement) line += 1;
    }
    return -1;
  }

  let topLevel: Node = node;
  while (topLevel.parentNode && topLevel.parentNode !== cell) {
    topLevel = topLevel.parentNode;
  }
  return Array.from(cell.childNodes)
    .filter((child) => child instanceof Element || Boolean(child.nodeValue?.trim()))
    .indexOf(topLevel as ChildNode);
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
  private readonly submitValueStates = new WeakMap<HTMLInputElement, InputState>();
  private readonly attributeStates = new WeakMap<Element, Map<string, AttributeState>>();
  private readonly ids = new WeakMap<Node, string>();
  private observer: MutationObserver | undefined;
  private nextId = 1;
  private routeFinderDocument = false;
  private sunShadeDocument = false;
  private userProfileDocument = false;
  private contactUserDocument = false;
  private browsingDocument = false;
  private forumDocument = false;
  private searchDocument = false;
  private helpDocument = false;
  private contributionDocument = false;
  private partnerFinderDocument = false;
  private readonly dateLocalizer: DateLocalizer;
  private readonly helpHubLocalizer = new HelpHubLocalizer();

  constructor(private readonly onChange?: ChangeListener) {
    this.dateLocalizer = new DateLocalizer(onChange);
  }

  apply(root: ParentNode = document): void {
    const ownerDocument = root.nodeType === Node.DOCUMENT_NODE ? root as Document : root.ownerDocument;
    const pageKind = ownerDocument?.location
      ? detectPath(ownerDocument.location.pathname)
      : 'unsupported';
    this.searchDocument = pageKind === 'search';
    this.browsingDocument = BROWSING_PAGE_KINDS.includes(pageKind) || this.searchDocument;
    this.forumDocument = pageKind === 'forum' || pageKind === 'forum-topic'
      || pageKind === 'forum-form' || this.searchDocument;
    this.contributionDocument = this.contributionDocument || pageKind === 'contribution';
    this.partnerFinderDocument = this.partnerFinderDocument || pageKind === 'partner-finder';
    this.helpDocument = this.helpDocument
      || pageKind === 'help'
      || pageKind === 'help-hub'
      || pageKind === 'name-review';
    this.routeFinderDocument = this.routeFinderDocument
      || pageKind === 'route-finder'
      || Boolean(root.querySelector(ROUTE_FINDER_SELECTORS.form));
    this.sunShadeDocument = this.sunShadeDocument
      || pageKind === 'area'
      || pageKind === 'route'
      || rootMatchesOrContains(root, `${AREA_SELECTORS.page}, ${ROUTE_SELECTORS.page}`);
    this.userProfileDocument = this.userProfileDocument
      || pageKind === 'user'
      || rootMatchesOrContains(root, USER_SELECTORS.profileRoot);
    this.contactUserDocument = this.contactUserDocument
      || pageKind === 'contact-user'
      || rootMatchesOrContains(root, USER_SELECTORS.contactRoot);
    this.translateTree(root);
    if (this.helpDocument) this.helpHubLocalizer.apply(root);
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
        if (this.helpDocument) this.helpHubLocalizer.apply(document);
      });
      this.observer.observe(document.documentElement, {
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: [
          'placeholder',
          ...TRANSLATABLE_ATTRIBUTES,
        ],
        subtree: true,
      });
    }
  }

  restore(): void {
    this.observer?.disconnect();
    this.observer = undefined;
    this.helpHubLocalizer.restore();
    while (this.restores.length > 0) {
      this.restores.pop()?.();
    }
    this.dateLocalizer.restore();
    this.routeFinderDocument = false;
    this.sunShadeDocument = false;
    this.userProfileDocument = false;
    this.contactUserDocument = false;
    this.browsingDocument = false;
    this.forumDocument = false;
    this.searchDocument = false;
    this.helpDocument = false;
    this.contributionDocument = false;
    this.partnerFinderDocument = false;
  }

  private translateTree(root: ParentNode): void {
    this.userProfileDocument = this.userProfileDocument
      || rootMatchesOrContains(root, USER_SELECTORS.profileRoot);
    this.contactUserDocument = this.contactUserDocument
      || rootMatchesOrContains(root, USER_SELECTORS.contactRoot);
    if (root instanceof Element && isExtensionContent(root)) {
      return;
    }
    if (!this.forumDocument) this.dateLocalizer.apply(root);
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
    if (parent && !this.forumDocument && !isExtensionContent(parent)) {
      this.dateLocalizer.apply(parent);
    }
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
    if (attribute === 'placeholder' && element.matches(INPUT_SELECTOR)) {
      this.translateInput(element as HTMLInputElement | HTMLTextAreaElement);
    }
    if ((TRANSLATABLE_ATTRIBUTES as readonly string[]).includes(attribute)) {
      this.translateAttributes(element);
    }
  }

  private translateElement(element: Element): void {
    if (this.isProtectedBrowsingContent(element)
      && !(this.partnerFinderDocument
        && element.matches(PARTNER_FINDER_SELECTORS.resultFixedLabels))) return;
    // Option text is also its submitted value unless the site supplies an explicit value.
    if (element instanceof HTMLOptionElement && !element.hasAttribute('value')) return;
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
    const resultHeadingFragments = this.partnerFinderDocument
      ? partnerFinderResultHeadingFragments(element, textNodes)
      : undefined;

    for (const [index, node] of textNodes.entries()) {
      const state = this.textStates.get(node);
      const original = node.nodeValue ?? '';
      if (state && (
        original === state.translated
        || normalizedText(original) === normalizedText(state.translated)
      )) {
        continue;
      }
      const headingFragment = resultHeadingFragments?.get(node);
      const translated = headingFragment ?? (isProtectedEntityLinkText(element, original)
        && !isContributionCancelAction(element, original)
        ? undefined
        : this.translateFixedUiText(original, element, node)
          ?? (index === 0 && textNodes.length === 1 ? pathTranslation : undefined)
          ?? (this.routeFinderDocument && isRouteFinderUiElement(element)
            ? translateRouteFinderUiText(original)
            : undefined));
      if (!translated) {
        if (state) {
          state.original = original;
          state.translated = original;
        }
        continue;
      }

      const translatedWithWhitespace = headingFragment
        ?? withOriginalWhitespace(original, translated);
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
    if (this.forumDocument && element.closest(
      'input[type="hidden"], input[type="password"], [contenteditable]:not([contenteditable="false"])',
    )) return;
    if (element instanceof HTMLInputElement
      && element.type === 'submit'
      && !element.hasAttribute('name')) {
      this.translateUiSubmitValue(element);
      return;
    }
    const existing = this.inputStates.get(element);
    const original = element.placeholder;
    if (existing && original === existing.translated) {
      return;
    }
    const translated = (this.partnerFinderDocument
      ? translatePartnerFinderPlaceholder(original)
      : undefined)
      ?? (this.forumDocument ? translateForumPlaceholder(original) : undefined)
      ?? translatePlaceholder(original)
      ?? (this.isContributionElement(element) ? translateContributionPlaceholder(original) : undefined)
      ?? (this.helpDocument ? translateHelpPlaceholder(original) : undefined)
      ?? (this.browsingDocument ? translateCommunityUi(original) : undefined);
    if (existing) {
      existing.original = original;
      existing.translated = translated ?? original;
    }
    if (!translated) {
      return;
    }
    if (!existing) {
      const state: InputState = { original, translated };
      this.inputStates.set(element, state);
      this.restores.push(() => {
        element.placeholder = state.original;
        this.inputStates.delete(element);
      });
    }
    element.placeholder = translated;
    this.recordInputChange(element, original, translated);
  }

  private translateUiSubmitValue(element: HTMLInputElement): void {
    const existing = this.submitValueStates.get(element);
    const original = element.value;
    if (existing && original === existing.translated) return;
    const translated = this.isContributionElement(element)
      ? translateContributionOverlayUiText(original) ?? translateContributionUiText(original)
      : undefined;
    if (existing) {
      existing.original = original;
      existing.translated = translated ?? original;
    }
    if (!translated) return;
    if (!existing) {
      const state: InputState = { original, translated };
      this.submitValueStates.set(element, state);
      this.restores.push(() => {
        element.value = state.original;
        this.submitValueStates.delete(element);
      });
    }
    element.value = translated;
    this.recordInputChange(element, original, translated);
  }

  private recordInputChange(
    element: HTMLInputElement | HTMLTextAreaElement,
    original: string,
    translated: string,
  ): void {
    this.onChange?.({
      id: `${this.idFor(element)}-placeholder`,
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

  private translateFixedUiText(
    value: string,
    element: Element,
    node?: Text,
  ): string | undefined {
    if (element.closest(ABOUT_SELECTORS.page)) {
      if (element.closest(ABOUT_SELECTORS.authoredContent)
        || element.closest(ABOUT_SELECTORS.protectedData)) return undefined;
      return translateAboutUi(value) ?? translateUiText(value);
    }
    if (this.partnerFinderDocument) {
      const resultCell = partnerFinderResultCell(element);
      if (resultCell) {
        const row = resultCell.parentElement as HTMLTableRowElement;
        const cellIndex = Array.from(row.cells).indexOf(resultCell);
        if (cellIndex === 0) return translatePartnerFinderResultUi(value, 'name');
        if (cellIndex === 1) {
          const line = node ? lineIndexWithinCell(resultCell, node) : -1;
          if (line === 1) return translatePartnerFinderResultUi(value, 'gender');
          if (line >= 2) return translatePartnerFinderResultUi(value, 'climb-types');
          return undefined;
        }
        if (cellIndex === 2) return translatePartnerFinderResultUi(value, 'climbs');
        if ((cellIndex === 3 || cellIndex === 4)
          && element.matches(PARTNER_FINDER_SELECTORS.resultFixedLabels)) {
          return translatePartnerFinderResultUi(value, 'label');
        }
        return undefined;
      }
    }
    if (this.isProtectedBrowsingContent(element)) return undefined;
    if (isProtectedContributionAuthoredContent(element)) return undefined;
    if (isRouteSortInstructionFragment(element)) {
      return translateContributionRouteSortFragment(value);
    }
    if (isProtectedEntityLinkText(element, value)
      && !isContributionCancelAction(element, value)) return undefined;
    // Forum actions also match generic /add and /edit contribution selectors.
    // Resolve their fixed chrome before those broader contribution fallbacks.
    const forumUi = this.forumDocument ? translateForumUi(value) : undefined;
    if (forumUi) return forumUi;
    const partnerFinderUi = this.partnerFinderDocument
      ? (element.closest(PARTNER_FINDER_SELECTORS.searchForm)
        ? translatePartnerFinderSearchUi(value)
        : undefined) ?? translatePartnerFinderUi(value)
      : undefined;
    if (partnerFinderUi) return partnerFinderUi;
    if (isDropdownUiElement(element)) {
      if (isProtectedDropdownAuthoredData(element)) return undefined;
      return translateDropdownUiText(value)
        ?? translateContributionUiText(value)
        ?? translateUiText(value);
    }
    if (element.matches(CONTRIBUTION_SELECTORS.faqScope)
      || element.closest(CONTRIBUTION_SELECTORS.faqScope)) {
      return translateContributionFaqUiText(value)
        ?? translateContributionOverlayUiText(value)
        ?? translateContributionUiText(value)
        ?? translateUiText(value);
    }
    if (element.matches(CONTRIBUTION_SELECTORS.overlayScope)
      || element.closest(CONTRIBUTION_SELECTORS.overlayScope)) {
      return translateContributionOverlayUiText(value)
        ?? translateContributionUiText(value)
        ?? translateUiText(value);
    }
    if (this.isContributionElement(element)) {
      return translateContributionUiText(value) ?? translateUiText(value);
    }
    if (this.helpDocument) {
      if (this.isProtectedHelpContent(element)) return undefined;
      return translateHelpUi(value) ?? translateUiText(value);
    }
    if (element.matches('h2, h3')) {
      const sectionTitle = SECTION_TITLE_TRANSLATIONS[normalizedText(value)];
      if (sectionTitle) return sectionTitle;
    }
    if (this.forumDocument) return translateForumUi(value) ?? translateCommunityUi(value) ?? translateUiText(value);
    if (this.browsingDocument) return translateCommunityUi(value) ?? translateUiText(value);
    if (element.closest(ROUTE_SELECTORS.classicVote)) {
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
    if (this.sunShadeDocument && element.closest(ROUTE_SELECTORS.sunShade)) {
      return translateSunShadeUiText(value) ?? translateUiText(value);
    }
    return translateUiText(value);
  }

  private isContributionElement(element: Element): boolean {
    return this.contributionDocument
      || element.matches(CONTRIBUTION_SELECTORS.scope)
      || Boolean(element.closest(CONTRIBUTION_SELECTORS.scope));
  }

  private isProtectedBrowsingContent(element: Element): boolean {
    if (!this.browsingDocument) return false;
    if (this.partnerFinderDocument
      && element.closest(PARTNER_FINDER_SELECTORS.authoredCells)) return true;
    if (this.searchDocument && element.closest(SEARCH_SELECTORS.root)
      && !isSearchUiElement(element)) return true;
    if (this.forumDocument && element.closest(
      `${FORUM_SELECTORS.metadata}, input[type="hidden"], input[type="password"], [contenteditable]:not([contenteditable="false"])`,
    )) return true;
    if (element.closest(COMMUNITY_SELECTORS.protectedContent)) return true;
    if (element.closest(COMMUNITY_SELECTORS.protectedGymValue)) return true;
    if (detectPath(element.ownerDocument.location.pathname) === 'gym'
      && element.closest(COMMUNITY_SELECTORS.gymDetailTitle)) return true;
    if (element.matches(COMMUNITY_SELECTORS.activityComment)) return true;
    const anchor = element.closest<HTMLAnchorElement>('a[href]');
    const path = anchor ? normalizePath(anchor) ?? '' : '';
    if (/^\/(?:user|area|route|gym)\/\d+/.test(path)
      && !/^View (?:Comment|Message|Post|Reply)$/.test(anchor?.textContent?.trim() ?? '')) return true;
    // A same-topic reply button is navigation chrome, including absolute #reply URLs.
    const replyAction = this.forumDocument && anchor?.hash === '#reply'
      && anchor.matches('#topic-guts a.btn, #topic-guts a.require-user');
    const href = anchor?.getAttribute('href')?.trim();
    if (href && !href.startsWith('#') && /^\/forum\/topic\/\d+/.test(path)
      && !anchor?.classList.contains('permalink') && !replyAction) return true;
    return Boolean(element.closest(FORUM_SELECTORS.authoredTitle));
  }

  private isProtectedHelpContent(element: Element): boolean {
    if (!this.helpDocument) return false;
    if (element.matches(HELP_SELECTORS.nameReviewTitle)
      || element.closest(HELP_SELECTORS.nameReviewTitle)) return false;
    if (element.closest(HELP_SELECTORS.inlineSource)) return true;
    if (element.closest(HELP_SELECTORS.protectedFeatureRequestData)) return true;
    return Boolean(element.closest(HELP_SELECTORS.authoredContent));
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
