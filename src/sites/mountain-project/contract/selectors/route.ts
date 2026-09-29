import type { SelectorContract } from '../schema';

export const ROUTE_SELECTORS = {
  pageId: 'route-page',
  page: '#route-page',
  youAndRoute: '#you-and-route',
  overviewExact: '.col-lg-7.col-md-6',
  rowExact: '.row',
  mainContent: '.main-content',
  summaryExact: '.small.mb-1',
  auxiliaryExact: '.col-lg-5.col-md-6',
  onxLandmark: '.onx-explore',
  carouselLandmark: '#photo-carousel',
  hiddenDesktop: '.hidden-sm-down',
  statsLinks: 'a[href*="/route/stats/"]',
  sunShade: '#sun-shade',
  classicVote: '.is_classic_vote',
  classicVoteUserData: [
    '.is_classic_vote .route-name',
    '.is_classic_vote .user-content',
    '.is_classic_vote [data-route-name]',
    '.is_classic_vote a[href*="/route/"]',
    '.is_classic_vote a[href*="/area/"]',
    '.is_classic_vote a[href*="/user/"]',
  ].join(', '),
} as const;

export const ROUTE_PAGE_CONTRACT = {
  component: 'route-stats-embed',
  key: 'route-page',
  required: true,
  candidates: [{ key: 'route-page-id', selector: ROUTE_SELECTORS.page }],
} as const satisfies SelectorContract;

export const ROUTE_YOU_AND_ROUTE_CONTRACT = {
  component: 'route-stats-embed',
  key: 'you-and-route',
  required: true,
  candidates: [{ key: 'you-and-route-id', selector: ROUTE_SELECTORS.youAndRoute }],
} as const satisfies SelectorContract;

export const ROUTE_AUXILIARY_CONTRACT = {
  component: 'route-stats-embed',
  key: 'auxiliary-regions',
  required: true,
  candidates: [
    { key: 'bootstrap-v4-columns', selector: ROUTE_SELECTORS.auxiliaryExact },
    { key: 'semantic-landmarks', selector: `${ROUTE_SELECTORS.onxLandmark}, ${ROUTE_SELECTORS.carouselLandmark}` },
  ],
} as const satisfies SelectorContract;
