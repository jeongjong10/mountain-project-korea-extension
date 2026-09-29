export const ROUTE_FINDER_SELECTORS = {
  form: '#routeFinderForm',
  resultSummary: '.pt-main-content .float-md-left',
  resultMetadata: 'a.route-row .small.text-warm',
  pagination: '.pagination',
  screenReaderOnly: '.screen-reader-only',
  states: '#finder-states',
} as const;

export const ROUTE_FINDER_UI_SCOPE = [
  ROUTE_FINDER_SELECTORS.form,
  ROUTE_FINDER_SELECTORS.resultSummary,
  ROUTE_FINDER_SELECTORS.pagination,
  ROUTE_FINDER_SELECTORS.screenReaderOnly,
  ROUTE_FINDER_SELECTORS.states,
].join(', ');
