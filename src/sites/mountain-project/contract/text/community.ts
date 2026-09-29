import type { PageKind } from '../routes';
import {
  translatePartnerFinderPlaceholder,
  translatePartnerFinderUi,
} from './partner-finder';

export const BROWSING_PAGE_KINDS: readonly PageKind[] = [
  'route-guide', 'gyms', 'gym', 'whats-new', 'partner-finder', 'forum', 'forum-topic', 'forum-form',
];

const UI: Readonly<Record<string, string>> = {
  'Rock Climbing Guide': '암벽등반 가이드',
  'The Top 10 Classic Rock Climbing Routes': '대표 클래식 루트 10선',
  'Find More Classics Near You': '주변 클래식 루트 더 찾기',
  'Tell us what you like, we\'ll tell you what to climb!': '원하는 조건에 맞는 등반 루트를 찾아보세요!',
  'View Interactive Map': '지도 보기', 'Interactive Map': '클라이밍 지도',
  'Climbing Gym Directory': '클라이밍 짐 찾기', 'Improve this map': '지도 개선 제안',
  'Add a Gym': '클라이밍 짐 추가', 'Search Gyms': '클라이밍 짐 검색',
  'All Gyms': '모든 클라이밍 짐', 'Have a favorite gym?': '즐겨 찾는 클라이밍 짐이 있나요?',
  'Mountain Project can\'t be a complete community resource without climbing gyms. Please help us keep our gym database up to date.': '클라이밍 짐 정보를 최신 상태로 유지할 수 있도록 도와주세요.',
  'Add Missing Gym': '누락된 클라이밍 짐 추가', 'Gym Information:': '클라이밍 짐 정보:',
  'Rate This Gym:': '이 클라이밍 짐 평가:', 'Rating': '평점', 'Clear Rating': '평점 지우기',
  'No Photos': '사진 없음', 'Your mission: upload a sweet image.': '이 클라이밍 짐의 사진을 공유해 주세요.',
  'Add Photo': '사진 추가', 'Sort by:': '정렬:', 'Oldest': '오래된 순',
  'Newest': '최신 순', 'Popular': '인기 순', 'Write a comment': '댓글 작성',
  'Comment Type:': '댓글 유형:', 'Lost or Found Item': '분실물 또는 습득물',
  'self-destructs in 30 days': '30일 후 자동 삭제', 'Have you climbed here?': '이곳에서 등반해 보셨나요?',
  'Add details to help others learn more about this gym.': '다른 사용자가 이 클라이밍 짐을 더 잘 알 수 있도록 정보를 추가해 주세요.',
  'Make a Suggestion': '수정 제안', 'Nearby Gyms': '주변 클라이밍 짐',
  'Drop down': '목록 펼치기',
  'What\'s New': '새 소식', 'Mountain Project is built by climbers like you.': 'Mountain Project는 여러분과 같은 클라이머들이 함께 만듭니다.',
  'RSS Feeds of What\'s New': '새 소식 RSS 구독', 'Your Favorites:': '즐겨찾는 지역:',
  'Your Favorites: - none -': '즐겨찾는 지역: 없음', '- none -': '없음',
  '[Change Your Favorites]': '[즐겨찾는 지역 변경]', 'Within:': '기간:',
  '1 Day': '1일', '1 Week': '1주', '1 Month': '1개월', '3 Months': '3개월',
  'New since your last visit:': '마지막 방문 이후 새 항목:', 'unknown': '알 수 없음',
  'New since your last visit: unknown': '마지막 방문 이후 새 항목: 알 수 없음',
  'New FA': '새 초등',
  'All Forums': '전체 포럼', 'Latest Posts in all Forums': '전체 포럼의 최신 글',
  'Start New Topic': '새 글 작성', 'Topic': '주제', 'Replies': '답글', 'Last Post': '최근 글',
  'Post Reply': '답글 작성', 'Original Post': '원글', 'Follow topic:': '글 알림:',
  'Email': '이메일', 'Notify on site': '사이트에서 알림', 'Quote': '인용', 'Flag': '신고',
  'Reply': '답글', 'Submit': '등록', 'Preview': '미리보기',
  'No results found.': '검색 결과가 없습니다.', 'No Results': '검색 결과 없음',
  'Last post': '최근 글', 'by': '작성자',
  'View Comment': '댓글 보기',
};

export function translateCommunityUi(value: string): string | undefined {
  const text = value.replace(/\s+/g, ' ').trim();
  if (UI[text]) return UI[text];
  let match = text.match(/^Climbing Directory to ([\d,]+) Routes$/);
  if (match) return `${match[1]}개 루트 찾아보기`;
  match = text.match(/^(.+) Climbing Gym Directory$/);
  if (match) return `${match[1]} 클라이밍 짐 찾기`;
  match = text.match(/^Photos of (.+)$/);
  if (match) return `${match[1]} 사진`;
  match = text.match(/^(\d+) Comments?$/);
  if (match) return `댓글 ${match[1]}개`;
  match = text.match(/^Avg:\s*([\d.]+) from ([\d,]+) votes?$/);
  if (match) return `평균 ${match[1]}점 (${match[2]}명 평가)`;
  match = text.match(/^([\d,]+) Gyms?$/);
  if (match) return `클라이밍 짐 ${match[1]}곳`;
  match = text.match(/^(?:Page )?(\d+) of ([\d,]+)$/);
  if (match) return `${match[1]} / ${match[2]} 페이지`;
  match = text.match(/^(\d+) repl(?:y|ies)(.*)$/);
  if (match) return `답글 ${match[1]}개${match[2]}`;
  match = text.match(/^(?:Last post )?(\d+) (min|minute|hour|day|week|month|year)s? ago( by)?$/);
  if (match) return `${match[1]}${({min:'분',minute:'분',hour:'시간',day:'일',week:'주',month:'개월',year:'년'} as Record<string,string>)[match[2]!]} 전${match[3] ? ' 작성자' : ''}`;
  if (/Joined [A-Z][a-z]{2} \d{4}/.test(text)) {
    return text.replace(/Joined (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4})/, (_, month: string, year: string) =>
      `${year}년 ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(month) + 1}월 가입`)
      .replace(/Points: (\d+)/, '포인트: $1');
  }
  match = text.match(/^New in (.+) in the last month:$/);
  if (match) return `최근 한 달 ${match[1] === 'All Locations' ? '전체 지역' : match[1]}의 새 항목:`;
  if (/^[\d,]+ (?:Routes|Areas|Comments|Photos|Ticks)/.test(text)) {
    return text.replace(/([\d,]+) (Routes|Areas|Comments|Photos|Ticks)/g, (_, count: string, kind: string) => `${({Routes:'루트',Areas:'지역',Comments:'댓글',Photos:'사진',Ticks:'등반 기록'} as Record<string,string>)[kind]} ${count}건`);
  }
  return translatePartnerFinderUi(text) ?? translatePartnerFinderPlaceholder(text);
}
