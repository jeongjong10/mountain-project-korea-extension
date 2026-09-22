import type { TranslationCategory } from '../core/translation-record';

const SOUTH_KOREA_AREA_PATH = '/area/106225629/south-korea';
const SOUTH_KOREA_AREA_IDS = new Set([
  '106225629',
  '126256865',
  '119456790',
  '119631691',
  '119456771',
  '119456816',
  '119456784',
  '119456750',
]);
const SOUTH_KOREA_AREA_NAMES = new Set([
  'South Korea',
  'S Korea',
  '대한민국',
  'Gamaksan (Dawn Wall), Paju-si, Gyeonggi-do (Seolma 12 Bridge)',
  'Gangwon-do (Northeast Korea)',
  'Jeju Island',
  'North/South Chungcheong-do (Midwest/West Korea)',
  'North/South Gyeongsang-do (East/Southeast Korea)',
  'North/South Jeolla-do (Southwest Korea)',
  'Seoul/Gyeonggi-do (Northwest Korea)',
]);
type ContentTranslationCategory = Exclude<TranslationCategory, 'ui' | 'name'>;

const SECTION_CATEGORIES: Readonly<Record<string, ContentTranslationCategory>> = {
  Description: 'description',
  '설명': 'description',
  'Getting There': 'access',
  '가는 방법': 'access',
  Location: 'access',
  '위치': 'access',
  Protection: 'safety',
  '보호 장비': 'safety',
  Descent: 'safety',
  '하강': 'safety',
};
const CONTENT_BLOCK_SELECTOR = 'p, li, div, blockquote, pre, h3, h4, h5, h6';
const PHOTO_TEXT_SELECTOR = [
  '.photo-title',
  '.photo-caption',
  '.photo-description',
  '.card-with-photo .title-row',
].join(', ');
const PHOTO_CONTAINER_SELECTOR = [
  '.photo-core',
  '#photo-popup-body',
  '[data-photo-id]',
  '.card-with-photo',
].join(', ');
const COMMENT_METADATA_SELECTOR = '.comment-time, .author, [rel="author"], time';
const STATS_TICK_ROW_SELECTOR = '#route-stats .onx-stats-table tr[id^="ticks."]';
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
].join(', ');

export interface DomTranslationTarget {
  id: string;
  category: ContentTranslationCategory;
  source: string;
  sourceElements: HTMLElement[];
  insertBefore?: ChildNode | null;
  parent: HTMLElement;
}

function pathFor(anchor: HTMLAnchorElement): string | undefined {
  try {
    return new URL(anchor.href, document.baseURI).pathname.replace(/\/+$/, '');
  } catch {
    return undefined;
  }
}

function isLocationTrailAnchor(anchor: HTMLAnchorElement): boolean {
  const explicitBreadcrumb = anchor.closest([
    '.breadcrumbs',
    '.breadcrumb',
    '[aria-label="breadcrumb"]',
    '[aria-label="Breadcrumb"]',
  ].join(', '));
  if (explicitBreadcrumb) {
    return true;
  }

  const trail = anchor.parentElement;
  return Boolean(trail?.querySelector('a[href$="/route-guide"]'));
}

function hasSouthKoreaLocationTrail(root: ParentNode): boolean {
  return Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href*="/area/"]'))
    .some((anchor) => (
      pathFor(anchor) === SOUTH_KOREA_AREA_PATH
      && isLocationTrailAnchor(anchor)
    ));
}

function areaIdFromUrl(value: string, baseUrl: string): string | undefined {
  try {
    return new URL(value, baseUrl).pathname.match(/^\/area\/(\d+)(?:\/|$)/)?.[1];
  } catch {
    return undefined;
  }
}

function selectedAreaIds(url: URL): string[] {
  return url.searchParams.getAll('selectedIds')
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter(Boolean);
}

