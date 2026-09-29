import { isMountainProjectUrl } from '../contract/origins';
import {
  ASIA_AREA_PATH,
  isAsiaAreaPath,
  isKnownAsiaAreaId,
} from '../contract/regions/asia';
import {
  isSouthKoreaAreaPath,
  SOUTH_KOREA_AREA_PATH,
} from '../contract/regions/south-korea';
import { normalizeMountainProjectPath, parseAreaPath } from '../contract/routes';
import { SHARED_SELECTORS } from '../contract/selectors/shared';

export function pathForAnchor(
  anchor: HTMLAnchorElement,
  baseUrl: string | URL,
): string | undefined {
  try {
    return normalizeMountainProjectPath(
      new URL(anchor.getAttribute('href') ?? anchor.href, baseUrl).pathname,
    );
  } catch {
    return undefined;
  }
}

export function isLocationTrailAnchor(anchor: HTMLAnchorElement): boolean {
  if (anchor.closest(SHARED_SELECTORS.explicitBreadcrumb)) {
    return true;
  }
  const trail = anchor.parentElement;
  return Boolean(
    trail?.querySelector(SHARED_SELECTORS.routeGuideLink)
    && (trail.matches('.text-warm, .small') || trail.children.length > 1),
  );
}

export function hasAreaLocationTrail(
  root: ParentNode,
  areaPath: string,
  baseUrl: string | URL,
): boolean {
  return Array.from(
    root.querySelectorAll<HTMLAnchorElement>(SHARED_SELECTORS.areaLinks),
  ).some((anchor) => (
    pathForAnchor(anchor, baseUrl) === areaPath && isLocationTrailAnchor(anchor)
  ));
}

export function hasSouthKoreaLocationTrail(
  root: ParentNode,
  baseUrl: string | URL,
): boolean {
  return hasAreaLocationTrail(root, SOUTH_KOREA_AREA_PATH, baseUrl);
}

export function hasAsiaLocationTrail(
  root: ParentNode,
  baseUrl: string | URL,
): boolean {
  return hasAreaLocationTrail(root, ASIA_AREA_PATH, baseUrl);
}

export function isAsiaAreaContext(
  url: URL,
  root: ParentNode = document,
): boolean {
  if (!isMountainProjectUrl(url) || !parseAreaPath(url.pathname)) {
    return false;
  }
  if (isAsiaAreaPath(url.pathname) || isKnownAsiaAreaId(parseAreaPath(url.pathname)?.id)) {
    return true;
  }
  const baseUrl = root instanceof Document
    ? root.baseURI
    : root.ownerDocument?.baseURI ?? url.href;
  return hasAsiaLocationTrail(root, baseUrl);
}

export function isSouthKoreaAreaContext(
  url: URL,
  root: ParentNode = document,
): boolean {
  if (!isMountainProjectUrl(url) || !parseAreaPath(url.pathname)) {
    return false;
  }
  if (isSouthKoreaAreaPath(url.pathname)) {
    return true;
  }
  const baseUrl = root instanceof Document
    ? root.baseURI
    : root.ownerDocument?.baseURI ?? url.href;
  return hasSouthKoreaLocationTrail(root, baseUrl);
}
