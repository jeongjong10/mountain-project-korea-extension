import type { SelectorContract } from '../schema';

export const AREA_SELECTORS = {
  pageId: 'climb-area-page',
  page: '#climb-area-page',
  pageTitle: 'h1',
  semanticLandmarks: [
    '.left-nav .mp-sidebar',
    '#photo-carousel',
    '.description-details',
    '.fr-view',
    '#routeFinderForm',
    'table.route-table',
  ].join(', '),
  layoutRowRelative: '.row.pt-main-content',
  layoutRow: '#climb-area-page .row.pt-main-content',
  sidebarExact: '#climb-area-page .row.pt-main-content > .col-md-3.left-nav',
  sidebarFallback: '#climb-area-page .left-nav',
  mapLinksExact:
    '#climb-area-page .row.pt-main-content > .col-md-3.left-nav .mp-sidebar a[href]',
  mapLinksFallback: '#climb-area-page .left-nav a[href*="/map/"]',
  mainContentExact: '#climb-area-page .row.pt-main-content > .col-md-9.main-content',
  mainContentFallback: '#climb-area-page .main-content',
  photoCarouselRelative: '#photo-carousel',
  photoCarousel: '#climb-area-page #photo-carousel',
  photoContainerClasses: ['float-xs-right', 'ml-1'],
  sectionHeadings: '#climb-area-page h2',
  routeTables: 'table.route-table',
  routeTypeChart: '#route-chart',
  difficultyChart: '#rating-chart',
  screenReaderHeader: 'tr.screen-reader-only',
  routeRowClass: 'route-row',
  textSectionClass: 'text-section',
  legacyTextSectionGroup: '.list-group.mt-2',
  legacyTextSectionHeading: '.list-group-item-heading',
  legacyTextSectionBody: '.list-group-item-text',
  legacyTextSectionExpander: '.expander',
  responsiveTableClass: 'table-responsive',
  sidebarRow: '.lef-nav-row',
  warmText: '.text-warm',
  constrainedNarrativeWrapper: [
    '.max-height',
    '.max-height-xs-600',
    '.max-height-md-600',
    '.max-height-processed',
  ].join(''),
  constrainedNarrativeClasses: [
    'max-height',
    'max-height-xs-600',
    'max-height-md-600',
    'max-height-processed',
  ],
} as const;

export const AREA_PAGE_CONTRACT = {
  component: 'area-page',
  key: 'page-root',
  required: true,
  candidates: [
    { key: 'area-page-id', selector: AREA_SELECTORS.page },
  ],
} as const satisfies SelectorContract;

export const AREA_SIDEBAR_CONTRACT = {
  component: 'south-korea-map',
  key: 'area-sidebar',
  required: true,
  candidates: [
    { key: 'bootstrap-v4', selector: AREA_SELECTORS.sidebarExact },
    { key: 'semantic-left-nav', selector: AREA_SELECTORS.sidebarFallback },
  ],
} as const satisfies SelectorContract;

export const AREA_MAIN_CONTENT_CONTRACT = {
  component: 'south-korea-map',
  key: 'main-content',
  required: true,
  candidates: [
    { key: 'bootstrap-v4', selector: AREA_SELECTORS.mainContentExact },
    { key: 'semantic-main-content', selector: AREA_SELECTORS.mainContentFallback },
  ],
} as const satisfies SelectorContract;

export const AREA_MAP_LINK_CONTRACT = {
  component: 'south-korea-map',
  key: 'map-link',
  required: false,
  candidates: [
    { key: 'bootstrap-v4-preview', selector: AREA_SELECTORS.mapLinksExact },
    { key: 'semantic-map-link', selector: AREA_SELECTORS.mapLinksFallback },
  ],
} as const satisfies SelectorContract;
