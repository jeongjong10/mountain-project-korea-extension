const HELP_UI: Readonly<Record<string, string>> = {
  'Help Center': '도움말 센터',
  'Select a Topic': '주제 선택',
  'About Mountain Project': 'Mountain Project 소개',
  'Overview of Mountain Project Features': 'Mountain Project 기능 안내',
  'Adding New Climbing Areas & Routes': '새 클라이밍 지역 및 루트 추가',
  'Approach and Descent Trails': '접근 및 하산로',
  'Regional Admins': '지역 관리자',
  'My Account and Community': '내 계정과 커뮤니티',
  'Forum': '포럼',
  'General Policies': '일반 정책',
  'Route Name Review Process': '루트명 검토 절차',
  'Name Review Process': '명칭 검토 절차',
  'Please check out the FAQ topics.': '먼저 자주 묻는 질문을 확인해 주세요.',
  'Contact Us': '문의하기',
  'Is this a Bug Report?': '버그 신고인가요?',
  'No': '아니요',
  'Yes': '예',
  'Bug Type': '버그 유형',
  'Web': '웹',
  'Mobile Apps': '모바일 앱',
  'Operating System': '운영체제',
  'Operating System Version': '운영체제 버전',
  'Optional': '선택 사항',
  'Email Address': '이메일 주소',
  'Message': '메시지',
  'Send Message': '메시지 보내기',
  'You can Contact Us if you still need help, but we have limited capacity to respond to everyone.': '도움이 더 필요하면 문의할 수 있지만 모든 요청에 답변드리기는 어렵습니다.',
  'Plese try this first: deleting and re-install the app. That will fix many app issues.': '먼저 앱을 삭제한 뒤 다시 설치해 보세요. 많은 앱 문제가 해결될 수 있습니다.',
  "If you've tried that and having a problem, please fill out the form below.": '그래도 문제가 계속되면 아래 양식을 작성해 주세요.',
  'Find answers, discover features, and help shape what we build next.': '답을 찾고 기능을 살펴보며 다음 개선에 참여하세요.',
  'Browse Topics': '주제 둘러보기',
  'Getting Started': '시작하기',
  'Feature Requests': '기능 제안',
  '✶ Feature Requests': '✶ 기능 제안',
  'All Topics': '모든 주제',
  'Get Started with Mountain Project': 'Mountain Project 시작하기',
  'Four steps to go from zero to ready on your next adventure.': '다음 등반을 준비하는 네 단계를 확인하세요.',
  'Ready to go deeper?': '더 자세히 알아볼까요?',
  'Browse the full topic library or search for a specific question.': '전체 주제를 둘러보거나 궁금한 내용을 검색하세요.',
  'Browse the full topic library or': '전체 주제를 둘러보거나',
  'search for a specific question': '궁금한 내용을 검색하세요',
  'Vote on what matters most. We review every request and post updates here.': '중요한 제안에 투표하세요. 모든 요청을 검토하고 이곳에 진행 상황을 공유합니다.',
  'Submit a Request': '기능 제안 등록',
  'All Categories': '모든 카테고리',
  'All': '전체',
  'Topos & Route Finding': '토포 및 루트 찾기',
  'Offline & Maps': '오프라인 및 지도',
  'Navigation': '탐색',
  'Contributing': '기여',
  'Account': '계정',
  'Mobile App': '모바일 앱',
  'Other': '기타',
  'Top Voted': '투표 많은 순',
  'Newest': '최신순',
  'Still need help?': '도움이 더 필요한가요?',
  'Our support team and community forums are here for you.': '지원팀과 커뮤니티 포럼을 이용할 수 있습니다.',
  'Contact Support': '고객 지원 문의',
  'Community Forums': '커뮤니티 포럼',
  'Submit a Feature Request': '기능 제안 등록',
  'Edit Feature Request': '기능 제안 수정',
  'Title *': '제목 *',
  'Title': '제목',
  'Description *': '설명 *',
  'Description': '설명',
  'Category': '카테고리',
  'Lock topic (prevents community comments)': '주제 잠금(커뮤니티 댓글 차단)',
  'Lock topic': '주제 잠금',
  '(prevents community comments)': '(커뮤니티 댓글 차단)',
  'Cancel': '취소',
  'Submit Request': '제안 등록',
  'Save Changes': '변경사항 저장',
  'Request submitted!': '제안이 등록되었습니다!',
  'Your request has been submitted!': '기능 제안이 등록되었습니다!',
  'Your request has been updated!': '기능 제안이 수정되었습니다!',
  'Failed to submit request. Please try again.': '기능 제안을 등록하지 못했습니다. 다시 시도해 주세요.',
  'Feature request deleted.': '기능 제안이 삭제되었습니다.',
  'Could not delete request. Please try again.': '기능 제안을 삭제하지 못했습니다. 다시 시도해 주세요.',
  'New': '신규',
  'Under Consideration': '검토 중',
  'Planned': '계획됨',
  'In Progress': '진행 중',
  'Shipped': '적용 완료',
  'Not In Scope': '지원 범위 아님',
  'MP response': 'MP 답변',
  'MP Team': 'MP 팀',
  'View team update': '팀 업데이트 보기',
  'View full thread on Mountain Project Forum →': 'Mountain Project 포럼에서 전체 글 보기 →',
  'No requests match your filters': '필터와 일치하는 제안이 없습니다',
  'Try adjusting or clearing your filters.': '필터를 조정하거나 초기화해 보세요.',
  'No results found': '검색 결과가 없습니다',
  'Try different keywords, or': '다른 검색어를 입력하거나',
  'contact support': '고객 지원에 문의하세요',
  'Tip:': '도움말:',
  'Edit': '수정',
  'Edit request': '기능 제안 수정',
  'Delete': '삭제',
  'Delete request': '기능 제안 삭제',
  'Vote': '투표',
  'By': '작성자',
  'Your request will also be posted to the Discuss MP forum.': '기능 제안은 Discuss MP 포럼에도 게시됩니다.',
  'Your request will also be posted to the': '기능 제안이 함께 게시되는 곳:',
  'Discuss MP forum': 'Discuss MP 포럼',
};

