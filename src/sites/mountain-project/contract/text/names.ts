import { SOUTH_KOREA_AREAS } from '../regions/south-korea';

export const PROPER_NAME_TRANSLATIONS: Readonly<Record<string, string>> = {
  'South Korea': '대한민국',
  'S Korea': '대한민국',
  Asia: '아시아',
  International: '해외',
  ...Object.fromEntries(
    SOUTH_KOREA_AREAS.map(({ sourceName, koreanName }) => [sourceName, koreanName]),
  ),
  'Insu-bong (Bukhansan)': '인수봉(북한산)',
  'Seoraksan National Park (Sokcho)': '설악산 국립공원(속초)',
  'Seoraksan NP (Sokcho)': '설악산 국립공원(속초)',
  'Ulsan-bawi': '울산바위',
  'Seonin-bong (Dobongsan)': '선인봉(도봉산)',
};

export function translateProperName(source: string): string | undefined {
  const korean = PROPER_NAME_TRANSLATIONS[source];
  return korean ? `${korean} (${source})` : undefined;
}
