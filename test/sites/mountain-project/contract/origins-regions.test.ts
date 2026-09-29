import {
  MOUNTAIN_PROJECT_CANONICAL_ORIGIN,
  MOUNTAIN_PROJECT_MATCH_PATTERNS,
  buildMountainProjectUrl,
  isMountainProjectHostname,
  isMountainProjectUrl,
} from '@/sites/mountain-project/contract/origins';
import {
  SOUTH_KOREA_AREA_ID,
  SOUTH_KOREA_AREA_PATH,
  SOUTH_KOREA_AREA_URL,
  SOUTH_KOREA_MAP_URL,
  areaIdFromPath,
  isSouthKoreaAreaId,
  isSouthKoreaAreaPath,
  isSouthKoreaNameAlias,
  selectedAreaIds,
  southKoreaAreaName,
} from '@/sites/mountain-project/contract/regions/south-korea';

describe('Mountain Project origin and South Korea contracts', () => {
  it('keeps host permissions and runtime host checks in one canonical contract', () => {
    expect(MOUNTAIN_PROJECT_CANONICAL_ORIGIN).toBe('https://www.mountainproject.com');
    expect(MOUNTAIN_PROJECT_MATCH_PATTERNS).toEqual([
      'https://mountainproject.com/*',
      'https://www.mountainproject.com/*',
    ]);
    expect(isMountainProjectHostname('mountainproject.com')).toBe(true);
    expect(isMountainProjectHostname('www.mountainproject.com')).toBe(true);
    expect(isMountainProjectUrl(new URL('https://www.mountainproject.com/area/1'))).toBe(true);
    expect(isMountainProjectUrl(new URL('http://www.mountainproject.com/area/1'))).toBe(false);
    expect(isMountainProjectUrl(new URL('https://example.com/area/1'))).toBe(false);
    expect(buildMountainProjectUrl('/route-guide')).toBe(
      'https://www.mountainproject.com/route-guide',
    );
  });

  it('owns the South Korea identity, canonical URLs, and known territory aliases', () => {
    expect(SOUTH_KOREA_AREA_ID).toBe('106225629');
    expect(SOUTH_KOREA_AREA_PATH).toBe('/area/106225629/south-korea');
    expect(SOUTH_KOREA_AREA_URL).toBe(
      'https://www.mountainproject.com/area/106225629/south-korea',
    );
    expect(SOUTH_KOREA_MAP_URL).toBe(
      'https://www.mountainproject.com/map/106225629/south-korea',
    );
    expect(isSouthKoreaAreaPath(`${SOUTH_KOREA_AREA_PATH}/`)).toBe(true);
    expect(isSouthKoreaAreaId('119456750')).toBe(true);
    expect(isSouthKoreaAreaId('105833388')).toBe(false);
    expect(isSouthKoreaNameAlias('Gangwon-do (Northeast Korea)')).toBe(true);
    expect(areaIdFromPath('/area/119456750/seoul-gyeonggi-do')).toBe('119456750');
    expect(southKoreaAreaName('119631691')).toBe('제주도');
    expect(selectedAreaIds(new URL(
      'https://www.mountainproject.com/route-finder?selectedIds=106225629,119456750&selectedIds=119631691',
    ))).toEqual(['106225629', '119456750', '119631691']);
  });
});
