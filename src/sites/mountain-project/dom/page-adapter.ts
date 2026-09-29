import type { DomTranslationTarget, TranslationPageAdapter } from '../../../application/ports';
import { PHOTO_TEXT_SELECTOR, PHOTO_CONTAINER_SELECTOR } from '../contract/selectors/photo';
import { isSouthKoreaScopedPage } from './page-capabilities';
import { STATS_SELECTORS } from '../contract/selectors/stats';
import { COMMUNITY_SELECTORS } from '../contract/selectors/community';
import { FORUM_SELECTORS } from '../contract/selectors/forum';
import { detectPage } from '../contract/routes';
import { AREA_SELECTORS } from '../contract/selectors/area';
import { ABOUT_SELECTORS } from '../contract/selectors/about';
import {
  SECTION_CATEGORY_BY_HEADING,
  SECTION_TITLE_TRANSLATIONS,
} from '../contract/text/sections';
import {
  HELP_AUTHORED_ROOT_SELECTOR,
  HELP_SELECTORS,
} from '../contract/selectors/help';
import {
  locateAuthoredSection,
  normalizedSectionHeading,
} from './authored-section';
import { serializeDomTranslation } from '../../../rendering/dom-translation-format';
import { PARTNER_FINDER_SELECTORS } from '../contract/selectors/partner-finder';
import { isPartnerFinderResultHeaders } from '../contract/text/partner-finder';

const CONTENT_BLOCK_SELECTOR = 'p, li, div, blockquote, pre, h3, h4, h5, h6';
const COMMENT_METADATA_SELECTOR = '.comment-time, .author, [rel="author"], time';
const FORUM_TRANSLATION_UI_SELECTOR = '.mpkr-machine-translation, .mpkr-translation-notice, .mpkr-original-toggle-host';
const FORUM_NON_AUTHORED_SELECTOR = [
  FORUM_TRANSLATION_UI_SELECTOR,
  '[contenteditable]:not([contenteditable="false"])',
  'form', 'input', 'textarea', 'select', 'button',
].join(', ');
const STATS_TICK_ROW_SELECTOR = STATS_SELECTORS.tickRows;
const STATS_TICK_NOTE_CLASS = 'mpkr-stats-tick-note-source';
const ROUTE_FINDER_SNIPPET_SELECTOR = [
  '.route-row [data-route-description]',
  '.route-row .route-description',
  '.route-row .route-summary',
  '.route-row .route-snippet',
].join(', ');
const EXCLUDED_CONTENT_SELECTOR = [
  '.comment-body',
  '.comment-time',
  '.author',
  '[rel="author"]',
  'time',
  'script',
  'style',
  'noscript',
  '.mpkr-machine-translation',
  '.mpkr-translation-notice',
].join(', ');
const HELP_INLINE_SOURCE_CLASS = HELP_SELECTORS.inlineSource.slice(1);
const INLINE_DOCUMENT_ROOT_SELECTOR = [
  HELP_AUTHORED_ROOT_SELECTOR,
  ABOUT_SELECTORS.authoredContent,
].join(', ');
const AREA_HEADING_SOURCE_CLASS = 'mpkr-area-heading-source';
const TEXT_RUN_SOURCE_CLASS = 'mpkr-text-run-source';
const FORUM_TITLE_SOURCE_CLASS = 'mpkr-forum-title-source';
const PARTNER_FINDER_SOURCE_CLASS = PARTNER_FINDER_SELECTORS.authoredSource.slice(1);
const HELP_TEXT_EXCLUSION_SELECTOR = [
  'script',
  'style',
  'noscript',
  'svg',
  'input',
  'textarea',
  'select',
  '[contenteditable="true"]',
  HELP_SELECTORS.nameReviewTitle,
].join(', ');
const TRUSTED_ENTITY_LINK_SELECTOR = [
  'a[href*="/area/"]',
  'a[href*="/route/"]',
  'a[href*="/user/"]',
].join(', ');
const TRUSTED_PAGE_NAME_SELECTOR = [
  `${AREA_SELECTORS.page} h1`,
  '#route-page h1',
].join(', ');


function matchingElements(root: ParentNode, selector: string): HTMLElement[] {
  const elements: HTMLElement[] = [];
  if (root instanceof HTMLElement && root.matches(selector)) {
    elements.push(root);
  }
  root.querySelectorAll<HTMLElement>(selector).forEach((element) => elements.push(element));
  return elements;
}

