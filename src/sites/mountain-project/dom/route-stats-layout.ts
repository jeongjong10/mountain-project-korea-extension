import {
  normalizeMountainProjectPath,
  parseRouteStatsPath,
} from '../contract/routes';
import {
  ROUTE_AUXILIARY_CONTRACT,
  ROUTE_PAGE_CONTRACT,
  ROUTE_SELECTORS,
  ROUTE_YOU_AND_ROUTE_CONTRACT,
} from '../contract/selectors/route';
import {
  BOOTSTRAP_COLUMN_CLASS_PREFIX,
  SHARED_SELECTORS,
} from '../contract/selectors/shared';
import {
  STATS_FRAME_CONTRACT,
  STATS_SELECTORS,
  STATS_TICKS_SECTION_CONTRACT,
} from '../contract/selectors/stats';
import type {
  LocatorAttempt,
  LocatorMetadata,
  LocatorResult,
} from '../contract/schema';
import { directChildContaining, locateFirst, locatorFailure } from './locator';

export interface RouteStatsLayout {
  readonly mainContent: HTMLElement;
  readonly row: HTMLElement;
  readonly overview: HTMLElement;
  readonly summary: HTMLElement;
  readonly youAndRoute: HTMLElement;
  readonly auxiliaryRegions: readonly [HTMLElement, HTMLElement];
  readonly statsHref: string;
  readonly statsUrl: URL;
}

export interface StatsFrameLandmarks {
  readonly documentElement: HTMLElement;
  readonly head: HTMLHeadElement;
  readonly stats: HTMLElement;
}

export interface StatsTicksSection {
  readonly section: HTMLElement;
  readonly layoutItem: HTMLElement;
  readonly layoutParent: HTMLElement;
  readonly heading: HTMLHeadingElement;
  readonly table: HTMLTableElement;
}

function directChildByTag<T extends HTMLElement>(
  parent: Element,
  tagName: string,
): T | undefined {
  return Array.from(parent.children).find(
    (child) => child.tagName === tagName,
  ) as T | undefined;
}

function statsSectionWithin(
  landmark: Element,
  tableRoot: HTMLElement,
): Pick<StatsTicksSection, 'section' | 'heading' | 'table'> | undefined {
  let candidate: Element | null = landmark;
  while (candidate && tableRoot.contains(candidate)) {
    const heading = directChildByTag<HTMLHeadingElement>(candidate, 'H3');
    const table = directChildByTag<HTMLTableElement>(candidate, 'TABLE');
    if (heading && table) {
      return { section: candidate as HTMLElement, heading, table };
    }
    if (candidate === tableRoot) {
      break;
    }
    candidate = candidate.parentElement;
  }

  for (const heading of landmark.querySelectorAll<HTMLHeadingElement>('h3')) {
    const section = heading.parentElement;
    const table = section ? directChildByTag<HTMLTableElement>(section, 'TABLE') : undefined;
    if (section && table && tableRoot.contains(section)) {
      return { section, heading, table };
    }
  }
  return undefined;
}

function statsLayoutItem(section: HTMLElement, tableRoot: HTMLElement): HTMLElement {
  const parent = section.parentElement;
  return parent && parent !== tableRoot && (
    parent.classList.contains(STATS_SELECTORS.maxHeightClass)
    || Array.from(parent.classList).some((name) => (
      name.startsWith(BOOTSTRAP_COLUMN_CLASS_PREFIX)
    ))
  )
    ? parent
    : section;
}

function resolveUrl(value: string | null, baseUrl: string): URL | undefined {
  if (!value || value.startsWith('#') || /^javascript:/i.test(value)) {
    return undefined;
  }
  try {
    return new URL(value, baseUrl);
  } catch {
    return undefined;
  }
}

function findStatsAnchor(
  youAndRoute: HTMLElement,
  currentUrl: URL,
): { href: string; url: URL } | undefined {
  for (const anchor of youAndRoute.querySelectorAll<HTMLAnchorElement>(
    ROUTE_SELECTORS.statsLinks,
  )) {
    const href = anchor.getAttribute('href');
    const url = resolveUrl(href, currentUrl.href);
    if (href && url && url.origin === currentUrl.origin && parseRouteStatsPath(url.pathname)) {
      return { href, url };
    }
  }
  return undefined;
}

function summaryWithin(container: HTMLElement): HTMLElement | undefined {
  const exact = Array.from(container.children).find((candidate) => (
    candidate instanceof HTMLElement
    && candidate.matches(ROUTE_SELECTORS.summaryExact)
    && (candidate.querySelector<HTMLTableElement>(SHARED_SELECTORS.descriptionDetails)
      ?.rows.length ?? 0) >= 2
  ));
  if (exact instanceof HTMLElement) {
    return exact;
  }
  const details = Array.from(
    container.querySelectorAll<HTMLTableElement>(SHARED_SELECTORS.descriptionDetails),
  ).find((table) => table.rows.length >= 2);
  if (!details) {
    return undefined;
  }
  const smallOwner = details.closest<HTMLElement>('.small');
  return smallOwner && container.contains(smallOwner)
    ? smallOwner
    : details.parentElement ?? undefined;
}

