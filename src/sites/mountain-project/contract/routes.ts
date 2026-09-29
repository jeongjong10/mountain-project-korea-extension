import { isMountainProjectUrl } from './origins';

export type PageKind =
  | 'main'
  | 'area'
  | 'route'
  | 'route-stats'
  | 'route-finder'
  | 'photo'
  | 'user'
  | 'contact-user'
  | 'route-guide'
  | 'gyms'
  | 'gym'
  | 'whats-new'
  | 'partner-finder'
  | 'forum'
  | 'forum-topic'
  | 'forum-form'
  | 'search'
  | 'help'
  | 'help-hub'
  | 'about'
  | 'name-review'
  | 'contribution'
  | 'unsupported';

export interface EntityPath {
  readonly id: string;
  readonly slug?: string;
}

export interface UserPath extends EntityPath {
  readonly slug: string;
  readonly section?: 'contributions' | 'community';
}

export const MOUNTAIN_PROJECT_PATH_PATTERNS = {
  area: /^\/area\/(\d+)(?:\/([^/]+))?$/,
  route: /^\/route\/(\d+)(?:\/([^/]+))?$/,
  routeStats: /^\/route\/stats\/(\d+)(?:\/([^/]+))?$/,
  routeFinder: /^\/route-finder$/,
  partnerFinder: /^\/partner-finder(?:\/results)?$/,
  photo: /^\/photo\/(\d+)(?:\/([^/]+))?$/,
  user: /^\/user\/(\d+)\/([^/]+)(?:\/(contributions|community))?$/,
  contactUser: /^\/contact-user\/(\d+)$/,
  gym: /^\/gym\/(\d+)(?:\/([^/]+))?$/,
  map: /^\/map\/(\d+)(?:\/([^/]+))?$/,
  helpArticle: /^\/help\/(\d+)\/([^/]+)$/,
  forum: /^\/forum(?:\/(?:latest|\d+(?:\/[^/]+)?))?$/,
  forumTopic: /^\/forum\/topic\/\d+(?:\/[^/]+)?$/,
  forumForm: /^\/(?:add\/forum-(?:topic|message)|edit\/forum-message)\/\d+$/,
  contribution: /^\/(?:add|edit|suggest)\/(?:climb-area|route|photo|trail|video|text-section|symbol)(?:\/\d+)?$/,
  contributionNestedPhoto: /^\/(?:area|route)\/\d+\/add\/photo$/,
  contributionImageLink: /^\/edit\/imageLink\/\d+$/,
  contributionTrailUpload: /^\/upload\/start\/trail$/,
  contributionBook: /^\/edit\/book\/\d+$/,
  contributionShare: /^\/share\/(?:trail|photo|video)$/,
  contributionImprovement: /^\/improvement(?:\/[^/]+)+$/,
  contributionUpdates: /^\/updates\/Climb-Lib-Models-(?:Area|Route|Photo|Trail)\/\d+(?:\/[^/]+)?$/,
} as const;

export function normalizeMountainProjectPath(pathname: string): string {
  return pathname.replace(/\/+$/, '') || '/';
}

function parseEntityPath(pattern: RegExp, pathname: string): EntityPath | undefined {
  const match = normalizeMountainProjectPath(pathname).match(pattern);
  if (!match?.[1]) {
    return undefined;
  }
  return {
    id: match[1],
    ...(match[2] ? { slug: match[2] } : {}),
  };
}

export function parseAreaPath(pathname: string): EntityPath | undefined {
  return parseEntityPath(MOUNTAIN_PROJECT_PATH_PATTERNS.area, pathname);
}

export function parseRoutePath(pathname: string): EntityPath | undefined {
  return parseEntityPath(MOUNTAIN_PROJECT_PATH_PATTERNS.route, pathname);
}

export function parseRouteStatsPath(pathname: string): EntityPath | undefined {
  return parseEntityPath(MOUNTAIN_PROJECT_PATH_PATTERNS.routeStats, pathname);
}

export function parsePhotoPath(pathname: string): EntityPath | undefined {
  return parseEntityPath(MOUNTAIN_PROJECT_PATH_PATTERNS.photo, pathname);
}

export function parseMapPath(pathname: string): EntityPath | undefined {
  return parseEntityPath(MOUNTAIN_PROJECT_PATH_PATTERNS.map, pathname);
}

export function parseUserPath(pathname: string): UserPath | undefined {
  const match = normalizeMountainProjectPath(pathname).match(
    MOUNTAIN_PROJECT_PATH_PATTERNS.user,
  );
  if (!match?.[1] || !match[2]) {
    return undefined;
  }
  const section = match[3] as UserPath['section'];
  return {
    id: match[1],
    slug: match[2],
    ...(section ? { section } : {}),
  };
}

export function parseContactUserPath(pathname: string): EntityPath | undefined {
  return parseEntityPath(MOUNTAIN_PROJECT_PATH_PATTERNS.contactUser, pathname);
}

