const RESULT_TABLE = '.main-content-container .table-responsive > table.table.table-sm:not(.table-striped)';
const RESULT_ROWS = `${RESULT_TABLE} tbody > tr`;

/** Public Partner Finder markup observed in the owned CfT session, 2026-09-29. */
export const PARTNER_FINDER_SELECTORS = {
  page: '.main-content-container',
  searchForm: '.main-content-container form[action*="/partner-finder/results"]',
  searchPanel: '.main-content-container form[action*="/partner-finder/results"]',
  resultCountHeading: '.main-content-container .page-title p.lead.mb-quarter',
  resultTable: RESULT_TABLE,
  resultRows: RESULT_ROWS,
  resultVitals: `${RESULT_ROWS} > td:nth-child(2)`,
  resultClimbs: `${RESULT_ROWS} > td:nth-child(3)`,
  resultFixedLabels: [
    `${RESULT_ROWS} > td:nth-child(4) strong`,
    `${RESULT_ROWS} > td:nth-child(4) b`,
    `${RESULT_ROWS} > td:nth-child(5) strong`,
    `${RESULT_ROWS} > td:nth-child(5) b`,
  ].join(', '),
  authoredCell: 'tr > td:nth-child(n+4):nth-child(-n+6)',
  authoredCells: `${RESULT_ROWS} > td:nth-child(n+4):nth-child(-n+6)`,
  authoredSource: '.mpkr-partner-finder-authored-source',
  protectedResultData: `${RESULT_ROWS} > td:nth-child(-n+3)`,
  profileLink: 'a[href*="/user/"]',
  uiText: [
    '.main-content-container .page-title h1',
    '.main-content-container .page-title p',
    '.main-content-container .page-title li',
    '.main-content-container form[action*="/partner-finder/results"] p',
    '.main-content-container form[action*="/partner-finder/results"] .small',
    '.main-content-container form[action*="/partner-finder/results"] div',
    `${RESULT_TABLE} th`,
    `${RESULT_ROWS} > td:nth-child(-n+3)`,
    `${RESULT_ROWS} > td:nth-child(-n+3) div`,
    `${RESULT_ROWS} > td:nth-child(4) strong`,
    `${RESULT_ROWS} > td:nth-child(4) b`,
    `${RESULT_ROWS} > td:nth-child(5) strong`,
    `${RESULT_ROWS} > td:nth-child(5) b`,
    '.main-content-container table.table.table-sm.table-striped a[href*="/forum/"]',
    '.main-content-container .pagination a',
    '.main-content-container [role="status"]',
    '.main-content-container [role="alert"]',
  ].join(', '),
} as const;
