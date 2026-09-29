import { TranslationNotice } from '../ui/translation-notice';
import { RegionDirectory } from '../ui/region-directory';
import { TranslationLedger } from '../core/translation-record';
import { DirectPageLocalizer } from '../localization/direct-page-localizer';
import { PageTranslationController } from '../localization/page-translation-controller';
import { ProperNameLocalizer } from '../localization/proper-name-localizer';
import { AreaPagePresentation } from '../ui/area-page-presentation';
import { AreaRoutePageFinish } from '../ui/area-route-page-finish';
import {
  AreaPageSectionPresentation,
  RoutePageSectionPresentation,
} from '../ui/area-page-section-presentation';
import { LeftSidebarToggle } from '../ui/left-sidebar-toggle';
import { RouteStatsEmbedLayout } from '../ui/route-stats-embed/layout';
import { RouteStatsPresentation } from '../ui/route-stats-presentation';
import { RouteListPresentation } from '../ui/route-list-presentation';
import { SouthKoreaAreaList } from '../ui/south-korea-area-list';
import { SouthKoreaClassicRouteGrouping } from '../ui/south-korea-classic-route-grouping';
import { AreaMapEmbed } from '../ui/area-map-embed';
import { SouthKoreaGateway } from '../ui/south-korea-gateway';
import { createContractDiagnosticReporter } from '../sites/mountain-project/contract/diagnostics';
import { isSouthKoreaAreaPath } from '../sites/mountain-project/contract/regions/south-korea';
import { locateAreaPage } from '../sites/mountain-project/dom/area-page';
import { resolveMountainProjectPageCapabilities } from '../sites/mountain-project/dom/page-capabilities';

import type { TranslationProvider } from '../core/translation-provider';
import type { PageLifecycle } from './ports';
import { MountainProjectPageAdapter } from '../sites/mountain-project/dom/page-adapter';
import { OriginalPreservingRenderer } from '../rendering/original-preserving-renderer';
import { MountainProjectTranslationPolicy } from '../sites/mountain-project/translation/mountain-project-translation-policy';

/** One instance per injected frame, using that frame's standard DOM globals. */
export function createMountainProjectApplication(provider: TranslationProvider): PageLifecycle {
  const currentUrl = new URL(window.location.href);
  const capabilities = resolveMountainProjectPageCapabilities(currentUrl, document);
  const pageKind = capabilities.pageKind;
  const isSouthKoreaAreaIndex = isSouthKoreaAreaPath(
    currentUrl.pathname,
  );
  const root = document.documentElement;
  const ledger = new TranslationLedger();
  const notice = new TranslationNotice(() => controller.retry());
  const controller = new PageTranslationController(
    provider,
    ledger,
    new MountainProjectPageAdapter(),
    new OriginalPreservingRenderer(),
    {
      pageKind,
      textPolicy: new MountainProjectTranslationPolicy(),
      onNoticeChange: (state) => notice.render(state),
    },
  );
  const localizer = new DirectPageLocalizer((record) => {
    controller.registerExternal(record);
  });
  const properNames = new ProperNameLocalizer((record) => {
    controller.registerExternal(record);
  });
  const gateway = new SouthKoreaGateway();
  const areaPresentation = new AreaPagePresentation();
  const areaSections = new AreaPageSectionPresentation();
  const routeSections = new RoutePageSectionPresentation();
  const pageFinish = new AreaRoutePageFinish();
  const sidebarToggle = new LeftSidebarToggle();
  const areaList = new SouthKoreaAreaList();
  const koreaRouteGrouping = new SouthKoreaClassicRouteGrouping();
  const reportContractDiagnostic = createContractDiagnosticReporter();
  const areaMap = new AreaMapEmbed(reportContractDiagnostic);
  const routeStats = new RouteStatsEmbedLayout(reportContractDiagnostic);
  const routeStatsPresentation = new RouteStatsPresentation();
  const routeLists = new RouteListPresentation();
  const directory = new RegionDirectory();
  let enabled = false;

  root.dataset.mpKoreaPageKind = pageKind;

  const disable = () => {
    enabled = false;
    directory.destroy();
    gateway.destroy();
    sidebarToggle.destroy();
    areaPresentation.destroy();
    areaSections.destroy();
    routeSections.destroy();
    pageFinish.destroy();
    areaList.destroy();
    koreaRouteGrouping.destroy();
    areaMap.destroy();
    routeStats.destroy();
    routeStatsPresentation.destroy();
    routeLists.destroy();
    controller.destroy();
    localizer.restore();
    properNames.restore();
    ledger.clear();
    root.dataset.mpKoreaExtension = 'disabled';
    root.dataset.mpKoreaCore = pageKind === 'unsupported' ? 'unsupported' : 'inactive';
    delete root.dataset.mpKoreaRenderer;
  };

  const enable = () => {
    if (enabled) {
      return;
    }
    enabled = true;
    root.dataset.mpKoreaExtension = 'enabled';
    sidebarToggle.mount();

    if (pageKind === 'unsupported') {
      root.dataset.mpKoreaCore = 'unsupported';
      return;
    }

    if (pageKind === 'main') {
      gateway.mount();
    }

    const areaPage = pageKind === 'area'
      ? locateAreaPage(document, currentUrl)
      : undefined;
    const hasGenericArea = areaPage?.ok === true;
    if (areaPage && !areaPage.ok) {
      reportContractDiagnostic(areaPage.diagnostic);
    }

    const isSouthKorea = capabilities.southKoreaEnhancements;
    const hasAuthoredTranslation = capabilities.authoredTranslation
      || pageKind === 'route-stats';
    if (hasAuthoredTranslation) {
      void controller.start();
    }
    if (hasGenericArea) {
      areaPresentation.mount(document);
      areaSections.mount(document);
    }
    if (isSouthKorea) {
      properNames.apply();
      if (hasGenericArea) {
        koreaRouteGrouping.mount(document, currentUrl);
      }
      if (isSouthKoreaAreaIndex) {
        areaList.mount();
      }
    }
    if (capabilities.routeSectionPresentation) {
      routeSections.mount(document);
    }
    if (capabilities.areaMap && hasGenericArea) {
      areaMap.mount(document, currentUrl);
    }
    if (pageKind === 'route') {
      routeStats.mount();
    }
    if (pageKind === 'route-stats') {
      routeStatsPresentation.mount();
    }
    localizer.apply();
    routeLists.mount();
    if (hasGenericArea || pageKind === 'route') {
      pageFinish.mount();
    }
    directory.mount();

    // Map and stats are optional enhancements. Their contract failures are
    // reported once, but do not make the translation core unready.
    root.dataset.mpKoreaCore = 'ready';
    root.dataset.mpKoreaRenderer = hasAuthoredTranslation
      ? 'original-preserving-translation'
      : 'direct-translation';
  };
  return {
    enable,
    disable,
    destroy() {
      disable();
      delete root.dataset.mpKoreaExtension;
      delete root.dataset.mpKoreaPageKind;
      delete root.dataset.mpKoreaCore;
      delete root.dataset.mpKoreaRenderer;
    },
  };
}
