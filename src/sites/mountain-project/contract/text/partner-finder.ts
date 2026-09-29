const PARTNER_FINDER_UI: Readonly<Record<string, string>> = {
  'Partner Finder': '등반 파트너 찾기',
  'Search for a partner': '등반 파트너 검색',
  'Or, post a message looking for a partner': '또는 파트너를 찾는 글을 올려보세요',
  "All fields are optional. The more fields you fill in, the fewer results you'll get.": '모든 조건은 선택 사항입니다. 조건을 많이 지정할수록 검색 결과가 줄어듭니다.',
  Age: '나이',
  Location: '위치',
  'Climbing Type': '등반 종류',
  'Find people who climb at least...': '다음 난이도 이상을 등반하는 파트너 찾기',
  Lead: '선등',
  Follow: '후등',
  to: '~',
  'years old': '세',
  within: '반경',
  miles: '마일',
  'Find Partners': '파트너 찾기',
  Name: '이름',
  Vitals: '기본 정보',
  Climbs: '등반 정보',
  'Best Times': '가능 시간',
  'Best times:': '가능 시간:',
  'Other Interests': '기타 관심사',
  'Other interests:': '기타 관심사:',
  More: '추가 소개',
  'Last visit:': '마지막 방문:',
  'Change search': '검색 조건 변경',
  '« Change search': '« 검색 조건 변경',
  Previous: '이전',
  Next: '다음',
  'Previous Page': '이전 페이지',
  'Next Page': '다음 페이지',
  'No partners found.': '조건에 맞는 파트너가 없습니다.',
  'No possible partners found.': '조건에 맞는 파트너가 없습니다.',
  'No results found.': '검색 결과가 없습니다.',
  'Loading...': '불러오는 중...',
  'Unable to load partners.': '파트너 목록을 불러오지 못했습니다.',
  'Error loading partners.': '파트너 목록을 불러오는 중 오류가 발생했습니다.',
  Retry: '다시 시도',
  'to add yourself!': '하여 파트너 목록에 등록하세요!',
};

export const PARTNER_FINDER_RESULT_HEADERS = [
  'Name',
  'Vitals',
  'Climbs',
  'Best Times',
  'Other Interests',
  'More',
] as const;

const PARTNER_FINDER_PLACEHOLDERS: Readonly<Record<string, string>> = {
  'Postal (zip) code': '우편번호',
  'Search partners': '파트너 검색',
};

const CLIMB_TYPE: Readonly<Record<string, string>> = {
  Trad: '트래드',
  Sport: '스포츠',
  TR: '톱로프',
  Gym: '클라이밍 짐',
  Toprope: '톱로프',
  Boulder: '볼더링',
  Aid: '에이드',
  Ice: '아이스',
  Mixed: '믹스드',
  Boulders: '볼더링',
};

function translatedClimbTypes(value: string): string | undefined {
  const parts = value.split(/,\s*/u);
  if (parts.length === 0 || parts.some((part) => !CLIMB_TYPE[part])) return undefined;
  return parts.map((part) => CLIMB_TYPE[part]).join(', ');
}

function translatedGender(value: string): string | undefined {
  const match = value.match(/^(Male|Female|Non-binary),\s*([\d,]+|unknown)$/u);
  if (!match) return undefined;
  const gender = match[1] === 'Male' ? '남성' : match[1] === 'Female' ? '여성' : '논바이너리';
  return `${gender}, ${match[2] === 'unknown' ? '알 수 없음' : match[2]}`;
}

function translatedClimbs(value: string): string | undefined {
  let match = value.match(/^(Trad|Sport|Toprope|Aid|Ice|Mixed): leads ([^,]+), follows (.+)$/u);
  if (match) return `${CLIMB_TYPE[match[1]!] ?? match[1]}: 선등 ${match[2]}, 후등 ${match[3]}`;
  match = value.match(/^Boulders:\s*(.+)$/u);
  return match ? `볼더링: ${match[1]}` : undefined;
}

export type PartnerFinderResultField = 'name' | 'gender' | 'climb-types' | 'climbs' | 'label';

export function translatePartnerFinderResultUi(
  value: string,
  field: PartnerFinderResultField,
): string | undefined {
  const text = value.replace(/\s+/gu, ' ').trim();
  if (field === 'name') {
    return text === 'Last visit:' ? PARTNER_FINDER_UI[text] : undefined;
  }
  if (field === 'gender') return translatedGender(text);
  if (field === 'climb-types') return translatedClimbTypes(text);
  if (field === 'climbs') return translatedClimbs(text);
  return text === 'Best times:' || text === 'Other interests:'
    ? PARTNER_FINDER_UI[text]
    : undefined;
}

export function translatePartnerFinderSearchUi(value: string): string | undefined {
  return translatedClimbTypes(value.replace(/\s+/gu, ' ').trim());
}

export function translatePartnerFinderUi(value: string): string | undefined {
  const text = value.replace(/\s+/gu, ' ').trim();
  if (Object.prototype.hasOwnProperty.call(PARTNER_FINDER_UI, text)) {
    return PARTNER_FINDER_UI[text];
  }

  let match = text.match(/^Found ([\d,]+) possible partners who:$/u);
  if (match) return `가능한 파트너 ${match[1]}명:`;
  match = text.match(/^live within ([\d,.]+) miles of (.+)$/u);
  if (match) return `${match[2]}에서 ${match[1]}마일 이내 거주`;
  match = text.match(/^Page ([\d,]+) of ([\d,]+)$/u);
  if (match) return `${match[1]} / ${match[2]} 페이지`;
  match = text.match(/^(.+) Partners$/u);
  if (match) return `${match[1]} 등반 파트너`;
  match = text.match(/^Last post (.+)$/u);
  if (match) return `최근 글 ${match[1]}`;
  match = text.match(/^There are ([\d,]+) climbers in the Partner Finder\.$/u);
  if (match) return `파트너 찾기에 클라이머 ${match[1]}명이 등록되어 있습니다.`;
  return undefined;
}

export function isPartnerFinderResultHeaders(values: readonly string[]): boolean {
  return values.length === PARTNER_FINDER_RESULT_HEADERS.length
    && values.every((value, index) => {
      const source = PARTNER_FINDER_RESULT_HEADERS[index];
      return value === source || value === translatePartnerFinderUi(source ?? '');
    });
}

export function translatePartnerFinderPlaceholder(value: string): string | undefined {
  const text = value.replace(/\s+/gu, ' ').trim();
  return Object.prototype.hasOwnProperty.call(PARTNER_FINDER_PLACEHOLDERS, text)
    ? PARTNER_FINDER_PLACEHOLDERS[text]
    : undefined;
}