function hasSouthKoreaRouteFinderContext(url: URL, root: ParentNode): boolean {
  if (url.pathname.replace(/\/+$/, '') !== '/route-finder') {
    return false;
  }
  if (selectedAreaIds(url).some((id) => SOUTH_KOREA_AREA_IDS.has(id))) {
    return true;
  }

  const baseUrl = root instanceof Document
    ? root.baseURI
    : root.ownerDocument?.baseURI ?? url.href;
  const formIds = Array.from(
    root.querySelectorAll<HTMLInputElement>('#routeFinderForm input[name="selectedIds"]'),
  ).flatMap((input) => input.value.split(',').map((value) => value.trim()));
  if (formIds.some((id) => SOUTH_KOREA_AREA_IDS.has(id))) {
    return true;
  }

  const pickerName = root.querySelector<HTMLElement>('#single-area-picker-name')
    ?.textContent?.replace(/\s+/g, ' ').trim();
  if (pickerName && SOUTH_KOREA_AREA_NAMES.has(pickerName)) {
    return true;
  }

  return Array.from(root.querySelectorAll<HTMLAnchorElement>(
    '.breadcrumbs a[href*="/area/"], .breadcrumb a[href*="/area/"]',
  )).some((anchor) => {
    const id = areaIdFromUrl(anchor.href, baseUrl);
    return Boolean(id && SOUTH_KOREA_AREA_IDS.has(id));
  });
}

function matchingElements(root: ParentNode, selector: string): HTMLElement[] {
  const elements: HTMLElement[] = [];
  if (root instanceof HTMLElement && root.matches(selector)) {
    elements.push(root);
  }
  root.querySelectorAll<HTMLElement>(selector).forEach((element) => elements.push(element));
  return elements;
}

