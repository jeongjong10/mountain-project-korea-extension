import { UI } from './design-tokens';
import { locateAreaPage } from '../sites/mountain-project/dom/area-page';
import { MapSunControlsLocalizer } from '../localization/map-sun-controls-localizer';
import { connectEmbeddedFormNavigation } from './embedded-form-navigation';
import { connectEmbeddedScrollBoundary } from './embedded-scroll-boundary';
import { isMountainProjectUrl } from '../sites/mountain-project/contract/origins';
import { SOUTH_KOREA_MAP_URL } from '../sites/mountain-project/contract/regions/south-korea';
import {
  isMapInformationPath,
  isInternalActionPath,
  normalizeMountainProjectPath,
  parseMapPath,
} from '../sites/mountain-project/contract/routes';
import { AREA_SELECTORS } from '../sites/mountain-project/contract/selectors/area';
import {
  MAP_FRAME_CHROME_HIDE_SELECTORS,
  MAP_SELECTORS,
} from '../sites/mountain-project/contract/selectors/map';
import { SHARED_SELECTORS } from '../sites/mountain-project/contract/selectors/shared';
import type {
  ContractDiagnostic,
} from '../sites/mountain-project/contract/schema';
import type { ContractDiagnosticSink } from '../sites/mountain-project/contract/diagnostics';
import {
  isSouthKoreaAreaContext,
} from '../sites/mountain-project/dom/location-trail';
import {
  locateAreaMapLayout,
  locateMapFrameLandmarks,
} from '../sites/mountain-project/dom/map-layout';

export { SOUTH_KOREA_MAP_URL } from '../sites/mountain-project/contract/regions/south-korea';

const CONTENT_ID = 'mpkr-south-korea-map-content';
const SECTION_CLASS = 'mpkr-south-korea-map';
const LOAD_TIMEOUT_MS = 15_000;
const FRAME_CHROME_MARKER = 'data-mpkr-south-korea-map-chrome';
const FRAME_CHROME_STYLE_TEXT = `
${MAP_FRAME_CHROME_HIDE_SELECTORS.join(',\n')} {
  display: none !important;
}

${MAP_SELECTORS.frameMainContainer} {
  margin-top: 0 !important;
  padding-top: 0 !important;
}

${MAP_SELECTORS.frameContainerFluid} {
  max-width: none !important;
  padding-top: 0.5rem !important;
}

${MAP_SELECTORS.root} {
  height: max(520px, calc(100vh - 10rem)) !important;
}
`;

interface AnchorAttributeSnapshot {
  target: string | null;
  rel: string | null;
}

