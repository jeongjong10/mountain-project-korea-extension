import { buildMountainProjectUrl, isMountainProjectUrl } from '../contract/origins';
import {
  buildMapPath,
  parseAreaPath,
  parseMapPath,
} from '../contract/routes';
import {
  AREA_MAIN_CONTENT_CONTRACT,
  AREA_MAP_LINK_CONTRACT,
  AREA_SELECTORS,
  AREA_SIDEBAR_CONTRACT,
} from '../contract/selectors/area';
import { MAP_FRAME_CONTRACT, MAP_SELECTORS } from '../contract/selectors/map';
import { SHARED_SELECTORS } from '../contract/selectors/shared';
import type {
  LocatorAttempt,
  LocatorMetadata,
  LocatorResult,
} from '../contract/schema';
import { directChildContaining, locateFirst, locatorFailure } from './locator';

export interface AreaMapLayout {
  readonly page: HTMLElement;
  readonly areaSidebar: HTMLElement;
  readonly layoutRow: HTMLElement;
  readonly mainContent: HTMLElement;
  readonly mapLink?: HTMLAnchorElement;
  readonly mapUrl: string;
}

export interface MapFrameLandmarks {
  readonly documentElement: HTMLElement;
  readonly head: HTMLHeadElement;
  readonly map: Element;
}

