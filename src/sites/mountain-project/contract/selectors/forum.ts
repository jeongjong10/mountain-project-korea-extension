/** Public forum markup observed in the owned Chrome session, 2026-09-29. */
export const FORUM_SELECTORS = {
  uiText: '#forum-table div, #topic-guts div, #topic-guts p, .forum-guidelines, .forum-search, form[action*="/forum-topic"] p, form[action*="/forum-message"] p',
  authoredTitle: '#topic-guts h1, #forum-table a[href*="/forum/topic/"], #onx-search a[href*="/forum/topic/"] h3',
  metadata: '#forum-table td.text-nowrap.text-xs-right, #forum-table .message-row .bio .text-warm, #forum-table a[href*="/forum/message/"], #forum-table .permalink, #forum-table time',
} as const;
