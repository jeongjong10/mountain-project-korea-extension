import type { SelectorContract } from '../schema';

export const MAIN_SELECTORS = {
  gatewayHeadings: 'h1, h2',
  gatewayHost: '.text-center.pb-2.border-light',
} as const;

export const MAIN_GATEWAY_HOST_CONTRACT = {
  component: 'south-korea-gateway',
  key: 'gateway-host',
  required: true,
  candidates: [
    { key: 'guidebook-panel', selector: MAIN_SELECTORS.gatewayHost },
  ],
} as const satisfies SelectorContract;