function forumTitleElements(root: ParentNode): HTMLElement[] {
  return matchingElements(root, 'h1, h3, a[href*="/forum/topic/"]')
    .filter((element) => element.matches(FORUM_SELECTORS.authoredTitle));
}

/** Renderer reset removes translation siblings before inserting a replacement. */
function nextForumSibling(source: HTMLElement): ChildNode | null {
  let next = source.nextSibling;
  while (next instanceof Element && next.matches(FORUM_TRANSLATION_UI_SELECTOR)) {
    next = next.nextSibling;
  }
  return next;
}

/** A quoted .fr-view belongs to its enclosing post, including during mutation scans. */
function outerForumBody(element: Element): HTMLElement | undefined {
  let body = element.closest<HTMLElement>(COMMUNITY_SELECTORS.topicBody);
  if (!body) return undefined;
  let enclosing = body.parentElement?.closest<HTMLElement>(COMMUNITY_SELECTORS.topicBody);
  while (enclosing) {
    body = enclosing;
    enclosing = body.parentElement?.closest<HTMLElement>(COMMUNITY_SELECTORS.topicBody);
  }
  return body;
}

function meaningfulEnglish(text: string): boolean {
  const normalized = text.replace(/\s+/g, ' ').trim();
  return normalized.length >= 3
    && /[A-Za-z]{3}/.test(normalized)
    && !/^https?:\/\/\S+$/.test(normalized);
}

function textForTranslation(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.nodeValue ?? '';
  }
  if (!(node instanceof Element)) {
    return '';
  }
  if (isExcludedContent(node)) {
    return '';
  }
  if (node.tagName === 'BR') {
    return ' ';
  }
  return Array.from(node.childNodes).map(textForTranslation).join(' ');
}

function normalizedText(element: Element): string {
  return textForTranslation(element).replace(/\s+/g, ' ').trim();
}

function boundaryTrimmedText(value: string): string {
  const leading = value.match(/^\s*/u)?.[0].length ?? 0;
  const trailing = value.match(/\s*$/u)?.[0].length ?? 0;
  return value.slice(leading, trailing > 0 ? value.length - trailing : value.length);
}

function isExcludedContent(element: Element): boolean {
  return element.matches(EXCLUDED_CONTENT_SELECTOR)
    || element.closest(EXCLUDED_CONTENT_SELECTOR) !== null;
}