function mapUrlForArea(
  anchor: HTMLAnchorElement,
  currentUrl: URL,
): string | undefined {
  try {
    const url = new URL(anchor.getAttribute('href') ?? '', currentUrl);
    const area = parseAreaPath(currentUrl.pathname);
    const map = parseMapPath(url.pathname);
    return area && map?.id === area.id && isMountainProjectUrl(url) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

function mapUrlForCurrentArea(currentUrl: URL): string | undefined {
  const area = parseAreaPath(currentUrl.pathname);
  if (!area || !isMountainProjectUrl(currentUrl)) {
    return undefined;
  }
  return buildMountainProjectUrl(buildMapPath(area.id, area.slug));
}

function findMapLink(
  root: ParentNode,
  currentUrl: URL,
): { link?: HTMLAnchorElement; fallback: boolean; attempts: LocatorAttempt[] } {
  const attempts: LocatorAttempt[] = [];
  for (const [index, candidate] of AREA_MAP_LINK_CONTRACT.candidates.entries()) {
    const links = Array.from(root.querySelectorAll<HTMLAnchorElement>(candidate.selector));
    const link = links.find((anchor) => (
      Boolean(mapUrlForArea(anchor, currentUrl))
      && (index > 0 || Boolean(anchor.querySelector('.map-preview')))
    ));
    attempts.push({
      candidate: candidate.key,
      selector: candidate.selector,
      outcome: link ? 'matched' : links.length > 0 ? 'invalid' : 'missing',
      ...(!link && links.length > 0
        ? { reason: 'Map links did not match the current area or preview landmark.' }
        : {}),
    });
    if (link) {
      return { link, fallback: index > 0, attempts };
    }
  }
  return { fallback: false, attempts };
}

function commonLayoutRoot(
  page: HTMLElement,
  sidebar: HTMLElement,
  mainContent: HTMLElement,
): HTMLElement | undefined {
  if (
    sidebar.parentElement instanceof HTMLElement
    && sidebar.parentElement.matches(AREA_SELECTORS.layoutRowRelative)
    && sidebar.parentElement.contains(mainContent)
  ) {
    return sidebar.parentElement;
  }
  let candidate: HTMLElement | null = sidebar.parentElement;
  while (candidate && page.contains(candidate)) {
    if (candidate.contains(mainContent)) {
      return candidate;
    }
    if (candidate === page) {
      break;
    }
    candidate = candidate.parentElement;
  }
  return undefined;
}

export function locateAreaMapLayout(
  root: ParentNode,
  currentUrl: URL,
): LocatorResult<AreaMapLayout> {
  const page = root.querySelector<HTMLElement>(AREA_SELECTORS.page);
  if (!page) {
    return locatorFailure(
      'south-korea-map',
      'area-page',
      'Area page root is missing.',
      [{
        candidate: 'area-page-id',
        selector: AREA_SELECTORS.page,
        outcome: 'missing',
      }],
      currentUrl.href,
    );
  }

  const mapLink = findMapLink(root, currentUrl);
  const mapUrl = mapLink.link
    ? mapUrlForArea(mapLink.link, currentUrl)
    : mapUrlForCurrentArea(currentUrl);
  if (!mapUrl) {
    return locatorFailure(
      'south-korea-map',
      'map-url',
      'A map URL could not be resolved for the current Area.',
      mapLink.attempts,
      currentUrl.href,
    );
  }
  let sidebarResult = locateFirst<HTMLElement>(
    root,
    AREA_SIDEBAR_CONTRACT,
    (candidate) => Boolean(candidate.querySelector(SHARED_SELECTORS.sidebarContent)),
    currentUrl.href,
  );
  const linkedSidebar = mapLink.link?.closest<HTMLElement>(SHARED_SELECTORS.leftNavigation);
  if (!sidebarResult.ok && linkedSidebar?.querySelector(SHARED_SELECTORS.sidebarContent)) {
    sidebarResult = {
      ok: true,
      value: linkedSidebar,
      metadata: {
        component: AREA_SIDEBAR_CONTRACT.component,
        key: AREA_SIDEBAR_CONTRACT.key,
        candidate: 'map-link-ancestor',
        fallback: true,
        attempts: sidebarResult.attempts,
      },
    };
  }
  if (!sidebarResult.ok) {
    return sidebarResult;
  }

  const mainResult = locateFirst<HTMLElement>(
    page,
    AREA_MAIN_CONTENT_CONTRACT,
    (candidate) => !sidebarResult.value.contains(candidate),
    currentUrl.href,
  );
  if (!mainResult.ok) {
    return mainResult;
  }

  const layoutRow = commonLayoutRoot(page, sidebarResult.value, mainResult.value);
  if (!layoutRow) {
    return locatorFailure(
      'south-korea-map',
      'layout-row',
      'Sidebar and main content do not share a validated area layout container.',
      [{
        candidate: 'shared-area-layout',
        selector: AREA_SELECTORS.layoutRow,
        outcome: 'invalid',
      }],
      currentUrl.href,
    );
  }

  const fallback = sidebarResult.metadata.fallback
    || mainResult.metadata.fallback
    || mapLink.fallback
    || !layoutRow.matches(AREA_SELECTORS.layoutRowRelative);
  const metadata: LocatorMetadata = {
    component: 'south-korea-map',
    key: 'area-layout',
    candidate: fallback ? 'semantic-fallback' : 'bootstrap-v4',
    fallback,
    attempts: [
      ...mapLink.attempts,
      ...sidebarResult.metadata.attempts,
      ...mainResult.metadata.attempts,
    ],
  };
  return {
    ok: true,
    value: {
      page,
      areaSidebar: sidebarResult.value,
      layoutRow,
      mainContent: mainResult.value,
      ...(mapLink.link ? { mapLink: mapLink.link } : {}),
      mapUrl,
    },
    metadata,
  };
}

export function locateMapFrameLandmarks(
  frameDocument: Document,
  page?: string,
): LocatorResult<MapFrameLandmarks> {
  const documentElement = frameDocument.documentElement;
  const head = frameDocument.head;
  const map = frameDocument.querySelector(MAP_SELECTORS.canvas)
    ?? frameDocument.querySelector(MAP_SELECTORS.root);
  if (!documentElement || !head || !map) {
    return locatorFailure(
      MAP_FRAME_CONTRACT.component,
      MAP_FRAME_CONTRACT.key,
      [
        !documentElement ? 'documentElement' : '',
        !head ? 'head' : '',
        !map ? 'map' : '',
      ].filter(Boolean).join(', ') + ' landmark missing.',
      MAP_FRAME_CONTRACT.candidates.map((candidate) => ({
        candidate: candidate.key,
        selector: candidate.selector,
        outcome: frameDocument.querySelector(candidate.selector) ? 'matched' : 'missing',
      })),
      page,
    );
  }
  return {
    ok: true,
    value: { documentElement, head, map },
    metadata: {
      component: MAP_FRAME_CONTRACT.component,
      key: MAP_FRAME_CONTRACT.key,
      candidate: map.matches(MAP_SELECTORS.canvas) ? 'map-container' : 'map-root',
      fallback: !map.matches(MAP_SELECTORS.canvas),
      attempts: [],
    },
  };
}

export function topLevelAreaContentContaining(
  layout: AreaMapLayout,
  descendant: Element,
): HTMLElement | undefined {
  return directChildContaining(layout.layoutRow, descendant);
}