const STYLE_TEXT = `
${AREA_SELECTORS.page} .${SECTION_CLASS} {
  margin: 0 0 1rem;
}

${AREA_SELECTORS.page} .${SECTION_CLASS}__heading {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 0;
  width: 100%;
  min-width: 0;
  text-indent: 0;
  cursor: pointer;
  border-radius: ${UI.radius.small} ${UI.radius.small} 0 0;
  transition: background-color ${UI.motion.fast}, border-color ${UI.motion.fast}, color ${UI.motion.fast};
}

${AREA_SELECTORS.page} .${SECTION_CLASS}__heading:hover {
  border-bottom-color: ${UI.color.link};
  background: ${UI.color.headingHover};
  color: ${UI.color.linkHover};
}

${AREA_SELECTORS.page} .${SECTION_CLASS}__heading:focus-visible {
  outline: 3px solid ${UI.color.link};
  outline-offset: 2px;
  background: ${UI.color.headingFocus};
  color: ${UI.color.linkActive};
}

${AREA_SELECTORS.page} .${SECTION_CLASS}__label {
  flex: 0 1 auto;
  min-width: 0;
  font-size: ${UI.font.body};
  font-weight: 700;
}

${AREA_SELECTORS.page} .${SECTION_CLASS}__hint {
  flex: 0 0 auto;
  margin-left: 0.45rem;
  color: ${UI.color.muted};
  font-size: ${UI.font.hint};
  font-weight: 400;
  white-space: nowrap;
}

${AREA_SELECTORS.page} .${SECTION_CLASS}__heading:hover .${SECTION_CLASS}__hint,
${AREA_SELECTORS.page} .${SECTION_CLASS}__heading:focus-visible .${SECTION_CLASS}__hint {
  color: ${UI.color.linkHover};
}

${AREA_SELECTORS.page} .${SECTION_CLASS}__chevron {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 2rem;
  width: 2rem;
  height: 2rem;
  margin-left: 0.35rem;
  font-size: 1.6rem;
  line-height: 1;
  transition: transform 160ms ease;
}

${AREA_SELECTORS.page} .${SECTION_CLASS}__heading[aria-expanded='true']
  .${SECTION_CLASS}__chevron {
  transform: rotate(180deg);
}

${AREA_SELECTORS.page} .${SECTION_CLASS}__content {
  padding: 0.75rem 0 0;
}

${AREA_SELECTORS.page} .${SECTION_CLASS}__content[hidden] {
  display: none !important;
}

${AREA_SELECTORS.page} .${SECTION_CLASS}__status {
  margin: 0 0 0.6rem;
}

${AREA_SELECTORS.page} .${SECTION_CLASS}__status {
  color: ${UI.color.muted};
  font-size: ${UI.font.small};
}

${AREA_SELECTORS.page} .${SECTION_CLASS}__frame-wrap {
  width: 100%;
  border: 1px solid ${UI.color.border};
  border-radius: ${UI.radius.control};
  background: ${UI.color.surfaceSubtle};
  overflow: hidden;
}

${AREA_SELECTORS.page} .${SECTION_CLASS}__frame {
  display: block;
  width: 100%;
  height: clamp(520px, 78vh, 760px);
  border: 0;
  background: ${UI.color.surface};
}

${AREA_SELECTORS.page} .${SECTION_CLASS}__external {
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
  margin-left: auto;
  padding-left: 0.75rem;
  font-size: 0.8rem;
  font-weight: ${UI.font.controlWeight};
  white-space: nowrap;
}

@media (max-width: 575px) {
  ${AREA_SELECTORS.page} .${SECTION_CLASS}__heading {
    flex-wrap: wrap;
  }

  ${AREA_SELECTORS.page} .${SECTION_CLASS}__label,
  ${AREA_SELECTORS.page} .${SECTION_CLASS}__hint {
    order: 1;
  }

  ${AREA_SELECTORS.page} .${SECTION_CLASS}__external {
    order: 2;
    margin-left: auto;
    padding-left: 0.5rem;
    white-space: normal;
  }

  ${AREA_SELECTORS.page} .${SECTION_CLASS}__chevron {
    order: 3;
  }

  ${AREA_SELECTORS.page} .${SECTION_CLASS}__frame {
    height: clamp(500px, 74vh, 640px);
  }
}
`;

export function matchesSouthKoreaArea(url: URL, root: ParentNode = document): boolean {
  return isSouthKoreaAreaContext(url, root);
}

function resolveUrl(value: string | null, documentUrl: string): URL | undefined {
  if (!value || value.startsWith('#') || /^javascript:/i.test(value)) {
    return undefined;
  }

  try {
    return new URL(value, documentUrl);
  } catch {
    return undefined;
  }
}

function isInformationNavigation(element: Element, url: URL): boolean {
  if (!isMountainProjectUrl(url) || parseMapPath(url.pathname)) {
    return false;
  }

  if (isMapInformationPath(url.pathname)) {
    return true;
  }

  return Boolean(element.closest(MAP_SELECTORS.detailsContext))
    && !isInternalActionPath(url.pathname);
}

function getAnchorNavigation(anchor: HTMLAnchorElement): URL | undefined {
  return resolveUrl(
    anchor.getAttribute('href'),
    anchor.ownerDocument.location.href,
  );
}