export function parseGymPath(pathname: string): EntityPath | undefined {
  return parseEntityPath(MOUNTAIN_PROJECT_PATH_PATTERNS.gym, pathname);
}

export function isRouteFinderPath(pathname: string): boolean {
  return MOUNTAIN_PROJECT_PATH_PATTERNS.routeFinder.test(
    normalizeMountainProjectPath(pathname),
  );
}

export function isHelpPath(pathname: string): boolean {
  const path = normalizeMountainProjectPath(pathname);
  return path === '/help' || MOUNTAIN_PROJECT_PATH_PATTERNS.helpArticle.test(path);
}

export function detectPath(pathname: string): PageKind {
  const path = normalizeMountainProjectPath(pathname);
  if (path === '/') {
    return 'main';
  }
  if (path === '/route-guide') return 'route-guide';
  if (path === '/search') return 'search';
  if (path === '/gyms' || /^\/gyms\/[^/]+$/.test(path)) return 'gyms';
  if (parseGymPath(path)) return 'gym';
  if (path === '/whats-new') return 'whats-new';
  if (MOUNTAIN_PROJECT_PATH_PATTERNS.partnerFinder.test(path)) return 'partner-finder';
  if (MOUNTAIN_PROJECT_PATH_PATTERNS.forumForm.test(path)) return 'forum-form';
  if (MOUNTAIN_PROJECT_PATH_PATTERNS.forumTopic.test(path)) return 'forum-topic';
  if (MOUNTAIN_PROJECT_PATH_PATTERNS.forum.test(path)) return 'forum';
  if (isHelpPath(path)) return 'help';
  if (path === '/help-hub') return 'help-hub';
  if (path === '/about') return 'about';
  if (path === '/name-review-process') return 'name-review';
  if (MOUNTAIN_PROJECT_PATH_PATTERNS.contribution.test(path)
    || MOUNTAIN_PROJECT_PATH_PATTERNS.contributionNestedPhoto.test(path)
    || MOUNTAIN_PROJECT_PATH_PATTERNS.contributionImageLink.test(path)
    || MOUNTAIN_PROJECT_PATH_PATTERNS.contributionTrailUpload.test(path)
    || MOUNTAIN_PROJECT_PATH_PATTERNS.contributionBook.test(path)
    || MOUNTAIN_PROJECT_PATH_PATTERNS.contributionShare.test(path)
    || MOUNTAIN_PROJECT_PATH_PATTERNS.contributionImprovement.test(path)
    || MOUNTAIN_PROJECT_PATH_PATTERNS.contributionUpdates.test(path)) {
    return 'contribution';
  }
  if (parseAreaPath(path)) {
    return 'area';
  }
  if (parseRouteStatsPath(path)) {
    return 'route-stats';
  }
  if (parseRoutePath(path)) {
    return 'route';
  }
  if (isRouteFinderPath(path)) {
    return 'route-finder';
  }
  if (parsePhotoPath(path)) {
    return 'photo';
  }
  if (parseUserPath(path)) {
    return 'user';
  }
  if (parseContactUserPath(path)) {
    return 'contact-user';
  }
  return 'unsupported';
}

export function detectPage(url: URL): PageKind {
  return isMountainProjectUrl(url) ? detectPath(url.pathname) : 'unsupported';
}

function buildEntityPath(prefix: string, id: string, slug?: string): string {
  return `${prefix}/${encodeURIComponent(id)}${slug ? `/${encodeURIComponent(slug)}` : ''}`;
}

export function buildAreaPath(id: string, slug?: string): string {
  return buildEntityPath('/area', id, slug);
}

export function buildMapPath(id: string, slug?: string): string {
  return buildEntityPath('/map', id, slug);
}

export function buildRoutePath(id: string, slug?: string): string {
  return buildEntityPath('/route', id, slug);
}

export function buildRouteStatsPath(id: string, slug?: string): string {
  return buildEntityPath('/route/stats', id, slug);
}

export function isEntityContentPath(pathname: string): boolean {
  const path = normalizeMountainProjectPath(pathname);
  return /^\/(?:area|route|photo|video|user)(?:\/|$)/.test(path);
}

export function isMapInformationPath(pathname: string): boolean {
  const path = normalizeMountainProjectPath(pathname);
  return /^\/(?:area|route|photo|video|user)\/\d+(?:\/|$)/.test(path)
    || /^\/forum\/topic\/\d+(?:\/|$)/.test(path)
    || /^\/route-guide(?:\/|$)/.test(path);
}

export function isInternalActionPath(pathname: string): boolean {
  return /^\/(?:ajax|auth)(?:\/|$)/.test(normalizeMountainProjectPath(pathname));
}

export function isStatsInformationPath(pathname: string): boolean {
  const path = normalizeMountainProjectPath(pathname);
  return isEntityContentPath(path)
    || /^\/(?:forum|route-guide|international-climbing-grades)(?:\/|$)/.test(path);
}
