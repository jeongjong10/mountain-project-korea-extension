import { buildMountainProjectUrl } from '../origins';
import {
  buildAreaPath,
  buildMapPath,
  normalizeMountainProjectPath,
} from '../routes';
import { SOUTH_KOREA_AREA_IDS } from './south-korea';

export const ASIA_AREA_ID = '106661515';
export const ASIA_AREA_SLUG = 'asia';
export const ASIA_AREA_PATH = buildAreaPath(ASIA_AREA_ID, ASIA_AREA_SLUG);
export const ASIA_MAP_PATH = buildMapPath(ASIA_AREA_ID, ASIA_AREA_SLUG);
export const ASIA_AREA_URL = buildMountainProjectUrl(ASIA_AREA_PATH);
export const ASIA_MAP_URL = buildMountainProjectUrl(ASIA_MAP_PATH);

// IDs whose Asia ancestry is known without inspecting the current document.
// Other Asia descendants are recognized from their location trail.
export const KNOWN_ASIA_AREA_IDS: ReadonlySet<string> = new Set([
  ASIA_AREA_ID,
  ...SOUTH_KOREA_AREA_IDS,
]);

export function isKnownAsiaAreaId(id: string | undefined): boolean {
  return Boolean(id && KNOWN_ASIA_AREA_IDS.has(id));
}

export function isAsiaAreaPath(pathname: string): boolean {
  return normalizeMountainProjectPath(pathname) === ASIA_AREA_PATH;
}

export function selectedAreaIds(url: URL): string[] {
  return url.searchParams.getAll('selectedIds')
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter(Boolean);
}
