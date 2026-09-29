export const DATE_SELECTORS = {
  explicitMetadata: [
    'time',
    '[itemprop="datePublished"]',
    '[itemprop="dateModified"]',
    '[data-date]',
    '[data-datetime]',
    '.comment-time',
    '.activity-date',
    '.published-date',
    '.updated-date',
    '.tick-date',
    '#forum-table .message-row .bio .text-warm',
    '#forum-table a[href*="/forum/message/"]',
    '#whats-new .comment-row .float-xs-right.text-warm',
  ].join(', '),
  statsTickDate: [
    '#ticks-body tr td:nth-child(2) strong',
    'tr[id^="ticks."] td:nth-child(2) strong',
  ].join(', '),
  userActivityDate: [
    '#user-profile .comment-row .float-xs-right.text-warm',
    '#user-profile .forum-message-row .text-warm.small',
  ].join(', '),
  userBioMetadata: '#user-profile #bio > div',
  descriptionRows: 'table.description-details tr',
  tables: 'table',
} as const;