function landmarkRegion(
  row: HTMLElement,
  landmark: Element,
): HTMLElement | undefined {
  return directChildContaining(row, landmark)
    ?? (landmark.parentElement instanceof HTMLElement ? landmark.parentElement : undefined);
}

function nearestCommonLayout(
  mainContent: HTMLElement,
  elements: readonly Element[],
): HTMLElement | undefined {
  let candidate = elements[0]?.parentElement ?? null;
  while (candidate && mainContent.contains(candidate)) {
    if (elements.every((element) => candidate!.contains(element))) {
      return candidate;
    }
    if (candidate === mainContent) {
      break;
    }
    candidate = candidate.parentElement;
  }
  return undefined;
}

export function locateRouteStatsLayout(
  root: ParentNode,
  currentUrl: URL,
): LocatorResult<RouteStatsLayout> {
  const pageResult = locateFirst<HTMLElement>(
    root,
    ROUTE_PAGE_CONTRACT,
    () => true,
    currentUrl.href,
  );
  if (!pageResult.ok) {
    return pageResult;
  }
  const page = pageResult.value;
  const youAndRouteResult = locateFirst<HTMLElement>(
    page,
    ROUTE_YOU_AND_ROUTE_CONTRACT,
    () => true,
    currentUrl.href,
  );
  if (!youAndRouteResult.ok) {
    return youAndRouteResult;
  }
  const youAndRoute = youAndRouteResult.value;
  const mainContent = youAndRoute.closest<HTMLElement>(ROUTE_SELECTORS.mainContent);
  if (!mainContent || !page.contains(mainContent)) {
    return locatorFailure('route-stats-embed', 'main-content', 'Route main content landmark is missing', [{
      candidate: 'semantic-main-content',
      selector: ROUTE_SELECTORS.mainContent,
      outcome: 'missing',
    }], currentUrl.href);
  }
  const stats = findStatsAnchor(youAndRoute, currentUrl);
  if (!stats) {
    return locatorFailure('route-stats-embed', 'stats-link', 'Route stats link is missing or invalid', [{
      candidate: 'stats-link',
      selector: ROUTE_SELECTORS.statsLinks,
      outcome: 'missing',
    }], currentUrl.href);
  }

  const exactOverview = youAndRoute.parentElement instanceof HTMLElement
    && youAndRoute.parentElement.matches(ROUTE_SELECTORS.overviewExact)
    ? youAndRoute.parentElement
    : undefined;
  const exactRow = exactOverview?.parentElement instanceof HTMLElement
    && exactOverview.parentElement.matches(ROUTE_SELECTORS.rowExact)
    ? exactOverview.parentElement
    : undefined;
  const exactAuxiliary = exactRow
    ? Array.from(exactRow.children).filter((candidate): candidate is HTMLElement => (
      candidate instanceof HTMLElement && candidate.matches(ROUTE_SELECTORS.auxiliaryExact)
    ))
    : [];
  const exactOnx = exactAuxiliary.find((candidate) => (
    candidate.querySelector(ROUTE_SELECTORS.onxLandmark)
  ));
  const exactCarousel = exactAuxiliary.find((candidate) => (
    candidate !== exactOnx
    && candidate.matches(ROUTE_SELECTORS.hiddenDesktop)
    && candidate.querySelector(ROUTE_SELECTORS.carouselLandmark)
  ));
  const exactSummary = exactOverview ? summaryWithin(exactOverview) : undefined;
  const exact = Boolean(
    exactOverview
    && exactRow
    && exactRow.parentElement === mainContent
    && exactSummary
    && exactOnx
    && exactCarousel,
  );

  let row = exactRow;
  let overview = exactOverview;
  let summary = exactSummary;
  let onxRegion = exactOnx;
  let carouselRegion = exactCarousel;
  const attempts: LocatorAttempt[] = [{
    candidate: 'bootstrap-v4',
    selector: [
      ROUTE_SELECTORS.overviewExact,
      ROUTE_SELECTORS.rowExact,
      ROUTE_SELECTORS.auxiliaryExact,
    ].join(' > '),
    outcome: exact ? 'matched' : 'invalid',
    ...(!exact ? { reason: 'One or more Bootstrap layout relationships changed.' } : {}),
  }];

  if (!exact) {
    const onxLandmark = mainContent.querySelector(ROUTE_SELECTORS.onxLandmark);
    const carouselLandmark = mainContent.querySelector(ROUTE_SELECTORS.carouselLandmark);
    if (!onxLandmark || !carouselLandmark) {
      attempts.push({
        candidate: 'semantic-landmarks',
        selector: ROUTE_AUXILIARY_CONTRACT.candidates[1]!.selector,
        outcome: 'missing',
        reason: `${!onxLandmark ? 'onX' : 'photo carousel'} landmark is missing.`,
      });
      return locatorFailure(
        ROUTE_AUXILIARY_CONTRACT.component,
        ROUTE_AUXILIARY_CONTRACT.key,
        `${!onxLandmark ? 'onX' : 'photo carousel'} landmark is missing.`,
        attempts,
        currentUrl.href,
      );
    }
    row = nearestCommonLayout(mainContent, [youAndRoute, onxLandmark, carouselLandmark]);
    if (!row || row === mainContent) {
      return locatorFailure(
        'route-stats-embed',
        'layout-row',
        'Route overview and auxiliary landmarks lack a safe shared layout container.',
        attempts,
        currentUrl.href,
      );
    }
    overview = directChildContaining(row, youAndRoute);
    onxRegion = landmarkRegion(row, onxLandmark);
    carouselRegion = landmarkRegion(row, carouselLandmark);
    summary = overview ? summaryWithin(overview) : undefined;
    if (!overview || !summary || !onxRegion || !carouselRegion
      || overview === onxRegion || overview === carouselRegion || onxRegion === carouselRegion) {
      return locatorFailure(
        'route-stats-embed',
        'semantic-layout',
        'Semantic fallback found landmarks but could not isolate safe layout regions.',
        attempts,
        currentUrl.href,
      );
    }
    attempts.push({
      candidate: 'semantic-landmarks',
      selector: ROUTE_AUXILIARY_CONTRACT.candidates[1]!.selector,
      outcome: 'matched',
    });
  }

  if (!row || !overview || !summary || !onxRegion || !carouselRegion) {
    return locatorFailure(
      'route-stats-embed',
      'layout',
      'Required route layout regions are incomplete.',
      attempts,
      currentUrl.href,
    );
  }

  const metadata: LocatorMetadata = {
    component: 'route-stats-embed',
    key: 'route-layout',
    candidate: exact ? 'bootstrap-v4' : 'semantic-landmarks',
    fallback: !exact,
    attempts,
  };
  return {
    ok: true,
    value: {
      mainContent,
      row,
      overview,
      summary,
      youAndRoute,
      auxiliaryRegions: [onxRegion, carouselRegion],
      statsHref: stats.href,
      statsUrl: stats.url,
    },
    metadata,
  };
}

