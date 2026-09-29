import { UI } from '../design-tokens';
import type { ContractDiagnosticSink } from '../../sites/mountain-project/contract/diagnostics';
import {
  isStatsInformationPath,
  parseRoutePath,
} from '../../sites/mountain-project/contract/routes';
import { ROUTE_SELECTORS } from '../../sites/mountain-project/contract/selectors/route';
import { SHARED_SELECTORS } from '../../sites/mountain-project/contract/selectors/shared';
import {
  STATS_FRAME_CHROME_HIDE_SELECTORS,
  STATS_SELECTORS,
} from '../../sites/mountain-project/contract/selectors/stats';
import type { ContractDiagnostic } from '../../sites/mountain-project/contract/schema';
import {
  isCurrentStatsPath,
  locateRouteStatsLayout,
  locateStatsFrameLandmarks,
  type RouteStatsLayout,
} from '../../sites/mountain-project/dom/route-stats-layout';
import { RouteStatsPresentation } from '../route-stats-presentation';
import { connectEmbeddedFormNavigation } from '../embedded-form-navigation';
import { connectEmbeddedScrollBoundary } from '../embedded-scroll-boundary';

const SECTION_CLASS = 'mpkr-route-stats';
const LOAD_TIMEOUT_MS = 15_000;

const LAYOUT_MARKER = 'data-mpkr-route-overview';
const SUMMARY_MARKER = 'data-mpkr-route-summary';
const YOU_MARKER = 'data-mpkr-you-and-route';
const AUXILIARY_MARKER = 'data-mpkr-route-auxiliary';
const FRAME_MARKER = 'data-mpkr-route-stats-frame';

const STYLE_TEXT = `
${ROUTE_SELECTORS.page} [${LAYOUT_MARKER}='true'] {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(18rem, 1fr);
  align-items: start;
  gap: ${UI.space.lg};
  flex: 0 0 100%;
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

${ROUTE_SELECTORS.page} [${SUMMARY_MARKER}='true'],
${ROUTE_SELECTORS.page} [${YOU_MARKER}='true'] {
  min-width: 0;
  max-width: 100%;
  margin-top: 0 !important;
  overflow: visible;
  white-space: normal;
}

${ROUTE_SELECTORS.page} [${SUMMARY_MARKER}='true'] ${SHARED_SELECTORS.descriptionDetailsClass} {
  width: 100%;
}

${ROUTE_SELECTORS.page} [${YOU_MARKER}='true'] {
  display: block !important;
  width: 100%;
  padding-top: 0 !important;
}

${ROUTE_SELECTORS.page} [${SUMMARY_MARKER}='true'] > .mpkr-info-heading,
${ROUTE_SELECTORS.page} [${YOU_MARKER}='true'] > .title-with-border-bottom:first-child,
${ROUTE_SELECTORS.page} .${SECTION_CLASS}__heading-wrap {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  min-height: 2.5rem;
}

${ROUTE_SELECTORS.page} [${SUMMARY_MARKER}='true'] > .mpkr-info-heading,
${ROUTE_SELECTORS.page} [${YOU_MARKER}='true'] > .title-with-border-bottom:first-child {
  margin-top: 0 !important;
}

${ROUTE_SELECTORS.page} [${SUMMARY_MARKER}='true'] > .mpkr-info-heading > h2,
${ROUTE_SELECTORS.page} [${YOU_MARKER}='true'] > .title-with-border-bottom:first-child > h2,
${ROUTE_SELECTORS.page} .${SECTION_CLASS}__heading {
  margin: 0;
  line-height: 1.35;
}

${ROUTE_SELECTORS.page} [${AUXILIARY_MARKER}='true'] {
  display: none !important;
}

${ROUTE_SELECTORS.page} .${SECTION_CLASS} {
  width: 100%;
  min-width: 0;
  margin: 1.25rem 0 1.5rem;
}

${ROUTE_SELECTORS.page} .${SECTION_CLASS}__heading-wrap {
  justify-content: space-between;
  gap: ${UI.space.md};
  margin-bottom: 0.65rem;
}

${ROUTE_SELECTORS.page} .${SECTION_CLASS}__heading {
  flex: 1 1 auto;
  min-width: 0;
}

${ROUTE_SELECTORS.page} .${SECTION_CLASS}__frame-wrap {
  width: 100%;
  min-width: 0;
  border: 1px solid ${UI.color.border};
  border-radius: ${UI.radius.control};
  background: ${UI.color.surface};
  overflow-x: auto;
  overflow-y: hidden;
}

${ROUTE_SELECTORS.page} .${SECTION_CLASS}__frame {
  display: block;
  width: 100%;
  min-height: 680px;
  border: 0;
  background: ${UI.color.surface};
}

${ROUTE_SELECTORS.page} .${SECTION_CLASS}__status {
  margin: 0 0 0.6rem;
  color: ${UI.color.muted};
  font-size: ${UI.font.small};
}

${ROUTE_SELECTORS.page} .${SECTION_CLASS}__status[hidden] {
  display: none !important;
}

${ROUTE_SELECTORS.page} .${SECTION_CLASS}__external {
  flex: 0 1 auto;
  margin-left: auto;
  text-align: right;
  font-weight: 700;
}

@media (max-width: 767px) {
  ${ROUTE_SELECTORS.page} [${LAYOUT_MARKER}='true'] {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.85rem;
  }

  ${ROUTE_SELECTORS.page} [${SUMMARY_MARKER}='true'] ${SHARED_SELECTORS.descriptionDetailsClass} td {
    white-space: normal !important;
    overflow-wrap: anywhere;
  }

  ${ROUTE_SELECTORS.page} .${SECTION_CLASS}__frame {
    min-height: 620px;
  }

  ${ROUTE_SELECTORS.page} .${SECTION_CLASS}__heading-wrap {
    align-items: baseline;
    flex-wrap: wrap;
  }

  ${ROUTE_SELECTORS.page} .${SECTION_CLASS}__external {
    margin-left: 0;
    text-align: left;
  }
}
`;