function directText(element: Element): string {
  return Array.from(element.childNodes)
    .filter((node): node is Text => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.nodeValue ?? '')
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
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

export class MountainProjectPageAdapter {
  private readonly ids = new WeakMap<Node, string>();
  private readonly statsTickNoteWrappers = new Set<HTMLElement>();
  private nextId = 1;

  isSouthKoreaPage(url: URL, root: ParentNode = document): boolean {
    const currentPath = url.pathname.replace(/\/+$/, '');
    if (currentPath === SOUTH_KOREA_AREA_PATH) {
      return true;
    }

    if (hasSouthKoreaRouteFinderContext(url, root)) {
      return true;
    }

    return hasSouthKoreaLocationTrail(root);
  }

  collectPageTargets(root: ParentNode = document): DomTranslationTarget[] {
    const targets: DomTranslationTarget[] = [];

    root.querySelectorAll<HTMLElement>('h2').forEach((heading) => {
      const category = SECTION_CATEGORIES[directText(heading)];
      if (!category || !heading.parentElement) {
        return;
      }

      const content = Array.from(heading.parentElement.children)
        .find((element) => element.classList.contains('fr-view')) as HTMLElement | undefined;
      if (!content) {
        return;
      }

      const candidates = collectContentBlocks(content);
      for (const element of candidates) {
        const source = normalizedText(element);
        targets.push({
          id: this.idFor(element, category),
          category,
          source,
          sourceElements: [element],
          parent: element.parentElement ?? content,
          insertBefore: element.nextSibling,
        });
      }
    });

    if (root.querySelector('#routeFinderForm')) {
      matchingElements(root, ROUTE_FINDER_SNIPPET_SELECTOR).forEach((element) => {
        if (element.querySelector([
          'a[href*="/route/"]',
          'a[href*="/area/"]',
          '.rateYDS',
          '.scoreStars',
        ].join(', '))) {
          return;
        }
        const source = normalizedText(element);
        if (!meaningfulEnglish(source) || !element.parentElement) {
          return;
        }
        targets.push({
          id: this.idFor(element, 'description'),
          category: 'description',
          source,
          sourceElements: [element],
          parent: element.parentElement,
          insertBefore: element.nextSibling,
        });
      });
    }

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
      const source = (full?.textContent
        ?? sourceElements.find((element) => element.offsetParent !== null)?.textContent
        ?? sourceElements[0]?.textContent
        ?? '')
        .replace(/\s+/g, ' ')
        .trim();

      if (!meaningfulEnglish(source) || sourceElements.length === 0) {
        return [];
      }

      return [{
        id: this.idFor(body, 'comment'),
        category: 'comment' as const,
        source,
        sourceElements,
        parent: body,
        insertBefore: body.querySelector('.comment-time'),
      }];
    });

    return [...photoTargets, ...commentTargets, ...statsTickTargets];
  }

  restore(): void {
    this.statsTickNoteWrappers.forEach((wrapper) => {
      const parent = wrapper.parentNode;
      if (!parent) {
        return;
      }
      while (wrapper.firstChild) {
        parent.insertBefore(wrapper.firstChild, wrapper);
      }
      wrapper.remove();
    });
    this.statsTickNoteWrappers.clear();
  }

  private collectStatsTickTargets(root: ParentNode): DomTranslationTarget[] {
    return matchingElements(root, STATS_TICK_ROW_SELECTOR).flatMap((row) => {
      const existing = row.querySelector<HTMLElement>(`:scope .${STATS_TICK_NOTE_CLASS}`);
      const note = existing ?? this.wrapStatsTickNote(row);
      if (!note || !note.parentElement) {
        return [];
      }

      const source = normalizedText(note);
      if (!meaningfulEnglish(source)) {
        return [];
      }

      return [{
        id: this.idFor(note, 'comment'),
        category: 'comment' as const,
        source,
        sourceElements: [note],
        parent: note.parentElement,
        insertBefore: note.nextSibling,
      }];
    });
  }

  private wrapStatsTickNote(row: HTMLElement): HTMLElement | undefined {
    if (!row.querySelector('td:first-child a[href*="/user/"]')) {
      return undefined;
    }

    const details = row.querySelector<HTMLElement>('td:nth-child(2) > .small > div');
    if (!details) {
      return undefined;
    }
    const noteNodes = Array.from(details.childNodes).filter((node): node is Text => (
      node.nodeType === Node.TEXT_NODE && meaningfulEnglish(node.nodeValue ?? '')
    ));
    if (noteNodes.length === 0) {
      return undefined;
    }
    const firstNoteNode = noteNodes[0];
    if (!firstNoteNode) {
      return undefined;
    }

    const wrapper = details.ownerDocument.createElement('span');
    wrapper.className = STATS_TICK_NOTE_CLASS;
    details.insertBefore(wrapper, firstNoteNode);
    noteNodes.forEach((node) => wrapper.append(node));
    this.statsTickNoteWrappers.add(wrapper);
    return wrapper;
  }

  private collectPhotoTargets(root: ParentNode): DomTranslationTarget[] {
    return matchingElements(root, PHOTO_TEXT_SELECTOR).flatMap((element) => {
      if (!element.closest(PHOTO_CONTAINER_SELECTOR)) {
        return [];
      }

      const photoContext = element.closest('#photo-popup-body') ?? element.ownerDocument;
      if (!photoContext || !hasSouthKoreaLocationTrail(photoContext)) {
        return [];
      }

      const source = normalizedText(element);
      if (!meaningfulEnglish(source) || !element.parentElement) {
        return [];
      }

      return [{
        id: this.idFor(element, 'description'),
        category: 'description' as const,
        source,
        sourceElements: [element],
        parent: element.parentElement,
        insertBefore: element.nextSibling,
      }];
    });
  }

  private idFor(node: Node, category: TranslationCategory): string {
    const existing = this.ids.get(node);
    if (existing) {
      return existing;
    }
    const id = `${category}-${this.nextId++}`;
    this.ids.set(node, id);
    return id;
  }
}
