import { AREA_SELECTORS } from '../sites/mountain-project/contract/selectors/area';
import { ROUTE_SELECTORS } from '../sites/mountain-project/contract/selectors/route';
import { UI } from './design-tokens';

const PAGE = `:is(${AREA_SELECTORS.page}, ${ROUTE_SELECTORS.page})`;
const CHARTS = [
  [AREA_SELECTORS.routeTypeChart, '루트 유형 통계'],
  [AREA_SELECTORS.difficultyChart, '난이도별 통계'],
] as const;
const STYLE_TEXT = `
/* Native charts retain the pixel width used when Google Charts drew them.
   Keep all chart data reachable after a resize or sidebar layout change. */
${AREA_SELECTORS.page} .mpkr-area-chart-scroll {
  max-width: 100%;
  overflow-x: auto;
  /* Native inline SVG baselines and offscreen accessibility tables extend
     slightly below the plot. Reserve room instead of clipping that content. */
  padding-bottom: ${UI.space.sm};
}

${AREA_SELECTORS.page} .mpkr-area-chart-scroll:focus-visible {
  outline: 2px solid ${UI.color.link};
  outline-offset: 2px;
}

${PAGE} h1 {
  line-height: 1.4;
  overflow-wrap: anywhere;
}

${PAGE} .mpkr-info-heading {
  /* Native mt-2/mb-1 utilities use !important. Keep these overrides scoped. */
  margin-top: ${UI.space.xl} !important;
  margin-bottom: ${UI.space.md} !important;
  padding-bottom: 0.625rem;
  border-bottom: 1px solid ${UI.color.border};
  line-height: ${UI.font.uiLineHeight};
  overflow-wrap: anywhere;
}

${PAGE} .mpkr-area-section-hint {
  font-size: ${UI.font.caption};
}

${PAGE} .mpkr-area-section-heading {
  padding-right: 8rem;
}

${PAGE} .mpkr-area-section-body .fr-view {
  line-height: ${UI.font.bodyLineHeight};
  overflow-wrap: anywhere;
}

${PAGE} .mpkr-area-section-body .fr-view p {
  margin-top: 0;
  margin-bottom: ${UI.space.md};
}

${PAGE} tr.mpkr-route-list-row {
  height: 2.75rem;
}

${PAGE} tr.mpkr-route-list-row > td {
  vertical-align: middle;
  padding-top: 0.625rem;
  padding-bottom: 0.625rem;
  border-bottom: 1px solid ${UI.color.border};
}

${PAGE} .mpkr-route-list-primary,
${PAGE} .mpkr-route-list-primary .text-truncate {
  overflow-wrap: anywhere;
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
}

${PAGE} .mpkr-route-list-primary-expanded {
  /* The table row owns the height so short names align with adjacent grades. */
  min-height: 0;
}

/* Grade systems keep their native columns and visibility toggles. */
${PAGE} .mpkr-route-list-row :is(.rateYDS, .rateFrench, .rateBritish) {
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 575px) {
  ${PAGE} .mpkr-area-section-heading {
    padding-right: 1.6rem;
  }
}
`;

/** Reversible spacing and chart overflow over the native Area/Route structure. */
export class AreaRoutePageFinish {
  private style: HTMLStyleElement | undefined;
  private readonly chartWrappers = new Map<HTMLElement, HTMLDivElement>();

  mount(ownerDocument: Document = document): void {
    if (this.style?.isConnected || !ownerDocument.querySelector(PAGE)) return;
    this.style = ownerDocument.createElement('style');
    this.style.setAttribute('data-mpkr-area-route-finish', 'true');
    this.style.textContent = STYLE_TEXT;
    ownerDocument.head.append(this.style);
    for (const [selector, label] of CHARTS) {
      const chart = ownerDocument.querySelector<HTMLElement>(`${AREA_SELECTORS.page} ${selector}`);
      if (!chart) continue;
      // A separate auto-height scroller leaves the native chart's height intact;
      // a horizontal scrollbar on its fixed-height root would cut into the plot.
      const wrapper = ownerDocument.createElement('div');
      wrapper.className = 'mpkr-area-chart-scroll';
      wrapper.tabIndex = 0;
      wrapper.setAttribute('role', 'region');
      wrapper.setAttribute('aria-label', label);
      chart.before(wrapper);
      wrapper.append(chart);
      this.chartWrappers.set(chart, wrapper);
    }
  }

  destroy(): void {
    for (const [chart, wrapper] of this.chartWrappers) {
      if (chart.parentElement === wrapper) wrapper.replaceWith(chart);
      else wrapper.remove();
    }
    this.chartWrappers.clear();
    this.style?.remove();
    this.style = undefined;
  }
}
