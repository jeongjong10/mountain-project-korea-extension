export const COMMUNITY_SELECTORS = {
  topicBody: '#forum-table .message-row .fr-view',
  topicRow: '#forum-table .message-row',
  topicAuthor: '.bio > a[href*="/user/"]',
  activityComment: '#whats-new .comment-row td > .row > .col-md-12',
  activityRow: '#whats-new .comment-row',
  activityAuthor: 'td > a[href*="/user/"]',
  protectedContent: '.fr-view, .mpkr-activity-comment-source, .signature, blockquote, pre, code, cite, [contenteditable="true"], textarea',
  gymDetailTitle: '#climbing-gyms .pt-main-content h1',
  protectedGymValue: '#climbing-gyms .gym-info > div, #climbing-gyms table td.text-xs-right, #climbing-gyms .gym-breadcrumbs a[href*="/gyms/"]',
  uiExtra: '#partner-finder p, #partner-finder div, #whats-new div, #topic-guts div, #forum-table div, #climbing-gyms .gym-count, #climbing-gyms .add-gym-cta p, #climbing-gyms .improve-gym-cta p, #climbing-gyms .photos-cta p, #climbing-gyms .stars-avg',
} as const;