function getInlineNavigationValue(element: Element): string | null {
  const dataValue = element.getAttribute('data-href')
    ?? element.getAttribute('data-url');
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

  const locationCall = onclick.match(
    /(?:window\.)?location\.(?:assign|replace)\(\s*(['"])(.*?)\1\s*\)/i,
  );
  return locationCall?.[2] ?? null;
}

type AreaScopeMatcher = (url: URL, root: ParentNode) => boolean;

/** Preserve the site's fixed notice, but leave enough document space to scroll map credits above it. */
function connectMapNoticeSpace(frameDocument: Document): () => void {
  const frameWindow = frameDocument.defaultView;
  if (!frameWindow || !frameDocument.body) return () => undefined;

  const spacer = frameDocument.createElement('div');
  spacer.dataset.mpkrMapNoticeSpace = 'true';
  spacer.setAttribute('aria-hidden', 'true');
  spacer.style.cssText = 'display: block; width: 1px; clear: both; flex: none; pointer-events: none;';
  let notice: Element | null = null;
  let disconnected = false;

  const update = (): void => {
    if (disconnected) return;
    const nextNotice = frameDocument.querySelector(MAP_SELECTORS.fixedAccessNotice);
    if (nextNotice !== notice) {
      if (notice) resizeObserver?.unobserve(notice);
      notice = nextNotice;
      if (notice) resizeObserver?.observe(notice);
    }
    const bounds = notice?.getBoundingClientRect();
    const style = notice ? frameWindow.getComputedStyle(notice) : undefined;
    const viewportHeight = frameWindow.innerHeight;
    const obscuredHeight = bounds && bounds.width > 0 && bounds.height > 0
      && bounds.top < viewportHeight && bounds.bottom >= viewportHeight - 1
      && style?.position === 'fixed' && style.display !== 'none' && style.visibility !== 'hidden'
      ? viewportHeight - Math.max(0, bounds.top)
      : 0;

    if (obscuredHeight <= 0) {
      spacer.remove();
      return;
    }
    const height = `${Math.ceil(obscuredHeight) + 16}px`;
    if (spacer.style.height !== height) spacer.style.height = height;
    if (spacer.parentNode !== frameDocument.body) frameDocument.body.append(spacer);
  };
  const Resize = frameWindow.ResizeObserver;
  const resizeObserver = Resize ? new Resize(update) : undefined;
  const observer = new frameWindow.MutationObserver((records) => {
    if (records.some((record) => record.type === 'childList'
      || record.target === notice || notice?.contains(record.target)
      || record.target === frameDocument.body || record.target === frameDocument.documentElement)) {
      update();
    }
  });
  observer.observe(frameDocument.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style', 'hidden'],
  });
  frameWindow.addEventListener('resize', update);
  update();

  return () => {
    disconnected = true;
    observer.disconnect();
    resizeObserver?.disconnect();
    frameWindow.removeEventListener('resize', update);
    spacer.remove();
  };
}

export class AreaMapEmbed {
  private section: HTMLElement | undefined;
  private style: HTMLStyleElement | undefined;
  private toggle: HTMLElement | undefined;
  private hint: HTMLElement | undefined;
  private content: HTMLElement | undefined;
  private frameWrap: HTMLElement | undefined;
  private iframe: HTMLIFrameElement | undefined;
  private status: HTMLElement | undefined;
  private frameDocument: Document | undefined;
  private frameObserver: MutationObserver | undefined;
  private disconnectFormNavigation: (() => void) | undefined;
  private disconnectScrollBoundary: (() => void) | undefined;
  private disconnectNoticeSpace: (() => void) | undefined;
  private frameChromeStyle: HTMLStyleElement | undefined;
  private frameDocumentMarkerSnapshot: string | null | undefined;
  private mapUrl = '';
  private mapLabel = '클라이밍 지도';
  private readonly sunControls = new MapSunControlsLocalizer();
  private readonly navigationAnchorSnapshots = new Map<
    HTMLAnchorElement,
    AnchorAttributeSnapshot
  >();
  private loadTimer: ReturnType<typeof setTimeout> | undefined;
  private contractDiagnostic: ContractDiagnostic | undefined;

  constructor(
    private readonly reportDiagnostic?: ContractDiagnosticSink,
    private readonly matchesArea: AreaScopeMatcher = (url, root) => locateAreaPage(root, url).ok,
  ) {}

  get lastDiagnostic(): ContractDiagnostic | undefined {
    return this.contractDiagnostic;
  }

  private readonly handleToggle = (): void => {
    if (!this.toggle || !this.content) {
      return;
    }

    const expanded = this.toggle.getAttribute('aria-expanded') === 'true';
    this.toggle.setAttribute('aria-expanded', String(!expanded));
    this.toggle.setAttribute(
      'aria-label',
      `${this.mapLabel} ${expanded ? '내용 펼치기' : '내용 접기'}`,
    );
    this.content.hidden = expanded;
    if (this.hint) {
      this.hint.textContent = expanded ? '눌러서 내용 보기' : '눌러서 접기';
    }

    if (!expanded) {
      this.createIframe();
    }
  };

  private readonly handleToggleClick = (event: MouseEvent): void => {
    if (event.target instanceof Element && event.target.closest('a')) {
      return;
    }
    this.handleToggle();
  };

  private readonly handleToggleKeyDown = (event: KeyboardEvent): void => {
    if (event.target instanceof Element && event.target.closest('a')) {
      return;
    }
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    event.preventDefault();
    this.handleToggle();
  };

  private readonly handleFrameClickCapture = (event: Event): void => {
    const target = event.target as { closest?: (selector: string) => Element | null } | null;
    const action = target?.closest?.(SHARED_SELECTORS.navigationAction);
    if (!action) {
      return;
    }

    if (action.tagName === 'A') {
      this.processNavigationAnchor(action);
      return;
    }

    const url = resolveUrl(
      getInlineNavigationValue(action),
      action.ownerDocument.location.href,
    );
    if (url && isInformationNavigation(action, url)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      this.openInProtectedTab(url);
    }
  };

  private readonly handleFrameLoad = (): void => {
    if (!this.iframe) {
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

    if (!frameDocument || !loadedUrl) {
      this.clearLoadTimer();
      this.frameWrap?.removeAttribute('aria-busy');
      this.setStatus('loaded-limited', '');
      return;
    }

    const expectedUrl = new URL(this.mapUrl);
    const isExpectedDocument = loadedUrl.origin === expectedUrl.origin
      && normalizeMountainProjectPath(loadedUrl.pathname)
        === normalizeMountainProjectPath(expectedUrl.pathname);

    if (!isExpectedDocument) {
      this.markLoadFailed();
      return;
    }

    this.connectFrameDocument(frameDocument);
    this.clearLoadTimer();
    this.frameWrap?.removeAttribute('aria-busy');
    this.setStatus('loaded', '');
  };

  private readonly handleFrameError = (): void => {
    this.markLoadFailed();
  };

  mount(
    root: ParentNode = document,
    currentUrl: URL = new URL(window.location.href),
  ): boolean {
    if (this.section?.isConnected && this.style?.isConnected) {
      return true;
    }
    if (!this.matchesArea(currentUrl, root)) {
      return false;
    }

    const located = locateAreaMapLayout(root, currentUrl);
    if (!located.ok) {
      this.recordDiagnostic(located.diagnostic);
      return false;
    }
    const { mainContent, mapUrl, page } = located.value;
    const ownerDocument = mainContent.ownerDocument;
    if (!ownerDocument.head) {
      this.recordDiagnostic({
        component: 'south-korea-map',
        key: 'document-head',
        reason: 'Area document head is missing.',
        page: currentUrl.href,
      });
      return false;
    }

    this.contractDiagnostic = undefined;
    this.mapUrl = mapUrl;
    const areaName = page.querySelector('h1')?.childNodes[0]?.textContent?.trim();
    this.mapLabel = matchesSouthKoreaArea(currentUrl, root)
      ? '대한민국 클라이밍 지도'
      : `${areaName || 'Area'} 클라이밍 지도`;

    const style = ownerDocument.createElement('style');
    style.dataset.mpKoreaSouthKoreaMap = 'styles';
    style.textContent = STYLE_TEXT;

    const section = ownerDocument.createElement('section');
    section.className = SECTION_CLASS;
    section.dataset.mpKoreaSouthKoreaMap = 'true';
    section.setAttribute('aria-label', this.mapLabel);

    const heading = ownerDocument.createElement('div');
    heading.className = `title-with-border-bottom mb-1 mpkr-info-heading ${SECTION_CLASS}__heading ${SECTION_CLASS}__toggle`;
    const toggle = heading;
    toggle.setAttribute('role', 'button');
    toggle.setAttribute('tabindex', '0');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', CONTENT_ID);
    toggle.setAttribute('aria-label', `${this.mapLabel} 내용 펼치기`);

    const label = ownerDocument.createElement('span');
    label.className = `${SECTION_CLASS}__label`;
    label.textContent = this.mapLabel;

    const hint = ownerDocument.createElement('span');
    hint.className = `${SECTION_CLASS}__hint`;
    hint.setAttribute('aria-hidden', 'true');
    hint.textContent = '눌러서 내용 보기';

    const chevron = ownerDocument.createElement('span');
    chevron.className = `${SECTION_CLASS}__chevron`;
    chevron.setAttribute('aria-hidden', 'true');
    chevron.textContent = '⌄';

    const content = ownerDocument.createElement('div');
    content.id = CONTENT_ID;
    content.className = `${SECTION_CLASS}__content`;
    content.hidden = true;

    const status = ownerDocument.createElement('p');
    status.className = `${SECTION_CLASS}__status`;
    status.dataset.state = 'idle';
    status.hidden = true;

    const frameWrap = ownerDocument.createElement('div');
    frameWrap.className = `${SECTION_CLASS}__frame-wrap`;

    const externalLink = ownerDocument.createElement('a');
    externalLink.className = `${SECTION_CLASS}__external`;
    externalLink.href = this.mapUrl;
    externalLink.target = '_blank';
    externalLink.rel = 'noopener noreferrer';
    externalLink.textContent = 'Mountain Project 원본 지도 열기';

    heading.append(label, hint, externalLink, chevron);
    content.append(status, frameWrap);
    section.append(heading, content);

    ownerDocument.head.append(style);
    mainContent.prepend(section);
    toggle.addEventListener('click', this.handleToggleClick);
    toggle.addEventListener('keydown', this.handleToggleKeyDown);

    this.section = section;
    this.style = style;
    this.toggle = toggle;
    this.hint = hint;
    this.content = content;
    this.frameWrap = frameWrap;
    this.status = status;
    return true;
  }

  destroy(): void {
    this.clearLoadTimer();
    this.disconnectFrameDocument();
    this.toggle?.removeEventListener('click', this.handleToggleClick);
    this.toggle?.removeEventListener('keydown', this.handleToggleKeyDown);
    this.iframe?.removeEventListener('load', this.handleFrameLoad);
    this.iframe?.removeEventListener('error', this.handleFrameError);

    this.section?.remove();
    this.style?.remove();

    this.section = undefined;
    this.style = undefined;
    this.toggle = undefined;
    this.hint = undefined;
    this.content = undefined;
    this.frameWrap = undefined;
    this.iframe = undefined;
    this.status = undefined;
    this.mapUrl = '';
    this.mapLabel = '클라이밍 지도';
  }

  private createIframe(): void {
    if (this.iframe || !this.frameWrap) {
      return;
    }

    const iframe = this.frameWrap.ownerDocument.createElement('iframe');
    iframe.className = `${SECTION_CLASS}__frame`;
    iframe.src = this.mapUrl;
    iframe.title = `Mountain Project ${this.mapLabel}`;
    iframe.loading = 'lazy';
    iframe.addEventListener('load', this.handleFrameLoad);
    iframe.addEventListener('error', this.handleFrameError);
    this.frameWrap.append(iframe);
    this.iframe = iframe;

    this.frameWrap.setAttribute('aria-busy', 'true');
    this.setStatus('loading', '');
    this.loadTimer = setTimeout(() => this.markLoadFailed(), LOAD_TIMEOUT_MS);
  }

  private connectFrameDocument(frameDocument: Document): void {
    this.frameDocument = frameDocument;
    this.applyFrameChromePresentation(frameDocument);
    this.sunControls.connect(frameDocument);
    frameDocument.addEventListener('click', this.handleFrameClickCapture, true);
    this.disconnectFormNavigation = connectEmbeddedFormNavigation(
      frameDocument,
      (url) => isMountainProjectUrl(url) && isMapInformationPath(url.pathname),
    );
    const parentWindow = this.iframe?.ownerDocument.defaultView;
    if (parentWindow) {
      this.disconnectScrollBoundary = connectEmbeddedScrollBoundary(
        frameDocument,
        parentWindow,
        { ignoreWithin: MAP_SELECTORS.canvas },
      );
    }
    this.processNavigationAnchors(frameDocument);

    const Observer = frameDocument.defaultView?.MutationObserver ?? MutationObserver;
    this.frameObserver = new Observer((records) => {
      for (const record of records) {
        if (record.type === 'attributes' && record.target.nodeType === 1) {
          this.processNavigationAnchor(record.target as Element);
          continue;
        }

        for (const node of record.addedNodes) {
          if (node.nodeType === 1) {
            this.processNavigationAnchors(node as Element);
          }
        }
      }
    });
    this.frameObserver.observe(frameDocument.documentElement, {
      attributes: true,
      attributeFilter: ['href'],
      childList: true,
      subtree: true,
    });
  }

  private disconnectFrameDocument(): void {
    this.frameObserver?.disconnect();
    this.frameObserver = undefined;
    if (this.frameDocument) {
      this.frameDocument.removeEventListener('click', this.handleFrameClickCapture, true);
    }
    this.disconnectFormNavigation?.();
    this.disconnectFormNavigation = undefined;
    this.disconnectScrollBoundary?.();
    this.disconnectScrollBoundary = undefined;
    this.sunControls.disconnect();
    this.restoreFrameChromePresentation();
    this.frameDocument = undefined;

    for (const [anchor, snapshot] of this.navigationAnchorSnapshots) {
      this.restoreNavigationAnchor(anchor, snapshot);
    }
    this.navigationAnchorSnapshots.clear();
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
    const url = getAnchorNavigation(anchor);
    if (url && isInformationNavigation(anchor, url)) {
      this.prepareNavigationAnchor(anchor);
      return;
    }

    const snapshot = this.navigationAnchorSnapshots.get(anchor);
    if (snapshot) {
      this.restoreNavigationAnchor(anchor, snapshot);
      this.navigationAnchorSnapshots.delete(anchor);
    }
  }

  private prepareNavigationAnchor(anchor: HTMLAnchorElement): void {
    if (!this.navigationAnchorSnapshots.has(anchor)) {
      this.navigationAnchorSnapshots.set(anchor, {
        target: anchor.getAttribute('target'),
        rel: anchor.getAttribute('rel'),
      });
    }
    anchor.setAttribute('target', '_blank');
    anchor.setAttribute('rel', 'noopener noreferrer');
  }

  private restoreNavigationAnchor(
    anchor: HTMLAnchorElement,
    snapshot: AnchorAttributeSnapshot,
  ): void {
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

  private markLoadFailed(): void {
    this.clearLoadTimer();
    this.frameWrap?.removeAttribute('aria-busy');
    this.setStatus(
      'failed',
      '지도를 불러오지 못했습니다. 원본 지도 링크를 이용하세요.',
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

  private applyFrameChromePresentation(frameDocument: Document): void {
    const located = locateMapFrameLandmarks(
      frameDocument,
      frameDocument.location?.href,
    );
    if (!located.ok) {
      this.recordDiagnostic(located.diagnostic);
      return;
    }
    const { documentElement, head } = located.value;

    const style = frameDocument.createElement('style');
    style.setAttribute(FRAME_CHROME_MARKER, 'styles');
    style.textContent = FRAME_CHROME_STYLE_TEXT;

    this.frameDocumentMarkerSnapshot = documentElement.getAttribute(
      FRAME_CHROME_MARKER,
    );
    documentElement.setAttribute(FRAME_CHROME_MARKER, 'true');
    head.append(style);
    this.frameChromeStyle = style;
    this.disconnectNoticeSpace = connectMapNoticeSpace(frameDocument);
  }

  private recordDiagnostic(diagnostic: ContractDiagnostic): void {
    this.contractDiagnostic = diagnostic;
    this.reportDiagnostic?.(diagnostic);
  }

  private restoreFrameChromePresentation(): void {
    this.disconnectNoticeSpace?.();
    this.disconnectNoticeSpace = undefined;
    this.frameChromeStyle?.remove();
    this.frameChromeStyle = undefined;

    const documentElement = this.frameDocument?.documentElement;
    if (documentElement && this.frameDocumentMarkerSnapshot !== undefined) {
      if (this.frameDocumentMarkerSnapshot === null) {
        documentElement.removeAttribute(FRAME_CHROME_MARKER);
      } else {
        documentElement.setAttribute(
          FRAME_CHROME_MARKER,
          this.frameDocumentMarkerSnapshot,
        );
      }
    }
    this.frameDocumentMarkerSnapshot = undefined;
  }

  private clearLoadTimer(): void {
    if (this.loadTimer !== undefined) {
      clearTimeout(this.loadTimer);
      this.loadTimer = undefined;
    }
  }
}

/** @deprecated Use AreaMapEmbed for global Area maps. */
export class SouthKoreaMapEmbed extends AreaMapEmbed {
  constructor(reportDiagnostic?: ContractDiagnosticSink) {
    super(reportDiagnostic, matchesSouthKoreaArea);
  }
}
