import { buildMountainProjectUrl } from '../origins';
import {
  buildAreaPath,
  buildMapPath,
  normalizeMountainProjectPath,
  parseAreaPath,
} from '../routes';

export const SOUTH_KOREA_AREA_ID = '106225629';
export const SOUTH_KOREA_AREA_SLUG = 'south-korea';
export const SOUTH_KOREA_AREA_PATH = buildAreaPath(
  SOUTH_KOREA_AREA_ID,
  SOUTH_KOREA_AREA_SLUG,
);
export const SOUTH_KOREA_MAP_PATH = buildMapPath(
  SOUTH_KOREA_AREA_ID,
  SOUTH_KOREA_AREA_SLUG,
);
export const SOUTH_KOREA_AREA_URL = buildMountainProjectUrl(SOUTH_KOREA_AREA_PATH);
export const SOUTH_KOREA_MAP_URL = buildMountainProjectUrl(SOUTH_KOREA_MAP_PATH);

export interface SouthKoreaAreaContract {
  readonly id: string;
  readonly sourceName: string;
  readonly koreanName: string;
}

export const SOUTH_KOREA_AREAS: readonly SouthKoreaAreaContract[] = [
  {
    id: '126256865',
    sourceName: 'Gamaksan (Dawn Wall), Paju-si, Gyeonggi-do (Seolma 12 Bridge)',
    koreanName: '감악산(새벽벽), 파주시, 경기도(설마12교)',
  },
  {
    id: '119456790',
    sourceName: 'Gangwon-do (Northeast Korea)',
    koreanName: '강원도(한국 북동부)',
  },
  {
    id: '119631691',
    sourceName: 'Jeju Island',
    koreanName: '제주도',
  },
  {
    id: '119456771',
    sourceName: 'North/South Chungcheong-do (Midwest/West Korea)',
    koreanName: '충청북도/충청남도(한국 중서부/서부)',
  },
  {
    id: '119456816',
    sourceName: 'North/South Gyeongsang-do (East/Southeast Korea)',
    koreanName: '경상북도/경상남도(한국 동부/남동부)',
  },
  {
    id: '119456784',
    sourceName: 'North/South Jeolla-do (Southwest Korea)',
    koreanName: '전라북도/전라남도(한국 남서부)',
  },
  {
    id: '119456750',
    sourceName: 'Seoul/Gyeonggi-do (Northwest Korea)',
    koreanName: '서울/경기도(한국 북서부)',
  },
] as const;

export const SOUTH_KOREA_AREA_IDS: ReadonlySet<string> = new Set([
  SOUTH_KOREA_AREA_ID,
  ...SOUTH_KOREA_AREAS.map(({ id }) => id),
]);

export const SOUTH_KOREA_NAME_ALIASES: ReadonlySet<string> = new Set([
  'South Korea',
  'S Korea',
  '대한민국',
  ...SOUTH_KOREA_AREAS.flatMap(({ sourceName, koreanName }) => [sourceName, koreanName]),
]);

const koreanAreaNames = new Map(
  SOUTH_KOREA_AREAS.map(({ id, koreanName }) => [id, koreanName]),
);

export function isSouthKoreaAreaId(id: string | undefined): boolean {
  return Boolean(id && SOUTH_KOREA_AREA_IDS.has(id));
}

export function isSouthKoreaNameAlias(name: string | undefined): boolean {
  return Boolean(name && SOUTH_KOREA_NAME_ALIASES.has(name));
}

export function isSouthKoreaAreaPath(pathname: string): boolean {
  return normalizeMountainProjectPath(pathname) === SOUTH_KOREA_AREA_PATH;
}

export function areaIdFromPath(pathname: string): string | undefined {
  return parseAreaPath(pathname)?.id;
}

export function southKoreaAreaName(id: string | undefined): string | undefined {
  return id ? koreanAreaNames.get(id) : undefined;
}

export function selectedAreaIds(url: URL): string[] {
  return url.searchParams.getAll('selectedIds')
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter(Boolean);
}
