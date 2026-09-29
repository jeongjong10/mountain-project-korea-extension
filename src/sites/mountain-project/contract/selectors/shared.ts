import type { SelectorContract } from '../schema';

export const SHARED_SELECTORS = {
  areaLinks: 'a[href*="/area/"]',
  routeLinks: 'a[href*="/route/"]',
  explicitBreadcrumb: [
    '.breadcrumbs',
    '.breadcrumb',
    '[aria-label="breadcrumb"]',
    '[aria-label="Breadcrumb"]',
  ].join(', '),
  routeGuideLink: 'a[href$="/route-guide"]',
  leftNavigation: '.left-nav',
  sidebarContent: '.mp-sidebar',
  areaPage: '#climb-area-page',
  routePage: '#route-page',
  mainContentContainer: '.main-content-container',
  mainContent: '.main-content',
  authoredContent: '.fr-view',
  commentBody: '.comment-body',
  commentContainer: '.main-comment, [id^="Comment-"], .comment-item, tr',
  commentAuthor: [
    '.comment-author',
    '.author',
    '[rel="author"]',
    '.user a[href*="/user/"]',
    'a[href*="/user/"]',
  ].join(', '),
  descriptionDetailsClass: '.description-details',
  descriptionDetails: 'table.description-details',
  titleWithBorderBottomClass: 'title-with-border-bottom',
  directUiText: [
    '.mp-sidebar .small.text-warm',
    '.comments .form-char-count',
    '.text-section > div',
    '#sort-dropdown > strong',
    '#sort-dropdown > .current-sort',
    '.dropdown-menu.dropdown-menu-right .dropdown-item.comments-sort',
  ].join(', '),
  frameHeader: '#header-container',
  framePrintHeader: '#header-container-print',
  frameFooter: '#footer-container',
  frameAdvertisement: '#div-gpt-ad-1614709329076-0',
  frameCookieConsent: '#cookie-consent',
  navigationAction: [
    'a[href]',
    'button[data-href]',
    'button[data-url]',
    'button[onclick]',
    'input[data-href]',
    'input[data-url]',
    'input[onclick]',
    '[role="button"][data-href]',
    '[role="button"][data-url]',
    '[role="button"][onclick]',
  ].join(','),
} as const;

export const BOOTSTRAP_COLUMN_CLASS_PREFIX = 'col-';

export const SIDEBAR_PAGE_PATH_PREFIXES = {
  area: '/area/',
  route: '/route/',
} as const;

export const LOCATION_TRAIL_CONTRACT = {
  component: 'location-trail',
  key: 'breadcrumb',
  required: false,
  candidates: [
    { key: 'explicit', selector: SHARED_SELECTORS.explicitBreadcrumb },
    { key: 'legacy-route-guide', selector: SHARED_SELECTORS.routeGuideLink },
  ],
} as const satisfies SelectorContract;
