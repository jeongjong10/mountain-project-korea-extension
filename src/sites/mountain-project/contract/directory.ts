import { buildMountainProjectUrl } from './origins';
import { buildAreaPath } from './routes';
import { SOUTH_KOREA_AREAS } from './regions/south-korea';

export const DIRECTORY_SELECTORS = { root: '#route-guide' } as const;

export const KOREA_DIRECTORY_LINKS = [
  ['119456750', '서울·경기'], ['119456790', '강원'],
  ['119456771', '충청'], ['119456816', '경상'],
  ['119456784', '전라'], ['119631691', '제주'],
].map(([id, label]) => {
  const area = SOUTH_KOREA_AREAS.find((candidate) => candidate.id === id)!;
  return { label: label!, url: buildMountainProjectUrl(buildAreaPath(area.id)) };
});

export { ASIA_DIRECTORY_COUNTRIES, EUROPE_DIRECTORY_COUNTRIES } from './directory-destinations';