export function translateHelpUi(value: string): string | undefined {
  const text = value.replace(/\s+/g, ' ').trim();
  if (HELP_UI[text]) return HELP_UI[text];
  let match = text.match(/^(\d+) results? for "(.+)"$/);
  if (match) return `"${match[2]}" 검색 결과 ${match[1]}개`;
  match = text.match(/^(\d+) comments?$/);
  if (match) return `댓글 ${match[1]}개`;
  match = text.match(/^(\d+) updates?$/);
  if (match) return `업데이트 ${match[1]}개`;
  match = text.match(/^Status updated to "([^"]+)"$/);
  const status = match?.[1];
  if (status && HELP_UI[status]) return `상태가 "${HELP_UI[status]}"(으)로 변경되었습니다`;
  match = text.match(/^Category updated to "([^"]+)"$/);
  const category = match?.[1];
  if (category && HELP_UI[category]) return `카테고리가 "${HELP_UI[category]}"(으)로 변경되었습니다`;
  return undefined;
}

export function translateHelpPlaceholder(value: string): string | undefined {
  const text = value.trim();
  if (text.startsWith('Search for help')) return '도움말 검색 (예: 중복 계정, 루트 추가)';
  if (text === 'Search requests…' || text === 'Search requests...') return '기능 제안 검색';
  if (text === 'Short, descriptive title for your request') return '기능 제안을 간결하게 입력하세요';
  if (text.startsWith('Describe the problem and how this feature would help')) return '문제와 이 기능이 어떤 도움이 되는지 설명하세요';
  return undefined;
}
