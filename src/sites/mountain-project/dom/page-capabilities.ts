import { locateAreaPage } from './area-page';
import { ROUTE_SELECTORS } from '../contract/selectors/route';
import { PHOTO_CONTAINER_SELECTOR } from '../contract/selectors/photo';
import { HELP_SELECTORS } from '../contract/selectors/help';
import { ABOUT_SELECTORS } from '../contract/selectors/about';
import { isMountainProjectUrl } from '../contract/origins';
import {
  isKnownAsiaAreaId,
  selectedAreaIds,
} from '../contract/regions/asia';
import {
  isSouthKoreaAreaId,
  isSouthKoreaAreaPath,
} from '../contract/regions/south-korea';
import { detectPage, isRouteFinderPath, type PageKind } from '../contract/routes';
import {
  hasAsiaLocationTrail,
  hasSouthKoreaLocationTrail,
  isAsiaAreaContext,
} from './location-trail';
import { PARTNER_FINDER_SELECTORS } from '../contract/selectors/partner-finder';

export interface MountainProjectPageCapabilities {
  readonly pageKind: PageKind;
  readonly asiaScope: boolean;
  readonly authoredTranslation: boolean;
  readonly routeSectionPresentation: boolean;
  readonly areaMap: boolean;
  readonly southKoreaEnhancements: boolean;
}

function baseUrlFor(root: ParentNode, fallback: URL): string {
  return root instanceof Document
    ? root.baseURI
    : root.ownerDocument?.baseURI ?? fallback.href;
}

function selectedIdsFromForm(root: ParentNode): string[] {
  return Array.from(
    root.querySelectorAll<HTMLInputElement>('#routeFinderForm input[name="selectedIds"]'),
  ).flatMap((input) => input.value.split(',').map((value) => value.trim()).filter(Boolean));
}

function routeFinderMatches(
  url: URL,
  root: ParentNode,
  predicate: (id: string | undefined) => boolean,
  hasLocationTrail: (root: ParentNode, baseUrl: string | URL) => boolean,
): boolean {
  if (!isRouteFinderPath(url.pathname)) {
    return false;
  }
  return selectedAreaIds(url).some(predicate)
    || selectedIdsFromForm(root).some(predicate)
    || hasLocationTrail(root, baseUrlFor(root, url));
}

export function isAsiaScopedPage(
  url: URL,
  root: ParentNode = document,
): boolean {
  if (!isMountainProjectUrl(url)) {
    return false;
  }
  const pageKind = detectPage(url);
  if (pageKind === 'area') {
    return isAsiaAreaContext(url, root);
  }
  if (pageKind === 'route-finder') {
    return routeFinderMatches(url, root, isKnownAsiaAreaId, hasAsiaLocationTrail);
  }
  if (pageKind === 'route' || pageKind === 'route-stats' || pageKind === 'photo') {
    return hasAsiaLocationTrail(root, baseUrlFor(root, url));
  }
  return false;
}

export function isSouthKoreaScopedPage(
  url: URL,
  root: ParentNode = document,
): boolean {
  if (!isMountainProjectUrl(url)) {
    return false;
  }
  if (isSouthKoreaAreaPath(url.pathname)) {
    return true;
  }
  if (routeFinderMatches(url, root, isSouthKoreaAreaId, hasSouthKoreaLocationTrail)) {
    return true;
  }
  return hasSouthKoreaLocationTrail(root, baseUrlFor(root, url));
}

export function resolveMountainProjectPageCapabilities(
  url: URL,
  root: ParentNode = document,
): MountainProjectPageCapabilities {
  const pageKind = detectPage(url);
  const asiaScope = isAsiaScopedPage(url, root);
  const validArea = pageKind === 'area' && locateAreaPage(root, url).ok;
  const validRoute = pageKind === 'route' && Boolean(root.querySelector(ROUTE_SELECTORS.page));
  const validFinder = pageKind === 'route-finder' && (
    selectedAreaIds(url).some((id) => /^\d+$/.test(id))
    || Boolean(root.querySelector('form#routeFinderForm'))
  );
  const validPhoto = pageKind === 'photo' && Boolean(root.querySelector(PHOTO_CONTAINER_SELECTOR));
  const validHelp = pageKind === 'help' && Boolean(root.querySelector(HELP_SELECTORS.classicPage));
  const validHelpHub = pageKind === 'help-hub' && Boolean(root.querySelector(HELP_SELECTORS.hubPage));
  const validAbout = pageKind === 'about' && Boolean(root.querySelector(ABOUT_SELECTORS.page));
  const validNameReview = pageKind === 'name-review'
    && Boolean(root.querySelector(HELP_SELECTORS.nameReviewPage));
  const validForum = (pageKind === 'forum' || pageKind === 'forum-topic')
    && Boolean(root.querySelector('#forum-table, #topic-guts'));
  const validSearch = pageKind === 'search' && Boolean(root.querySelector('#onx-search'));
  const validPartnerFinder = pageKind === 'partner-finder' && Boolean(root.querySelector(
    `${PARTNER_FINDER_SELECTORS.searchForm}, ${PARTNER_FINDER_SELECTORS.resultTable}`,
  ));
  return {
    pageKind,
    asiaScope,
    authoredTranslation: validArea || validRoute || validFinder || validPhoto
      || validHelp || validHelpHub || validNameReview || validAbout
      || validForum || validSearch || validPartnerFinder
      || pageKind === 'whats-new' || pageKind === 'gym',
    routeSectionPresentation: validRoute,
    areaMap: validArea,
    southKoreaEnhancements: isSouthKoreaScopedPage(url, root),
  };
}
