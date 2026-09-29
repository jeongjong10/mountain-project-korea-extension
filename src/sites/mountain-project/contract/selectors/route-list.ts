export const ROUTE_LIST_SELECTORS = {
  sidebarRow: '.lef-nav-row',
  rows: [
    'tr.route-row',
    'table.route-table tr:not(.screen-reader-only)',
    'li.route-row',
    '.route-list-item',
    '.classic-route',
    '.lef-nav-row',
  ].join(','),
  secondaryContext: [
    '.scoreStars',
    '.route-stars',
    '.rating',
    '.actions',
    '.action',
    '.dropdown',
    '.menu',
    'button',
    'label',
  ].join(','),
  screenReaderOnlyClass: 'screen-reader-only',
} as const;
