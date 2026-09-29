export interface CompactStatsSectionContract {
  readonly sourceLabels: readonly string[];
  readonly translatedLabel: string;
}

export const COMPACT_STATS_SECTIONS: readonly CompactStatsSectionContract[] = [
  {
    sourceLabels: ['Suggested Ratings', '추천 난이도', '체감 난이도'],
    translatedLabel: '체감 난이도',
  },
  {
    sourceLabels: ['Star Ratings', 'Star Distribution', '별점 분포', '사용자 별점'],
    translatedLabel: '사용자 별점',
  },
  {
    sourceLabels: ['On To-Do Lists', 'To-Do Lists', '할 일 목록 등록', '등반 예정자'],
    translatedLabel: '등반 예정자',
  },
] as const;