export function locateStatsFrameLandmarks(
  frameDocument: Document,
  page?: string,
): LocatorResult<StatsFrameLandmarks> {
  const documentElement = frameDocument.documentElement;
  const head = frameDocument.head;
  if (!documentElement || !head) {
    return locatorFailure(
      STATS_FRAME_CONTRACT.component,
      STATS_FRAME_CONTRACT.key,
      [
        !documentElement ? 'documentElement' : '',
        !head ? 'head' : '',
      ].filter(Boolean).join(', ') + ' landmark missing.',
      [],
      page,
    );
  }
  const statsResult = locateFirst<HTMLElement>(
    frameDocument,
    STATS_FRAME_CONTRACT,
    () => true,
    page,
  );
  if (!statsResult.ok) {
    return statsResult;
  }
  return {
    ok: true,
    value: { documentElement, head, stats: statsResult.value },
    metadata: statsResult.metadata,
  };
}

export function locateStatsTicksSection(
  stats: HTMLElement,
  page?: string,
): LocatorResult<StatsTicksSection> {
  const tableRoot = stats.matches(STATS_SELECTORS.tableRootFallback)
    ? stats
    : stats.querySelector<HTMLElement>(STATS_SELECTORS.tableRootFallback);
  if (!tableRoot) {
    return locatorFailure(
      STATS_TICKS_SECTION_CONTRACT.component,
      STATS_TICKS_SECTION_CONTRACT.key,
      'Stats table root is missing.',
      [{
        candidate: 'stats-table-root',
        selector: STATS_SELECTORS.tableRootFallback,
        outcome: 'missing',
      }],
      page,
    );
  }

  const landmarkResult = locateFirst<Element>(
    tableRoot,
    STATS_TICKS_SECTION_CONTRACT,
    (candidate) => Boolean(statsSectionWithin(candidate, tableRoot)),
    page,
  );
  if (!landmarkResult.ok) {
    return landmarkResult;
  }

  const section = statsSectionWithin(landmarkResult.value, tableRoot);
  if (!section) {
    return locatorFailure(
      STATS_TICKS_SECTION_CONTRACT.component,
      STATS_TICKS_SECTION_CONTRACT.key,
      'Ticks landmark does not belong to a section with a direct heading and table.',
      landmarkResult.metadata.attempts,
      page,
    );
  }
  const layoutItem = statsLayoutItem(section.section, tableRoot);
  const layoutParent = layoutItem.parentElement;
  if (!layoutParent || !tableRoot.contains(layoutParent)) {
    return locatorFailure(
      STATS_TICKS_SECTION_CONTRACT.component,
      STATS_TICKS_SECTION_CONTRACT.key,
      'Ticks section has no safe stats layout parent.',
      landmarkResult.metadata.attempts,
      page,
    );
  }

  return {
    ok: true,
    value: {
      ...section,
      layoutItem,
      layoutParent,
    },
    metadata: landmarkResult.metadata,
  };
}

export function isCurrentStatsPath(candidate: URL, expected: URL): boolean {
  return candidate.origin === expected.origin
    && normalizeMountainProjectPath(candidate.pathname)
      === normalizeMountainProjectPath(expected.pathname);
}
