import type { SelectorContract } from '../schema';
import { SHARED_SELECTORS } from './shared';

export const MAP_SELECTORS = {
  root: '#map-and-ride-finder-container',
  canvas: '#map-and-ride-finder-container #ap-map-container',
  detailsContext: '#details-popup, #details-window, .ap-map-popup',
  sunControls: '#sun-controls',
  fixedAccessNotice: '#access-gate',
  frameTitle: '.main-content-container .row.pt-main-content > .col-xs-12 > h1',
  frameBreadcrumb:
    '.main-content-container .row.pt-main-content > .col-xs-12 > h1 + .text-warm',
  frameFraming:
    '.main-content-container .row.pt-main-content > .col-xs-12 > h1 + .text-warm + .mt-2',
  frameMainContainer: '.main-content-container',
  frameContainerFluid: '.main-content-container > .container-fluid',
} as const;

export const MAP_FRAME_CHROME_HIDE_SELECTORS = [
  SHARED_SELECTORS.framePrintHeader,
  SHARED_SELECTORS.frameHeader,
  SHARED_SELECTORS.frameAdvertisement,
  MAP_SELECTORS.frameTitle,
  MAP_SELECTORS.frameBreadcrumb,
  MAP_SELECTORS.frameFraming,
  SHARED_SELECTORS.frameFooter,
] as const;

export const MAP_FRAME_CONTRACT = {
  component: 'south-korea-map-frame',
  key: 'frame-landmarks',
  required: true,
  candidates: [
    { key: 'map-container', selector: MAP_SELECTORS.canvas },
    { key: 'map-root', selector: MAP_SELECTORS.root },
  ],
} as const satisfies SelectorContract;
