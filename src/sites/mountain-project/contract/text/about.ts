const ABOUT_UI: Readonly<Record<string, string>> = {
  'Beyond the Guidebook: The Definitive Climbing Resource': '가이드북을 넘어: 클라이밍 종합 정보',
  'Mountain Project: A Free, Crowd-Sourced Guide to Climbing the World': 'Mountain Project: 전 세계 클라이머가 함께 만드는 무료 등반 가이드',
  'The Backstory': 'Mountain Project의 시작',
  'Top contributors': '주요 기여자',
  'Site stats': '사이트 통계',
  'More': '더 보기',
  'Routes': '루트',
  'Areas': '지역',
  'Photos': '사진',
  'Comments': '댓글',
  'Forum posts': '포럼 게시물',
  'Regional Admins:': '지역 관리자:',
  'Mountain Project is run by volunteers. These are the heroes that manage the content.': 'Mountain Project는 자원봉사자들이 운영합니다. 콘텐츠를 관리하는 분들을 소개합니다.',
};

export function translateAboutUi(value: string): string | undefined {
  return ABOUT_UI[value.replace(/\s+/g, ' ').trim()];
}