function directFlowText(element: Element): string {
  return Array.from(element.childNodes)
    .map((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.nodeValue ?? '';
      }
      if (!(node instanceof Element)
        || node.matches(CONTENT_BLOCK_SELECTOR)
        || isExcludedContent(node)) {
        return '';
      }
      return textForTranslation(node);
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function immediateContentBlocks(element: Element): HTMLElement[] {
  const blocks: HTMLElement[] = [];

  Array.from(element.children).forEach((child) => {
    if (isExcludedContent(child)) {
      return;
    }
    if (child instanceof HTMLElement && child.matches(CONTENT_BLOCK_SELECTOR)) {
      blocks.push(child);
      return;
    }
    blocks.push(...immediateContentBlocks(child));
  });

  return blocks;
}

function collectContentBlocks(element: HTMLElement): HTMLElement[] {
  if (isExcludedContent(element)) {
    return [];
  }

  const source = normalizedText(element);
  if (!meaningfulEnglish(source)) {
    return [];
  }

  if (element.classList.contains('fr-view')
    && Array.from(element.children).some((child) => (
      child.classList.contains('mpkr-original-section-content')
    ))) {
    return [element];
  }

  const children = immediateContentBlocks(element);
  const ownsMeaningfulText = meaningfulEnglish(directFlowText(element));
  if (children.length === 0 || ownsMeaningfulText) {
    return [element];
  }

  return children.flatMap((child) => collectContentBlocks(child));
}

function normalizedVisibleText(element: Element): string {
  return (element.textContent ?? '').replace(/\s+/g, ' ').trim();
}

function trustedValuesFor(
  source: string,
  sourceElements: readonly HTMLElement[],
): string[] {
  const candidates = new Set<string>();
  for (const sourceElement of sourceElements) {
    if (sourceElement.matches(TRUSTED_ENTITY_LINK_SELECTOR)) {
      candidates.add(normalizedVisibleText(sourceElement));
    }
    sourceElement.querySelectorAll<HTMLElement>(TRUSTED_ENTITY_LINK_SELECTOR)
      .forEach((element) => candidates.add(normalizedVisibleText(element)));
  }
  const document = sourceElements[0]?.ownerDocument;
  document?.querySelectorAll<HTMLElement>(TRUSTED_PAGE_NAME_SELECTOR)
    .forEach((element) => candidates.add(normalizedVisibleText(element)));
  document?.querySelectorAll<HTMLElement>(`.breadcrumbs ${TRUSTED_ENTITY_LINK_SELECTOR}`)
    .forEach((element) => candidates.add(normalizedVisibleText(element)));
  return [...candidates]
    .filter((value) => value.length >= 2 && source.includes(value))
    .sort((left, right) => right.length - left.length);
}

function targetContext(
  source: string,
  sourceElements: readonly HTMLElement[],
  sectionHeading?: string,
): Pick<DomTranslationTarget, 'trustedValues' | 'sectionHeading'> {
  return {
    trustedValues: trustedValuesFor(source, sourceElements),
    ...(sectionHeading ? { sectionHeading } : {}),
  };
}

export class MountainProjectPageAdapter implements TranslationPageAdapter {
  private readonly ids = new WeakMap<Node, string>();
  private readonly textRunWrappers = new Set<HTMLElement>();
  private readonly helpInlineWrappers = new Set<HTMLElement>();
  private readonly helpInlineSources = new WeakMap<HTMLElement, string>();
  private readonly areaHeadingWrappers = new Set<HTMLElement>();
  private readonly forumTitleWrappers = new Set<HTMLElement>();
  private readonly partnerFinderWrappers = new Set<HTMLElement>();
  private readonly partnerFinderTables = new WeakSet<HTMLTableElement>();
  private nextId = 1;

  mutationRoots(records: MutationRecord[]): ParentNode[] {
    const roots = new Set<Element>();
    const owned = `.mpkr-translation-notice, .mpkr-machine-translation, .mpkr-original-toggle-host, ${HELP_SELECTORS.inlineSource}, .${AREA_HEADING_SOURCE_CLASS}, .${TEXT_RUN_SOURCE_CLASS}, .${PARTNER_FINDER_SOURCE_CLASS}`;
    const add = (node: Node): void => {
      const element = node instanceof Element ? node : node.parentElement;
      if (!element?.isConnected || element.closest(owned)) return;
      const content = outerForumBody(element) ?? element.closest('.fr-view');
      const heading = element.closest(`h2, h3, ${FORUM_SELECTORS.authoredTitle}`);
      const context = element.closest(`.comment-body, ${COMMUNITY_SELECTORS.activityComment}, ${STATS_TICK_ROW_SELECTOR}, ${PHOTO_TEXT_SELECTOR}, ${ROUTE_FINDER_SNIPPET_SELECTOR}, ${PARTNER_FINDER_SELECTORS.authoredCell}, ${INLINE_DOCUMENT_ROOT_SELECTOR}, ${HELP_SELECTORS.hubFeatureRequestContent}`);
      const root = content?.parentElement ?? heading?.parentElement ?? context ?? element;
      if (content || heading || context || forumTitleElements(root).length > 0
        || root.querySelector(`h2, h3, .fr-view, .comment-body, ${COMMUNITY_SELECTORS.activityComment}, ${STATS_TICK_ROW_SELECTOR}, ${PHOTO_TEXT_SELECTOR}, ${ROUTE_FINDER_SNIPPET_SELECTOR}, ${PARTNER_FINDER_SELECTORS.authoredCell}, ${INLINE_DOCUMENT_ROOT_SELECTOR}, ${HELP_SELECTORS.hubFeatureRequestContent}`)) roots.add(root);
    };
    for (const record of records) {
      if (record.type === 'characterData') add(record.target);
      else {
        const target = record.target instanceof Element ? record.target : record.target.parentElement;
        if (target?.closest(owned)) continue;
        if (target?.matches(PARTNER_FINDER_SELECTORS.authoredCell)
          && target.querySelector(`:scope > .${PARTNER_FINDER_SOURCE_CLASS}`)
          && record.addedNodes.length === 0
          && record.removedNodes.length > 0
          && Array.from(record.removedNodes).every((node) => (
            node.parentElement?.closest(`.${PARTNER_FINDER_SOURCE_CLASS}`)
          ))) continue;
        if (record.addedNodes.length > 0 && Array.from(record.addedNodes).every((node) => {
          const element = node instanceof Element ? node : node.parentElement;
          return Boolean(element?.matches(owned) || element?.closest(owned));
        })) continue;
        if (Array.from(record.addedNodes).some((node) => (
          node instanceof Element && node.matches(`.${AREA_HEADING_SOURCE_CLASS}, .${TEXT_RUN_SOURCE_CLASS}, .${FORUM_TITLE_SOURCE_CLASS}, .${PARTNER_FINDER_SOURCE_CLASS}`)
        ))) continue;
        for (const node of record.addedNodes) add(node);
        // The mutation target supplies semantic context for deleted/replaced text.
        if (target?.closest(`.fr-view, h2, h3, .comment-body, ${FORUM_SELECTORS.authoredTitle}, ${HELP_SELECTORS.hubFeatureRequestContent}`)) add(target);
      }
    }
    return [...roots].filter((root) => ![...roots].some((other) => other !== root && other.contains(root)));
  }

  /** @deprecated Region activation belongs to the page capability resolver. */
  isSouthKoreaPage(url: URL, root: ParentNode = document): boolean {
    return isSouthKoreaScopedPage(url, root);
  }

  collectPageTargets(root: ParentNode = document): DomTranslationTarget[] {
    const targets: DomTranslationTarget[] = [];

    targets.push(...this.collectAreaHeadingTargets(root));
    targets.push(...this.collectForumTitleTargets(root));
    targets.push(...this.collectPartnerFinderTargets(root));

    (matchingElements(root, 'h2, h3') as HTMLHeadingElement[]).forEach((heading) => {
      const title = normalizedSectionHeading(heading);
      const category: DomTranslationTarget['category'] | undefined =
        SECTION_CATEGORY_BY_HEADING[title]
        ?? (heading.closest(AREA_SELECTORS.page) ? 'description' : undefined);
      const section = locateAuthoredSection(heading);
      if (!category || !section) {
        return;
      }

      const { content } = section;
      const candidates = collectContentBlocks(content);
      for (const element of candidates) {
        const serialized = serializeDomTranslation(element, { omitElement: isExcludedContent });
        targets.push({
          id: this.idFor(element, category),
          category,
          source: serialized.source,
          semanticSource: serialized.semanticSource,
          format: serialized.format,
          sourceElements: [element],
          parent: element.parentElement ?? content,
          insertBefore: element.nextSibling,
          ...targetContext(serialized.source, [element], title),
        });
      }
    });

    if ((root instanceof Element && root.closest('#routeFinderForm')) || root.querySelector('#routeFinderForm') || document.querySelector('#routeFinderForm')) {
      matchingElements(root, ROUTE_FINDER_SNIPPET_SELECTOR).forEach((element) => {
        if (element.querySelector([
          'a[href*="/route/"]',
          'a[href*="/area/"]',
          '.rateYDS',
          '.scoreStars',
        ].join(', '))) {
          return;
        }
        const serialized = serializeDomTranslation(element);
        if (!meaningfulEnglish(serialized.semanticSource) || !element.parentElement) {
          return;
        }
        targets.push({
          id: this.idFor(element, 'description'),
          category: 'description',
          source: serialized.source,
          semanticSource: serialized.semanticSource,
          format: serialized.format,
          sourceElements: [element],
          parent: element.parentElement,
          insertBefore: element.nextSibling,
          ...targetContext(serialized.source, [element]),
        });
      });
    }

    targets.push(...this.collectHelpTargets(root));
    targets.push(...this.collectFeatureRequestTargets(root));

    return targets;
  }

  collectCommentTargets(root: ParentNode = document): DomTranslationTarget[] {
    const photoTargets = this.collectPhotoTargets(root);
    const statsTickTargets = this.collectStatsTickTargets(root);
    const bodies: HTMLElement[] = [];
    if (root instanceof HTMLElement && root.matches('.comment-body')) {
      bodies.push(root);
    }
    root.querySelectorAll<HTMLElement>('.comment-body')
      .forEach((body) => {
        if (body.closest('.comment-list')) {
          bodies.push(body);
        }
      });

    const commentTargets = bodies.flatMap((body) => {
      const full = Array.from(body.children)
        .find((element) => element instanceof HTMLElement && element.id.endsWith('-full')) as HTMLElement | undefined;
      const sourceElements = Array.from(body.children)
        .filter((element): element is HTMLElement => (
          element instanceof HTMLElement
          && !element.matches(COMMENT_METADATA_SELECTOR)
          && !element.matches('.mpkr-machine-translation')
        ));
      if (full && sourceElements.length > 0) {
        const serialized = serializeDomTranslation(full);
        if (!meaningfulEnglish(serialized.semanticSource)) return [];
        return [{
          id: this.idFor(body, 'comment'),
          category: 'comment' as const,
          source: serialized.source,
          semanticSource: serialized.semanticSource,
          format: serialized.format,
          sourceElements,
          parent: body,
          insertBefore: body.querySelector('.comment-time'),
          ...targetContext(serialized.source, sourceElements),
        }];
      }

      const textRuns = this.wrapDirectTextRuns(body);
      const candidates = [...sourceElements, ...textRuns].sort((left, right) => (
        left.compareDocumentPosition(right) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
      ));
      return candidates.flatMap((element) => {
        const serialized = serializeDomTranslation(element);
        if (!meaningfulEnglish(serialized.semanticSource)) return [];
        return [{
          id: this.idFor(element, 'comment'),
          category: 'comment' as const,
          source: serialized.source,
          semanticSource: serialized.semanticSource,
          format: serialized.format,
          sourceElements: [element],
          parent: body,
          insertBefore: element.nextSibling,
          ...(element.classList.contains(TEXT_RUN_SOURCE_CLASS)
            ? { renderMode: 'inline-copy' as const }
            : {}),
          ...targetContext(serialized.source, [element]),
        }];
      });
    });

    const forumTargets = matchingElements(root, '.fr-view').flatMap((body) => {
      // Structured copies retain .fr-view; only original, outermost post bodies are targets.
      if (!body.matches(COMMUNITY_SELECTORS.topicBody)
        || body.closest(FORUM_NON_AUTHORED_SELECTOR)
        || body.parentElement?.closest(COMMUNITY_SELECTORS.topicBody)) return [];
      const serialized = serializeDomTranslation(body, {
        opaqueElement: (element) => element.matches('cite, .signature'),
        omitElement: (element) => element.matches(FORUM_NON_AUTHORED_SELECTOR),
      });
      if (!meaningfulEnglish(serialized.semanticSource) || !body.parentElement) return [];
      return [{
        id: this.idFor(body, 'comment'), category: 'comment' as const,
        source: serialized.source,
        semanticSource: serialized.semanticSource,
        format: serialized.format,
        sourceElements: [body], parent: body.parentElement,
        insertBefore: nextForumSibling(body),
        ...targetContext(serialized.source, [body]),
      }];
    });
    const activityTargets = matchingElements(root, COMMUNITY_SELECTORS.activityComment).flatMap((body) => {
      return this.wrapDirectTextRuns(body).flatMap((sourceElement) => {
        const serialized = serializeDomTranslation(sourceElement);
        if (!meaningfulEnglish(serialized.semanticSource)) return [];
        return [{ id: this.idFor(sourceElement, 'comment'), category: 'comment' as const,
          source: serialized.source, semanticSource: serialized.semanticSource,
          format: serialized.format, sourceElements: [sourceElement], parent: body,
          insertBefore: sourceElement.nextSibling, renderMode: 'inline-copy' as const,
          ...targetContext(serialized.source, [sourceElement]) }];
      });
    });
    return [...photoTargets, ...commentTargets, ...statsTickTargets, ...forumTargets, ...activityTargets];
  }

  restore(): void {
    this.textRunWrappers.forEach((wrapper) => {
      const parent = wrapper.parentNode;
      if (!parent) return;
      while (wrapper.firstChild) parent.insertBefore(wrapper.firstChild, wrapper);
      wrapper.remove();
    });
    this.textRunWrappers.clear();
    this.helpInlineWrappers.forEach((wrapper) => {
      const parent = wrapper.parentNode;
      if (!parent) return;
      while (wrapper.firstChild) parent.insertBefore(wrapper.firstChild, wrapper);
      wrapper.remove();
    });
    this.helpInlineWrappers.clear();
    this.areaHeadingWrappers.forEach((wrapper) => {
      const parent = wrapper.parentNode;
      if (!parent) return;
      while (wrapper.firstChild) parent.insertBefore(wrapper.firstChild, wrapper);
      wrapper.remove();
    });
    this.areaHeadingWrappers.clear();
    this.forumTitleWrappers.forEach((wrapper) => {
      const parent = wrapper.parentNode;
      if (!parent) return;
      while (wrapper.firstChild) parent.insertBefore(wrapper.firstChild, wrapper);
      wrapper.remove();
    });
    this.forumTitleWrappers.clear();
    this.partnerFinderWrappers.forEach((wrapper) => {
      const parent = wrapper.parentNode;
      if (!parent) return;
      while (wrapper.firstChild) parent.insertBefore(wrapper.firstChild, wrapper);
      wrapper.remove();
    });
    this.partnerFinderWrappers.clear();
  }

  private collectPartnerFinderTargets(root: ParentNode): DomTranslationTarget[] {
    const cells = new Set<HTMLElement>(matchingElements(root, PARTNER_FINDER_SELECTORS.authoredCell));
    if (root instanceof Element) {
      const closest = root.closest<HTMLElement>(PARTNER_FINDER_SELECTORS.authoredCell);
      if (closest) cells.add(closest);
    }

    return [...cells].flatMap((cell) => {
      const table = cell.closest<HTMLTableElement>(PARTNER_FINDER_SELECTORS.resultTable);
      const row = cell.closest<HTMLTableRowElement>('tr');
      if (!table || !row || !this.isPartnerFinderResultTable(table)
        || !row.querySelector(PARTNER_FINDER_SELECTORS.profileLink)) return [];

      let source = cell.querySelector<HTMLElement>(`:scope > .${PARTNER_FINDER_SOURCE_CLASS}`);
      if (!source) {
        source = cell.ownerDocument.createElement('span');
        source.className = PARTNER_FINDER_SOURCE_CLASS;
        while (cell.firstChild) source.append(cell.firstChild);
        cell.append(source);
        this.partnerFinderWrappers.add(source);
      }

      const serialized = serializeDomTranslation(source);
      if (!meaningfulEnglish(serialized.semanticSource)) return [];
      return [{
        id: this.idFor(source, 'description'),
        category: 'description' as const,
        source: serialized.source,
        semanticSource: serialized.semanticSource,
        format: serialized.format,
        sourceElements: [source],
        parent: cell,
        insertBefore: source.nextSibling,
        renderMode: 'inline-copy' as const,
        ...targetContext(serialized.source, [source]),
      }];
    });
  }

  private isPartnerFinderResultTable(table: HTMLTableElement): boolean {
    if (this.partnerFinderTables.has(table)) return true;
    const headers = Array.from(table.querySelectorAll('tr:first-child > th'))
      .map((header) => normalizedVisibleText(header));
    const valid = isPartnerFinderResultHeaders(headers);
    if (valid) this.partnerFinderTables.add(table);
    return valid;
  }

  private collectForumTitleTargets(root: ParentNode): DomTranslationTarget[] {
    return forumTitleElements(root).flatMap((title) => {
      if (title.closest(FORUM_NON_AUTHORED_SELECTOR)
        || title.closest(COMMUNITY_SELECTORS.topicRow)) return [];
      const link = title.closest<HTMLAnchorElement>('a[href]');
      if (link) {
        try {
          if (detectPage(new URL(link.getAttribute('href') ?? '', link.ownerDocument.baseURI)) !== 'forum-topic') return [];
        } catch { return []; }
      }

      let source = title;
      if (title.tagName === 'H1') {
        const existing = Array.from(title.children).find((child): child is HTMLElement => (
          child instanceof HTMLElement && child.classList.contains(FORUM_TITLE_SOURCE_CLASS)
        ));
        if (existing) source = existing;
        else {
          if (!meaningfulEnglish(normalizedVisibleText(title))) return [];
          source = title.ownerDocument.createElement('span');
          source.className = FORUM_TITLE_SOURCE_CLASS;
          while (title.firstChild) source.append(title.firstChild);
          title.append(source);
          this.forumTitleWrappers.add(source);
        }
      }
      const serialized = serializeDomTranslation(source, {
        omitElement: (element) => element.matches(FORUM_NON_AUTHORED_SELECTOR),
      });
      if (!meaningfulEnglish(serialized.semanticSource) || !source.parentElement) return [];
      return [{
        id: this.idFor(source, 'description'),
        category: 'description' as const,
        source: serialized.source,
        semanticSource: serialized.semanticSource,
        format: serialized.format,
        sourceElements: [source],
        parent: source.parentElement,
        insertBefore: nextForumSibling(source),
        renderMode: 'inline-copy' as const,
        ...(link && link !== source && link.parentElement ? {
          actionPlacement: { parent: link.parentElement, insertBefore: nextForumSibling(link) },
        } : {}),
        ...targetContext(serialized.source, [source]),
      }];
    });
  }

  private collectAreaHeadingTargets(root: ParentNode): DomTranslationTarget[] {
    return matchingElements(root, AREA_SELECTORS.legacyTextSectionHeading).flatMap((heading) => {
      if (!heading.closest(AREA_SELECTORS.page)
        || !heading.closest(AREA_SELECTORS.legacyTextSectionGroup)) return [];
      const source = normalizedSectionHeading(heading as HTMLHeadingElement);
      if (!meaningfulEnglish(source) || SECTION_TITLE_TRANSLATIONS[source]) return [];

      const existingWrappers = Array.from(
        heading.querySelectorAll<HTMLElement>(`:scope > .${AREA_HEADING_SOURCE_CLASS}`),
      );
      const wrappers = existingWrappers.length > 0
        ? existingWrappers
        : Array.from(heading.childNodes).flatMap((node) => {
            if (!(node instanceof Text) || !meaningfulEnglish(node.nodeValue ?? '')) return [];
            const wrapper = heading.ownerDocument.createElement('span');
            wrapper.className = AREA_HEADING_SOURCE_CLASS;
            heading.insertBefore(wrapper, node);
            wrapper.append(node);
            this.areaHeadingWrappers.add(wrapper);
            return [wrapper];
          });

      return wrappers.flatMap((wrapper) => {
        const wrapperSource = boundaryTrimmedText(wrapper.textContent ?? '');
        if (!meaningfulEnglish(wrapperSource)) return [];
        return [{
          id: this.idFor(wrapper, 'description'),
          category: 'description' as const,
          source: wrapperSource,
          sourceElements: [wrapper],
          parent: heading,
          insertBefore: wrapper.nextSibling,
          renderMode: 'inline' as const,
          ...targetContext(wrapperSource, [wrapper], source),
        }];
      });
    });
  }

  private collectFeatureRequestTargets(root: ParentNode): DomTranslationTarget[] {
    return matchingElements(root, HELP_SELECTORS.hubFeatureRequestContent).flatMap((element) => {
      if (!element.closest(HELP_SELECTORS.hubPage)
        || element.closest(FORUM_NON_AUTHORED_SELECTOR)
        || !element.parentElement) return [];
      const serialized = serializeDomTranslation(element, {
        opaqueElement: (child) => child.matches(HELP_SELECTORS.protectedFeatureRequestData),
        omitElement: (child) => child.matches(FORUM_NON_AUTHORED_SELECTOR),
      });
      if (!meaningfulEnglish(serialized.semanticSource)) return [];
      return [{
        id: this.idFor(element, 'description'),
        category: 'description' as const,
        source: serialized.source,
        semanticSource: serialized.semanticSource,
        format: serialized.format,
        sourceElements: [element],
        parent: element.parentElement,
        insertBefore: nextForumSibling(element),
        contextCategory: 'help' as const,
        ...targetContext(serialized.source, [element]),
      }];
    });
  }

  private collectHelpTargets(root: ParentNode): DomTranslationTarget[] {
    const authoredRoots = matchingElements(root, INLINE_DOCUMENT_ROOT_SELECTOR)
      .filter((element) => {
        if (element.matches(HELP_SELECTORS.nameReviewPage)) return true;
        return !element.closest(HELP_SELECTORS.protectedFeatureRequestData);
      });

    for (const authoredRoot of authoredRoots) {
      const textNodes: Text[] = [];
      const walker = authoredRoot.ownerDocument.createTreeWalker(
        authoredRoot,
        NodeFilter.SHOW_TEXT,
      );
      let node = walker.nextNode();
      while (node) {
        if (node instanceof Text) textNodes.push(node);
        node = walker.nextNode();
      }

      for (const textNode of textNodes) {
        const parent = textNode.parentElement;
        const source = textNode.nodeValue ?? '';
        if (!parent
          || parent.closest(HELP_SELECTORS.inlineSource)
          || parent.closest(HELP_SELECTORS.protectedFeatureRequestData)
          || parent.closest(HELP_TEXT_EXCLUSION_SELECTOR)
          || !meaningfulEnglish(source)) continue;

        const wrapper = authoredRoot.ownerDocument.createElement('span');
        wrapper.className = HELP_INLINE_SOURCE_CLASS;
        this.helpInlineSources.set(wrapper, source);
        parent.insertBefore(wrapper, textNode);
        wrapper.append(textNode);
        this.helpInlineWrappers.add(wrapper);
      }
    }

    return matchingElements(root, HELP_SELECTORS.inlineSource).flatMap((wrapper) => {
      const original = this.helpInlineSources.get(wrapper) ?? wrapper.textContent ?? '';
      const source = boundaryTrimmedText(original);
      const semanticSource = source.replace(/\s+/gu, ' ').trim();
      if (!meaningfulEnglish(semanticSource) || !wrapper.parentElement) return [];
      return [{
        id: this.idFor(wrapper, 'description'),
        category: 'description' as const,
        source,
        semanticSource,
        sourceElements: [wrapper],
        parent: wrapper.parentElement,
        insertBefore: wrapper.nextSibling,
        renderMode: 'inline' as const,
        contextCategory: 'help' as const,
        ...targetContext(source, [wrapper]),
      }];
    });
  }

  private collectStatsTickTargets(root: ParentNode): DomTranslationTarget[] {
    return matchingElements(root, STATS_TICK_ROW_SELECTOR).flatMap((row) => {
      if (!row.querySelector('td:first-child a[href*="/user/"]')) return [];
      const details = row.querySelector<HTMLElement>('td:nth-child(2) > .small > div');
      if (!details) return [];
      return this.wrapDirectTextRuns(details, STATS_TICK_NOTE_CLASS).flatMap((note) => {
        const serialized = serializeDomTranslation(note);
        if (!meaningfulEnglish(serialized.semanticSource)) return [];
        return [{
          id: this.idFor(note, 'comment'),
          category: 'comment' as const,
          source: serialized.source,
          semanticSource: serialized.semanticSource,
          format: serialized.format,
          sourceElements: [note],
          parent: details,
          insertBefore: note.nextSibling,
          renderMode: 'inline-copy' as const,
          ...targetContext(serialized.source, [note]),
        }];
      });
    });
  }

  private wrapDirectTextRuns(parent: HTMLElement, extraClass?: string): HTMLElement[] {
    const existing = Array.from(parent.querySelectorAll<HTMLElement>(`:scope > .${TEXT_RUN_SOURCE_CLASS}`));
    const wrappers = [...existing];
    Array.from(parent.childNodes).forEach((node) => {
      if (!(node instanceof Text) || !meaningfulEnglish(node.nodeValue ?? '')) return;
      const wrapper = parent.ownerDocument.createElement('span');
      wrapper.className = [TEXT_RUN_SOURCE_CLASS, extraClass].filter(Boolean).join(' ');
      parent.insertBefore(wrapper, node);
      wrapper.append(node);
      this.textRunWrappers.add(wrapper);
      wrappers.push(wrapper);
    });
    return wrappers.sort((left, right) => (
      left.compareDocumentPosition(right) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
    ));
  }

  private collectPhotoTargets(root: ParentNode): DomTranslationTarget[] {
    return matchingElements(root, PHOTO_TEXT_SELECTOR).flatMap((element) => {
      if (!element.closest(PHOTO_CONTAINER_SELECTOR)) {
        return [];
      }

      const serialized = serializeDomTranslation(element);
      if (!meaningfulEnglish(serialized.semanticSource) || !element.parentElement) {
        return [];
      }

      return [{
        id: this.idFor(element, 'description'),
        category: 'description' as const,
        source: serialized.source,
        semanticSource: serialized.semanticSource,
        format: serialized.format,
        sourceElements: [element],
        parent: element.parentElement,
        insertBefore: element.nextSibling,
        ...targetContext(serialized.source, [element]),
      }];
    });
  }

  private idFor(node: Node, category: DomTranslationTarget['category']): string {
    const existing = this.ids.get(node);
    if (existing) {
      return existing;
    }
    const id = `${category}-${this.nextId++}`;
    this.ids.set(node, id);
    return id;
  }
}
