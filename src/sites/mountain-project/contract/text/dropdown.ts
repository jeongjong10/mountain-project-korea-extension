const DROPDOWN_UI_TEXT: Readonly<Record<string, string>> = {
  'Improve This Page': '이 페이지 개선',
  'Add To Page': '페이지에 추가',
  'Suggest Changes': '변경 제안',
  'Suggest Change:': '변경 제안:',
  'Wrong Map Location?': '지도 위치가 잘못되었나요?',
  'Flag Discriminatory Name': '차별적 명칭 신고',
  'Other Suggestion': '기타 제안',
  'Edit This Page': '이 페이지 편집',
  'Edit Area': '지역 편집',
  'Edit Route': '루트 편집',
  'View Page Updates': '페이지 변경 내역 보기',
  'Page Updates (admin only)': '페이지 변경 내역(관리자 전용)',
  'Route Sort': '루트 정렬',
  Description: '설명',
  'Getting There': '가는 방법',
  Route: '루트',
  'Add a Route': '루트 추가',
  'Add New Route': '새 루트 추가',
  'Add a Sub-Area': '하위 지역 추가',
  'Add New Area': '새 지역 추가',
  'Sub-Area': '하위 지역',
  Photo: '사진',
  'Add a Photo': '사진 추가',
  'Add New Photo': '새 사진 추가',
  'Photo (copy)': '사진 복사',
  'Add a Video': '동영상 추가',
  'Add New Video': '새 동영상 추가',
  Video: '동영상',
  'Add an Approach Trail': '접근로 추가',
  'Approach/Descent Trail': '접근로/하산로',
  'Add a Guidebook': '가이드북 추가',
  'Add New Guidebook': '새 가이드북 추가',
  Book: '가이드북',
  'Add a Symbol': '기호 추가',
  Highlight: '강조',
  'Show all routes': '모든 루트 표시',
  'Show All Routes': '모든 루트 표시',
  Trad: '트래드',
  Sport: '스포츠',
  Toprope: '톱로프',
  Boulder: '볼더링',
  Ice: '빙벽',
  Aid: '인공등반',
  Mixed: '믹스드',
  Alpine: '알파인',
  'Sort by:': '정렬:',
  Newest: '최신순',
  Oldest: '오래된순',
  Popular: '인기순',
  Profile: '프로필',
  'My Profile': '내 프로필',
  'Your Profile': '내 프로필',
  Account: '계정',
  'My Account': '내 계정',
  'Account Settings': '계정 설정',
  Settings: '설정',
  Favorites: '즐겨찾기',
  'My Favorites': '내 즐겨찾기',
  'Your Favorites': '내 즐겨찾기',
  'To-Do List': '등반 예정 목록',
  'My To-Do List': '내 등반 예정 목록',
  'Your To-Do List': '내 등반 예정 목록',
  Ticks: '등반 기록',
  'My Ticks': '내 등반 기록',
  Messages: '메시지',
  'Forum Messages': '포럼 메시지',
  Contributions: '기여',
  'My Contributions': '내 기여',
  'Log Out': '로그아웃',
  'Log out': '로그아웃',
  'Sign Out': '로그아웃',
  'Drop down': '펼치기',
};

const ROUTE_TYPE_TEXT: Readonly<Record<string, string>> = {
  Trad: '트래드',
  Sport: '스포츠',
  Toprope: '톱로프',
  Boulder: '볼더링',
  Ice: '빙벽',
  Aid: '인공등반',
  Mixed: '믹스드',
  Alpine: '알파인',
};

function normalizedText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function translateDropdownUiText(value: string): string | undefined {
  const text = normalizedText(value);
  const exact = DROPDOWN_UI_TEXT[text];
  if (exact) return exact;

  const routeType = text.match(/^(Trad|Sport|Toprope|Boulder|Ice|Aid|Mixed|Alpine) Routes in (?:Red|빨간색)$/);
  if (routeType?.[1]) return `${ROUTE_TYPE_TEXT[routeType[1]]} 루트 빨간색`;
  const routeTypePrefix = text.match(/^(Trad|Sport|Toprope|Boulder|Ice|Aid|Mixed|Alpine) Routes in$/);
  if (routeTypePrefix?.[1]) return `${ROUTE_TYPE_TEXT[routeTypePrefix[1]]} 루트`;
  return undefined;
}

export function isKnownHeaderDropdownUiText(value: string): boolean {
  const text = normalizedText(value);
  return Boolean(DROPDOWN_UI_TEXT[text]) && [
    'Profile', 'My Profile', 'Your Profile',
    'Account', 'My Account', 'Account Settings', 'Settings',
    'Favorites', 'My Favorites', 'Your Favorites',
    'To-Do List', 'My To-Do List', 'Your To-Do List',
    'Ticks', 'My Ticks', 'Messages', 'Forum Messages',
    'Contributions', 'My Contributions', 'Log Out', 'Log out', 'Sign Out',
  ].includes(text);
}
