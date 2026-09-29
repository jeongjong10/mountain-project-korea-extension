import type { TranslationContextCategory } from '@/core/translation-provider';

export interface TranslationQualityCorpusEntry {
  category: TranslationContextCategory;
  source: string;
  /** Human review hint, not an exact-match assertion or measured engine result. */
  expected: string;
}

export const TRANSLATION_QUALITY_CORPUS: readonly TranslationQualityCorpusEntry[] = [
  { category: 'description', source: 'Clip the anchor at the top.', expected: '앵커' },
  { category: 'comment', source: 'Both anchors were replaced.', expected: '앵커' },
  { category: 'safety', source: 'The belay station has two bolts.', expected: '빌레이 스테이션' },
  { category: 'safety', source: 'Use the fixed anchor for descent.', expected: '고정 앵커' },
  { category: 'description', source: 'The crux comes early.', expected: '크럭스' },
  { category: 'description', source: 'The route has four pitches.', expected: '피치' },
  { category: 'safety', source: 'Rappel from the upper anchor.', expected: '라펠' },
  { category: 'help', source: 'How is trad recorded?', expected: '트래드' },
  { category: 'help', source: 'Select sport climbing.', expected: '스포츠 클라이밍' },
  { category: 'help', source: 'Can I log a top rope?', expected: '톱로프' },
  { category: 'description', source: 'Bouldering is popular here.', expected: '볼더링' },
  { category: 'safety', source: 'Bring twelve quickdraws.', expected: '퀵드로우' },
  { category: 'safety', source: 'Bring 12 draws.', expected: '퀵드로우' },
  { category: 'description', source: 'Clip the draws before the crux.', expected: '퀵드로우' },
  { category: 'safety', source: 'Carry Alpine draws for extension.', expected: '알파인 퀵드로우' },
  { category: 'safety', source: 'Replace the old style anchor.', expected: '구형 앵커' },
  { category: 'comment', source: 'The old-style anchor needs inspection.', expected: '구형 앵커' },
  { category: 'description', source: 'Check the topo before climbing.', expected: '등반 개념도' },
  { category: 'description', source: 'The route wanders after the ledge.', expected: '루트가 이리저리 이어짐(앵커 언급 없음)' },
  { category: 'description', source: 'Climb the Bolt-Ladder carefully.', expected: '볼트 사다리' },
  { category: 'safety', source: 'Expect Rope Drag above the roof.', expected: '로프 마찰' },
  { category: 'comment', source: 'Peep the badass on the final pitch.', expected: '멋진 것을 보라는 구어 표현(문맥 확인 필요)' },
  { category: 'safety', source: 'Small cams protect the crack.', expected: '캠' },
  { category: 'safety', source: 'The bolts are stainless steel.', expected: '볼트' },
  { category: 'comment', source: 'The finish feels runout.', expected: '런아웃' },
  { category: 'description', source: 'Climb the offwidth on the right.', expected: '오프위드스' },
  { category: 'description', source: 'Enter the chimney above the ledge.', expected: '침니' },
  { category: 'description', source: 'The slab is polished.', expected: '슬랩' },
  { category: 'description', source: 'Follow the hand crack.', expected: '핸드 크랙' },
  { category: 'description', source: 'Start in the finger crack.', expected: '핑거 크랙' },
  { category: 'access', source: 'The approach takes one hour.', expected: '어프로치' },
  { category: 'access', source: 'Park beside the trailhead.', expected: '등산로 입구' },
  { category: 'access', source: 'Scramble up the final ridge.', expected: '스크램블' },
  { category: 'safety', source: 'The descent follows the gully.', expected: '하강' },
  { category: 'safety', source: 'Carry a standard rack.', expected: '랙' },
  { category: 'safety', source: 'Protection is sparse near the top.', expected: '보호 장비' },
  { category: 'comment', source: 'Thanks for the beta.', expected: '베타' },
  { category: 'help', source: 'A tick records your ascent.', expected: '등반 기록' },
  { category: 'comment', source: 'Belaying from the ledge is comfortable.', expected: '빌레이' },
  { category: 'description', source: 'Top-roping is possible from above.', expected: '톱로프' },
] as const;
