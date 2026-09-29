import type { SelectorContract } from '../schema';
import { SHARED_SELECTORS } from './shared';

export const STATS_SELECTORS = {
  root: '#route-stats',
  tableRoot: '#route-stats .onx-stats-table',
  tableRootFallback: '.onx-stats-table',
  componentHeadings: '.onx-stats-table h3',
  ticksSectionId: '#ticks-column',
  ticksBodyId: 'tbody[id="ticks-body"]',
  tickRowLandmark: 'tr[id^="ticks."]',
  tickRows: '#route-stats .onx-stats-table tr[id^="ticks."]',
  tickAuthor: 'td:first-child [rel="author"], td:first-child .author, td:first-child a[href*="/user/"]',
  frameBreadcrumb:
    '.main-content-container #route-stats > .row.pt-main-content > .col-xs-12 > .mb-half.small.text-warm',
  frameTitle:
    '.main-content-container #route-stats > .row.pt-main-content > .col-xs-12 > h1',
  frameMainContainer: '.main-content-container',
  frameContainerFluid: '.main-content-container > .container-fluid',
  frameLayoutRow: '.main-content-container #route-stats > .row.pt-main-content',
  maxHeightClass: 'max-height',
} as const;

export const STATS_FRAME_CHROME_HIDE_SELECTORS = [
  SHARED_SELECTORS.framePrintHeader,
  SHARED_SELECTORS.frameHeader,
  SHARED_SELECTORS.frameAdvertisement,
  SHARED_SELECTORS.frameCookieConsent,
  SHARED_SELECTORS.frameFooter,
  STATS_SELECTORS.frameBreadcrumb,
  STATS_SELECTORS.frameTitle,
] as const;

export const STATS_FRAME_CONTRACT = {
  component: 'route-stats-frame',
  key: 'frame-landmarks',
  required: true,
  candidates: [
    { key: 'stats-root', selector: STATS_SELECTORS.root },
    { key: 'stats-table-root', selector: STATS_SELECTORS.tableRootFallback },
  ],
} as const satisfies SelectorContract;

export const STATS_TICKS_SECTION_CONTRACT = {
  component: 'route-stats-presentation',
  key: 'ticks-section',
  required: false,
  candidates: [
    { key: 'section-id', selector: STATS_SELECTORS.ticksSectionId },
    { key: 'tbody-id', selector: STATS_SELECTORS.ticksBodyId },
    { key: 'tick-row-id', selector: STATS_SELECTORS.tickRowLandmark },
  ],
} as const satisfies SelectorContract;