const FRAME_STYLE_TEXT = `
${STATS_FRAME_CHROME_HIDE_SELECTORS.join(',\n')} {
  display: none !important;
}

html,
body {
  min-height: 0 !important;
}

body,
${STATS_SELECTORS.frameMainContainer} {
  margin-top: 0 !important;
  padding-top: 0 !important;
}

${STATS_SELECTORS.frameContainerFluid} {
  width: 100% !important;
  max-width: none !important;
  padding: 0.75rem !important;
}

${STATS_SELECTORS.frameLayoutRow} {
  padding-top: 0 !important;
}

${STATS_SELECTORS.root},
${STATS_SELECTORS.tableRoot} {
  width: 100% !important;
  max-width: none !important;
  min-width: 0 !important;
}
`;

interface AttributeSnapshot {
  readonly element: Element;
  readonly name: string;
  readonly value: string | null;
}

interface AnchorSnapshot {
  readonly target: string | null;
  readonly rel: string | null;
}

function resolveUrl(value: string | null, baseUrl: string): URL | undefined {
  if (!value || value.startsWith('#') || /^javascript:/i.test(value)) {
    return undefined;
  }
  try {
    return new URL(value, baseUrl);
  } catch {
    return undefined;
  }
}

function inlineNavigationValue(element: Element): string | null {
  const dataValue = element.getAttribute('data-href') ?? element.getAttribute('data-url');
  if (dataValue) {
    return dataValue;
  }

  const onclick = element.getAttribute('onclick');
  if (!onclick) {
    return null;
  }
  const assignment = onclick.match(
    /(?:window\.)?location(?:\.href)?\s*=\s*(['"])(.*?)\1/i,
  );
  if (assignment?.[2]) {
    return assignment[2];
  }
  const call = onclick.match(
    /(?:window\.)?location\.(?:assign|replace)\(\s*(['"])(.*?)\1\s*\)/i,
  );
  return call?.[2] ?? null;
}

export class RouteStatsEmbedLayout {
  private root: ParentNode | undefined;
  private currentUrl: URL | undefined;
  private pendingObserver: MutationObserver | undefined;
  private layout: RouteStatsLayout | undefined;
  private section: HTMLElement | undefined;
  private style: HTMLStyleElement | undefined;
  private frameWrap: HTMLElement | undefined;
  private iframe: HTMLIFrameElement | undefined;
  private status: HTMLElement | undefined;
  private loadTimer: ReturnType<typeof setTimeout> | undefined;
  private readonly layoutAttributeSnapshots: AttributeSnapshot[] = [];

  private frameDocument: Document | undefined;
  private disconnectFormNavigation: (() => void) | undefined;
  private disconnectScrollBoundary: (() => void) | undefined;
  private frameStatsPresentation: RouteStatsPresentation | undefined;
  private frameChromeStyle: HTMLStyleElement | undefined;
  private frameMarkerSnapshot: string | null | undefined;
  private frameMutationObserver: MutationObserver | undefined;
  private frameResizeObserver: ResizeObserver | undefined;
  private frameResizeTimer: ReturnType<typeof setTimeout> | undefined;
  private readonly navigationSnapshots = new Map<HTMLAnchorElement, AnchorSnapshot>();
  private contractDiagnostic: ContractDiagnostic | undefined;

  constructor(private readonly reportDiagnostic?: ContractDiagnosticSink) {}

  get lastDiagnostic(): ContractDiagnostic | undefined {
    return this.contractDiagnostic;
  }

  private readonly handleFrameLoad = (): void => {
    if (!this.iframe || !this.layout) {
      return;
    }
    this.disconnectFrameDocument();

    let frameDocument: Document | null = null;
    let loadedUrl: URL | undefined;
    try {
      frameDocument = this.iframe.contentDocument;
      const href = this.iframe.contentWindow?.location.href;
      if (href) {
        loadedUrl = new URL(href);
      }
    } catch {
      frameDocument = null;
    }

    this.clearLoadTimer();
    this.frameWrap?.removeAttribute('aria-busy');
    if (!frameDocument || !loadedUrl) {
      this.setStatus('loaded-limited', '');
      return;
    }
    if (!isCurrentStatsPath(loadedUrl, this.layout.statsUrl)) {
      this.markLoadFailed();
      return;
    }

    this.connectFrameDocument(frameDocument);
    this.setStatus('loaded', '');
  };

  private readonly handleFrameError = (): void => {
    this.markLoadFailed();
  };

  private readonly handleFrameClickCapture = (event: Event): void => {
    const target = event.target as { closest?: (selector: string) => Element | null } | null;
    const action = target?.closest?.(SHARED_SELECTORS.navigationAction);
    if (!action || action.tagName === 'A') {
      if (action?.tagName === 'A') {
        this.processNavigationAnchor(action);
      }
      return;
    }

    const url = resolveUrl(
      inlineNavigationValue(action),
      action.ownerDocument.location.href,
    );
    if (url && this.shouldOpenInNewTab(url)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      this.openInProtectedTab(url);
    }
  };

  mount(
    root: ParentNode = document,
    currentUrl: URL = new URL(window.location.href),
  ): boolean {
    if (this.section?.isConnected && this.style?.isConnected) {
      return true;
    }
    if (!parseRoutePath(currentUrl.pathname)) {
      return false;
    }

    this.root = root;
    this.currentUrl = currentUrl;
    if (this.tryMount()) {
      return true;
    }
    this.observePendingLayout();
    return false;
  }

  destroy(): void {
    this.pendingObserver?.disconnect();
    this.pendingObserver = undefined;
    this.clearLoadTimer();
    this.disconnectFrameDocument();
    this.iframe?.removeEventListener('load', this.handleFrameLoad);
    this.iframe?.removeEventListener('error', this.handleFrameError);

    this.section?.remove();
    this.style?.remove();
    for (const snapshot of this.layoutAttributeSnapshots.reverse()) {
      if (snapshot.value === null) {
        snapshot.element.removeAttribute(snapshot.name);
      } else {
        snapshot.element.setAttribute(snapshot.name, snapshot.value);
      }
    }
    this.layoutAttributeSnapshots.length = 0;

    this.root = undefined;
    this.currentUrl = undefined;
    this.layout = undefined;
    this.section = undefined;
    this.style = undefined;
    this.frameWrap = undefined;
    this.iframe = undefined;
    this.status = undefined;
  }

  private tryMount(): boolean {
    if (!this.root || !this.currentUrl) {
      return false;
    }
    const located = locateRouteStatsLayout(this.root, this.currentUrl);
    if (!located.ok) {
      this.recordDiagnostic(located.diagnostic);
      return false;
    }
    const layout = located.value;
    const ownerDocument = layout.mainContent.ownerDocument;
    if (!ownerDocument.head) {
      this.recordDiagnostic({
        component: 'route-stats-embed',
        key: 'document-head',
        reason: 'Route document head is missing.',
        page: this.currentUrl.href,
      });
      return false;
    }
    this.contractDiagnostic = undefined;

    const style = ownerDocument.createElement('style');
    style.dataset.mpKoreaRouteStats = 'styles';
    style.textContent = STYLE_TEXT;

    this.mark(layout.overview, LAYOUT_MARKER);
    this.mark(layout.summary, SUMMARY_MARKER);
    this.mark(layout.youAndRoute, YOU_MARKER);
    const youHeadingCandidate = layout.youAndRoute.firstElementChild;
    const youHeading = youHeadingCandidate instanceof HTMLElement
      && youHeadingCandidate.classList.contains(SHARED_SELECTORS.titleWithBorderBottomClass)
      ? youHeadingCandidate
      : undefined;
    if (youHeading) {
      this.addClassesPreserving(youHeading, 'mb-1', 'mpkr-info-heading');
    }
    layout.auxiliaryRegions.forEach((region) => this.mark(region, AUXILIARY_MARKER));

    const section = ownerDocument.createElement('section');
    section.className = SECTION_CLASS;
    section.dataset.mpKoreaRouteStats = 'true';
    section.setAttribute('aria-labelledby', 'mpkr-route-stats-heading');

    const heading = ownerDocument.createElement('h2');
    heading.id = 'mpkr-route-stats-heading';
    heading.className = `${SECTION_CLASS}__heading`;
    heading.textContent = '루트 통계';

    const headingWrap = ownerDocument.createElement('div');
    headingWrap.className = `title-with-border-bottom mb-1 mpkr-info-heading ${SECTION_CLASS}__heading-wrap`;
    headingWrap.append(heading);

    const status = ownerDocument.createElement('p');
    status.className = `${SECTION_CLASS}__status`;
    status.dataset.state = 'loading';
    status.hidden = true;

    const frameWrap = ownerDocument.createElement('div');
    frameWrap.className = `${SECTION_CLASS}__frame-wrap`;
    frameWrap.setAttribute('aria-busy', 'true');

    const iframe = ownerDocument.createElement('iframe');
    iframe.className = `${SECTION_CLASS}__frame`;
    iframe.setAttribute('src', layout.statsHref);
    iframe.title = 'Mountain Project 루트 통계';
    iframe.loading = 'lazy';
    iframe.addEventListener('load', this.handleFrameLoad);
    iframe.addEventListener('error', this.handleFrameError);

    const external = ownerDocument.createElement('a');
    external.className = `${SECTION_CLASS}__external`;
    external.setAttribute('href', layout.statsHref);
    external.target = '_blank';
    external.rel = 'noopener noreferrer';
    external.textContent = 'Mountain Project 원본 통계 열기';
    external.addEventListener('click', (event) => event.stopPropagation());

    headingWrap.append(external);
    frameWrap.append(iframe);
    section.append(headingWrap, status, frameWrap);
    ownerDocument.head.append(style);
    layout.row.after(section);

    this.pendingObserver?.disconnect();
    this.pendingObserver = undefined;
    this.layout = layout;
    this.section = section;
    this.style = style;
    this.frameWrap = frameWrap;
    this.iframe = iframe;
    this.status = status;
    this.loadTimer = setTimeout(() => this.markLoadFailed(), LOAD_TIMEOUT_MS);
    return true;
  }

  private observePendingLayout(): void {
    if (this.pendingObserver || !this.root) {
      return;
    }
    const documentElement = this.root instanceof Document
      ? this.root.documentElement
      : this.root;
    const ownerDocument = this.root instanceof Document
      ? this.root
      : this.root.ownerDocument;
    if (!documentElement || !ownerDocument) {
      return;
    }
    const Observer = ownerDocument.defaultView?.MutationObserver ?? MutationObserver;
    this.pendingObserver = new Observer(() => {
      this.tryMount();
    });
    this.pendingObserver.observe(documentElement, { childList: true, subtree: true });
    queueMicrotask(() => {
      this.tryMount();
    });
  }

  private mark(element: Element, name: string): void {
    this.layoutAttributeSnapshots.push({
      element,
      name,
      value: element.getAttribute(name),
    });
    element.setAttribute(name, 'true');
  }

  private addClassesPreserving(element: Element, ...classNames: string[]): void {
    this.layoutAttributeSnapshots.push({
      element,
      name: 'class',
      value: element.getAttribute('class'),
    });
    element.classList.add(...classNames);
  }

  private connectFrameDocument(frameDocument: Document): void {
    this.frameDocument = frameDocument;
    this.applyFrameChromePresentation(frameDocument);
    const statsPresentation = new RouteStatsPresentation();
    if (statsPresentation.mount(frameDocument)) {
      this.frameStatsPresentation = statsPresentation;
    }
    frameDocument.addEventListener('click', this.handleFrameClickCapture, true);
    this.disconnectFormNavigation = connectEmbeddedFormNavigation(
      frameDocument,
      (url) => url.origin === this.layout?.statsUrl.origin
        && isStatsInformationPath(url.pathname)
        && this.shouldOpenInNewTab(url),
    );
    const parentWindow = this.iframe?.ownerDocument.defaultView;
    if (parentWindow) {
      this.disconnectScrollBoundary = connectEmbeddedScrollBoundary(
        frameDocument,
        parentWindow,
      );
    }
    this.processNavigationAnchors(frameDocument);

    const Observer = frameDocument.defaultView?.MutationObserver ?? MutationObserver;
    this.frameMutationObserver = new Observer((records) => {
      for (const record of records) {
        if (record.type === 'attributes' && record.target.nodeType === 1) {
          this.processNavigationAnchor(record.target as Element);
        }
        for (const node of record.addedNodes) {
          if (node.nodeType === 1) {
            this.processNavigationAnchors(node as Element);
          }
        }
      }
      this.scheduleFrameResize();
    });
    this.frameMutationObserver.observe(frameDocument.documentElement, {
      attributes: true,
      attributeFilter: ['href'],
      childList: true,
      subtree: true,
    });

    const stats = frameDocument.querySelector<HTMLElement>(STATS_SELECTORS.root);
    const ResizeObserverConstructor = frameDocument.defaultView?.ResizeObserver;
    if (stats && ResizeObserverConstructor) {
      this.frameResizeObserver = new ResizeObserverConstructor(() => {
        this.scheduleFrameResize();
      });
      this.frameResizeObserver.observe(stats);
    }
    this.scheduleFrameResize();
  }

  private disconnectFrameDocument(): void {
    this.frameStatsPresentation?.destroy();
    this.frameStatsPresentation = undefined;
    this.frameMutationObserver?.disconnect();
    this.frameMutationObserver = undefined;
    this.frameResizeObserver?.disconnect();
    this.frameResizeObserver = undefined;
    if (this.frameResizeTimer !== undefined) {
      clearTimeout(this.frameResizeTimer);
      this.frameResizeTimer = undefined;
    }
    if (this.frameDocument) {
      this.frameDocument.removeEventListener('click', this.handleFrameClickCapture, true);
    }
    this.disconnectFormNavigation?.();
    this.disconnectFormNavigation = undefined;
    this.disconnectScrollBoundary?.();
    this.disconnectScrollBoundary = undefined;
    for (const [anchor, snapshot] of this.navigationSnapshots) {
      this.restoreNavigationAnchor(anchor, snapshot);
    }
    this.navigationSnapshots.clear();
    this.restoreFrameChromePresentation();
    this.frameDocument = undefined;
  }

  private applyFrameChromePresentation(frameDocument: Document): void {
    const located = locateStatsFrameLandmarks(
      frameDocument,
      frameDocument.location?.href,
    );
    if (!located.ok) {
      this.recordDiagnostic(located.diagnostic);
      return;
    }
    const { documentElement, head } = located.value;

    const style = frameDocument.createElement('style');
    style.setAttribute(FRAME_MARKER, 'styles');
    style.textContent = FRAME_STYLE_TEXT;
    this.frameMarkerSnapshot = documentElement.getAttribute(FRAME_MARKER);
    documentElement.setAttribute(FRAME_MARKER, 'true');
    head.append(style);
    this.frameChromeStyle = style;
  }

  private restoreFrameChromePresentation(): void {
    this.frameChromeStyle?.remove();
    this.frameChromeStyle = undefined;
    const documentElement = this.frameDocument?.documentElement;
    if (documentElement && this.frameMarkerSnapshot !== undefined) {
      if (this.frameMarkerSnapshot === null) {
        documentElement.removeAttribute(FRAME_MARKER);
      } else {
        documentElement.setAttribute(FRAME_MARKER, this.frameMarkerSnapshot);
      }
    }
    this.frameMarkerSnapshot = undefined;
  }

  private processNavigationAnchors(root: ParentNode): void {
    if (root.nodeType === 1) {
      this.processNavigationAnchor(root as Element);
    }
    root.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((anchor) => {
      this.processNavigationAnchor(anchor);
    });
  }

  private processNavigationAnchor(element: Element): void {
    if (element.tagName !== 'A') {
      return;
    }
    const anchor = element as HTMLAnchorElement;
    const url = resolveUrl(anchor.getAttribute('href'), anchor.ownerDocument.location.href);
    if (url && this.shouldOpenInNewTab(url)) {
      if (!this.navigationSnapshots.has(anchor)) {
        this.navigationSnapshots.set(anchor, {
          target: anchor.getAttribute('target'),
          rel: anchor.getAttribute('rel'),
        });
      }
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      return;
    }

    const snapshot = this.navigationSnapshots.get(anchor);
    if (snapshot) {
      this.restoreNavigationAnchor(anchor, snapshot);
      this.navigationSnapshots.delete(anchor);
    }
  }

  private restoreNavigationAnchor(anchor: HTMLAnchorElement, snapshot: AnchorSnapshot): void {
    if (snapshot.target === null) {
      anchor.removeAttribute('target');
    } else {
      anchor.setAttribute('target', snapshot.target);
    }
    if (snapshot.rel === null) {
      anchor.removeAttribute('rel');
    } else {
      anchor.setAttribute('rel', snapshot.rel);
    }
  }

  private shouldOpenInNewTab(url: URL): boolean {
    if (!this.layout) {
      return false;
    }
    if (url.origin !== this.layout.statsUrl.origin) {
      return true;
    }
    if (isCurrentStatsPath(url, this.layout.statsUrl)) {
      return false;
    }
    return isStatsInformationPath(url.pathname);
  }

  private openInProtectedTab(url: URL): void {
    const opened = this.frameDocument?.defaultView?.open(
      url.href,
      '_blank',
      'noopener,noreferrer',
    );
    if (opened) {
      opened.opener = null;
    }
  }

  private scheduleFrameResize(): void {
    if (this.frameResizeTimer !== undefined) {
      clearTimeout(this.frameResizeTimer);
    }
    this.frameResizeTimer = setTimeout(() => {
      this.frameResizeTimer = undefined;
      this.resizeFrameToContent();
    }, 0);
  }

  private resizeFrameToContent(): void {
    const stats = this.frameDocument?.querySelector<HTMLElement>(STATS_SELECTORS.root);
    if (!stats || !this.iframe) {
      return;
    }
    const measuredHeight = Math.max(
      stats.scrollHeight,
      stats.offsetHeight,
      stats.getBoundingClientRect().height,
    );
    if (measuredHeight > 0) {
      this.iframe.style.height = `${Math.ceil(Math.max(620, measuredHeight + 24))}px`;
    }
  }

  private markLoadFailed(): void {
    this.clearLoadTimer();
    this.frameWrap?.removeAttribute('aria-busy');
    this.setStatus(
      'failed',
      '통계를 표시할 수 없습니다. 원본 통계 링크를 이용하세요.',
    );
  }

  private setStatus(state: string, message: string): void {
    if (!this.status) {
      return;
    }
    this.status.dataset.state = state;
    this.status.textContent = message;
    this.status.hidden = message.length === 0;
    if (message) {
      this.status.setAttribute('role', 'status');
    } else {
      this.status.removeAttribute('role');
    }
  }

  private recordDiagnostic(diagnostic: ContractDiagnostic): void {
    const previous = this.contractDiagnostic;
    this.contractDiagnostic = diagnostic;
    if (
      previous?.component === diagnostic.component
      && previous.key === diagnostic.key
      && previous.reason === diagnostic.reason
      && previous.page === diagnostic.page
    ) {
      return;
    }
    this.reportDiagnostic?.(diagnostic);
  }

  private clearLoadTimer(): void {
    if (this.loadTimer !== undefined) {
      clearTimeout(this.loadTimer);
      this.loadTimer = undefined;
    }
  }
}
