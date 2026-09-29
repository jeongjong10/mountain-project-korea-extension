import { detectPage } from '../contract/routes';
import {
  AREA_PAGE_CONTRACT,
  AREA_SELECTORS,
} from '../contract/selectors/area';
import type { LocatorResult } from '../contract/schema';
import { locateFirst, locatorFailure } from './locator';

export interface AreaPageLandmarks {
  readonly page: HTMLElement;
  readonly title: HTMLHeadingElement;
}

export function locateAreaPage(
  root: ParentNode,
  currentUrl: URL,
): LocatorResult<AreaPageLandmarks> {
  if (detectPage(currentUrl) !== 'area') {
    return locatorFailure(
      AREA_PAGE_CONTRACT.component,
      'area-route',
      'The current Mountain Project URL is not an Area route.',
      [],
      currentUrl.href,
    );
  }

  const pageResult = locateFirst<HTMLElement>(
    root,
    AREA_PAGE_CONTRACT,
    (page) => Boolean(
      page.querySelector(AREA_SELECTORS.pageTitle)
      && page.querySelector(AREA_SELECTORS.semanticLandmarks),
    ),
    currentUrl.href,
  );
  if (!pageResult.ok) {
    return pageResult;
  }

  const title = pageResult.value.querySelector<HTMLHeadingElement>(
    AREA_SELECTORS.pageTitle,
  );
  if (!title) {
    return locatorFailure(
      AREA_PAGE_CONTRACT.component,
      'page-title',
      'The Area page title landmark is missing.',
      pageResult.metadata.attempts,
      currentUrl.href,
    );
  }

  return {
    ok: true,
    value: { page: pageResult.value, title },
    metadata: pageResult.metadata,
  };
}
