import { detectPage } from '../core/page-detector';
import { TranslationLedger } from '../core/translation-record';
import { DirectPageLocalizer } from '../localization/direct-page-localizer';
import { PageTranslationController } from '../localization/page-translation-controller';
import { ProperNameLocalizer } from '../localization/proper-name-localizer';
import { ChromeTranslationProvider } from '../platforms/chrome/chrome-translation-provider';
import { WebExtensionSettingsRepository } from '../platforms/webextension/settings-repository';
import { AreaPagePresentation } from '../ui/area-page-presentation';
import { LeftSidebarToggle } from '../ui/left-sidebar-toggle';
import { RouteStatsEmbedLayout } from '../ui/route-stats-embed/layout';
import { RouteStatsPresentation } from '../ui/route-stats-presentation';
import { RouteListPresentation } from '../ui/route-list-presentation';
import { SouthKoreaAreaList } from '../ui/south-korea-area-list';
import { SouthKoreaAreaPriority } from '../ui/south-korea-area-priority';
import { SouthKoreaMapEmbed } from '../ui/south-korea-map-embed';
import { SouthKoreaGateway } from '../ui/south-korea-gateway';

export default defineContentScript({
  matches: [
    'https://mountainproject.com/*',
    'https://www.mountainproject.com/*',
  ],
  allFrames: true,
  runAt: 'document_idle',
  async main(ctx) {
    const settings = new WebExtensionSettingsRepository();
    const pageKind = detectPage(new URL(window.location.href));
    const isSouthKoreaAreaIndex = new URL(window.location.href).pathname.replace(/\/+$/, '')
      === '/area/106225629/south-korea';
    const root = document.documentElement;
    const ledger = new TranslationLedger();
    const controller = new PageTranslationController(
      new ChromeTranslationProvider(),
      ledger,
    );
    const localizer = new DirectPageLocalizer((record) => {
      controller.registerExternal(record);
    });
    const properNames = new ProperNameLocalizer((record) => {
      controller.registerExternal(record);
    });
    const gateway = new SouthKoreaGateway();
    const areaPresentation = new AreaPagePresentation();
    const sidebarToggle = new LeftSidebarToggle();
    const areaList = new SouthKoreaAreaList();
    const areaPriority = new SouthKoreaAreaPriority();
    const areaMap = new SouthKoreaMapEmbed();
    const routeStats = new RouteStatsEmbedLayout();
    const routeStatsPresentation = new RouteStatsPresentation();
    const routeLists = new RouteListPresentation();
    let enabled = false;

    root.dataset.mpKoreaPageKind = pageKind;

    const disable = () => {
      enabled = false;
      gateway.destroy();
      sidebarToggle.destroy();
      areaPresentation.destroy();
      areaList.destroy();
      areaPriority.destroy();
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

      const isSouthKorea = controller.isSouthKoreaPage(new URL(window.location.href));
      const hasAuthoredTranslation = isSouthKorea || pageKind === 'route-stats';
      if (hasAuthoredTranslation) {
        void controller.start();
      }
      if (isSouthKorea) {
        properNames.apply();
        if (pageKind === 'area') {
          areaPresentation.mount();
        }
        if (pageKind === 'area' || pageKind === 'route') {
          areaPriority.mount();
        }
        if (isSouthKoreaAreaIndex) {
          areaList.mount();
        }
      }
      if (pageKind === 'area') {
        areaMap.mount(document, new URL(window.location.href));
      }
      if (pageKind === 'route') {
        routeStats.mount();
      }
      if (pageKind === 'route-stats') {
        routeStatsPresentation.mount();
      }
      localizer.apply();
      routeLists.mount();

      root.dataset.mpKoreaCore = 'ready';
      root.dataset.mpKoreaRenderer = hasAuthoredTranslation
        ? 'original-preserving-translation'
        : 'direct-translation';
    };

    const applyEnabledState = (nextEnabled: boolean) => {
      if (!nextEnabled) {
        disable();
      } else {
        enable();
      }
    };

    const initial = await settings.get();
    applyEnabledState(initial.enabled);
    const unwatch = settings.watch((next) => applyEnabledState(next.enabled));

    ctx.onInvalidated(() => {
      unwatch();
      disable();
      delete root.dataset.mpKoreaExtension;
      delete root.dataset.mpKoreaPageKind;
      delete root.dataset.mpKoreaCore;
      delete root.dataset.mpKoreaRenderer;
    });
  },
});
