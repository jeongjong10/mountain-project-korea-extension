import { MapSunControlsLocalizer } from '../localization/map-sun-controls-localizer';

const SOUTH_KOREA_AREA_PATH = '/area/106225629/south-korea';
export const SOUTH_KOREA_MAP_URL =
  'https://www.mountainproject.com/map/106225629/south-korea';

const CONTENT_ID = 'mpkr-south-korea-map-content';
const SECTION_CLASS = 'mpkr-south-korea-map';
const LOAD_TIMEOUT_MS = 15_000;
const FRAME_CHROME_MARKER = 'data-mpkr-south-korea-map-chrome';
const MOUNTAIN_PROJECT_HOSTS = new Set([
  'mountainproject.com',
  'www.mountainproject.com',
]);

const FRAME_CHROME_STYLE_TEXT = `
#header-container-print,
#header-container,
#div-gpt-ad-1614709329076-0,
.main-content-container .row.pt-main-content > .col-xs-12 > h1,
.main-content-container .row.pt-main-content > .col-xs-12 > h1 + .text-warm,
.main-content-container .row.pt-main-content > .col-xs-12 > h1 + .text-warm + .mt-2,
#footer-container {
  display: none !important;
}

.main-content-container {
  margin-top: 0 !important;
  padding-top: 0 !important;
}

.main-content-container > .container-fluid {
  max-width: none !important;
  padding-top: 0.5rem !important;
}

#map-and-ride-finder-container {
  height: max(520px, calc(100vh - 10rem)) !important;
}
`;

interface AnchorAttributeSnapshot {
  target: string | null;
  rel: string | null;
}

const CONTENT_PATH_PATTERNS = [
  /^\/(?:area|route|photo|video|user)\/\d+(?:\/|$)/,
  /^\/forum\/topic\/\d+(?:\/|$)/,
  /^\/route-guide(?:\/|$)/,
];

const MAP_DETAIL_CONTEXT_SELECTOR = [
  '#details-popup',
  '#details-window',
  '.ap-map-popup',
].join(',');

const NAVIGATION_ACTION_SELECTOR = [
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
].join(',');

const STYLE_TEXT = `
#climb-area-page .${SECTION_CLASS} {
  margin: 0 0 1rem;
}

#climb-area-page .${SECTION_CLASS}__heading {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 0;
  width: 100%;
  min-width: 0;
  text-indent: 0;
  cursor: pointer;
  border-radius: 2px 2px 0 0;
  transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease;
}

#climb-area-page .${SECTION_CLASS}__heading:hover {
  border-bottom-color: #0060a9;
  background: rgba(0, 96, 169, 0.12);
  color: #004b84;
}

#climb-area-page .${SECTION_CLASS}__heading:focus-visible {
  outline: 3px solid #0060a9;
  outline-offset: 2px;
  background: rgba(0, 96, 169, 0.14);
  color: #003e70;
}

#climb-area-page .${SECTION_CLASS}__label {
  flex: 0 1 auto;
  min-width: 0;
  font-size: 1rem;
  font-weight: 700;
}

#climb-area-page .${SECTION_CLASS}__hint {
  flex: 0 0 auto;
  margin-left: 0.45rem;
  color: #7a8791;
  font-size: 0.9rem;
  font-weight: 400;
  white-space: nowrap;
}

#climb-area-page .${SECTION_CLASS}__heading:hover .${SECTION_CLASS}__hint,
#climb-area-page .${SECTION_CLASS}__heading:focus-visible .${SECTION_CLASS}__hint {
  color: #004f8c;
}

#climb-area-page .${SECTION_CLASS}__chevron {
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

#climb-area-page .${SECTION_CLASS}__heading[aria-expanded='true']
  .${SECTION_CLASS}__chevron {
  transform: rotate(180deg);
}

#climb-area-page .${SECTION_CLASS}__content {
  padding: 0.75rem 0 0;
}

#climb-area-page .${SECTION_CLASS}__content[hidden] {
  display: none !important;
}

#climb-area-page .${SECTION_CLASS}__status {
  margin: 0 0 0.6rem;
}

#climb-area-page .${SECTION_CLASS}__status {
  color: #59635d;
  font-size: 0.85rem;
}

#climb-area-page .${SECTION_CLASS}__frame-wrap {
  width: 100%;
  border: 1px solid #c8ceca;
  border-radius: 4px;
  background: #f5f5f5;
  overflow: hidden;
}

#climb-area-page .${SECTION_CLASS}__frame {
  display: block;
  width: 100%;
  height: clamp(520px, 78vh, 760px);
  border: 0;
  background: #fff;
}

#climb-area-page .${SECTION_CLASS}__external {
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
  margin-left: auto;
  padding-left: 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}

@media (max-width: 575px) {
  #climb-area-page .${SECTION_CLASS}__heading {
    flex-wrap: wrap;
  }

  #climb-area-page .${SECTION_CLASS}__label,
  #climb-area-page .${SECTION_CLASS}__hint {
    order: 1;
  }

  #climb-area-page .${SECTION_CLASS}__external {
    order: 2;
    margin-left: auto;
    padding-left: 0.5rem;
    white-space: normal;
  }

  #climb-area-page .${SECTION_CLASS}__chevron {
    order: 3;
  }

  #climb-area-page .${SECTION_CLASS}__frame {
    height: clamp(500px, 74vh, 640px);
  }
}
`;

function pathFor(anchor: HTMLAnchorElement, baseUrl: URL): string | undefined {
  try {
    return new URL(anchor.getAttribute('href') ?? '', baseUrl).pathname.replace(/\/+$/, '');
  } catch {
    return undefined;
  }
}

function isLocationTrailAnchor(anchor: HTMLAnchorElement): boolean {
  if (anchor.closest([
    '.breadcrumbs',
    '.breadcrumb',
    '[aria-label="breadcrumb"]',
    '[aria-label="Breadcrumb"]',
  ].join(', '))) {
    return true;
  }
  const trail = anchor.parentElement;
  return Boolean(trail?.matches('.text-warm, .small')
    && trail.querySelector('a[href$="/route-guide"]'));
}

export function matchesSouthKoreaArea(url: URL, root: ParentNode = document): boolean {
  const currentPath = url.pathname.replace(/\/+$/, '');
  if (!MOUNTAIN_PROJECT_HOSTS.has(url.hostname)
    || !/^\/area\/\d+(?:\/[^/]+)?$/.test(currentPath)) {
    return false;
  }
  if (currentPath === SOUTH_KOREA_AREA_PATH) {
    return true;
  }
  return Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href*="/area/"]'))
    .some((anchor) => pathFor(anchor, url) === SOUTH_KOREA_AREA_PATH
      && isLocationTrailAnchor(anchor));
}

function mapUrlForArea(anchor: HTMLAnchorElement, baseUrl: URL): string | undefined {
  try {
    const url = new URL(anchor.getAttribute('href') ?? '', baseUrl);
    const areaId = baseUrl.pathname.match(/^\/area\/(\d+)(?:\/|$)/)?.[1];
    const mapId = url.pathname.match(/^\/map\/(\d+)(?:\/|$)/)?.[1];
    return areaId && mapId === areaId && MOUNTAIN_PROJECT_HOSTS.has(url.hostname)
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
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
  const mapUrl = new URL(SOUTH_KOREA_MAP_URL);
  if (url.origin !== mapUrl.origin || url.pathname.startsWith('/map/')) {
    return false;
  }

  if (CONTENT_PATH_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    return true;
  }

  return Boolean(element.closest(MAP_DETAIL_CONTEXT_SELECTOR))
    && !url.pathname.startsWith('/ajax/')
    && !url.pathname.startsWith('/auth/');
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

export class SouthKoreaMapEmbed {
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
  private frameChromeStyle: HTMLStyleElement | undefined;
  private frameDocumentMarkerSnapshot: string | null | undefined;
  private mapUrl = SOUTH_KOREA_MAP_URL;
  private readonly sunControls = new MapSunControlsLocalizer();
  private readonly navigationAnchorSnapshots = new Map<
    HTMLAnchorElement,
    AnchorAttributeSnapshot
  >();
  private loadTimer: ReturnType<typeof setTimeout> | undefined;

  private readonly handleToggle = (): void => {
    if (!this.toggle || !this.content) {
      return;
    }

    const expanded = this.toggle.getAttribute('aria-expanded') === 'true';
    this.toggle.setAttribute('aria-expanded', String(!expanded));
    this.toggle.setAttribute(
      'aria-label',
      `대한민국 클라이밍 지도 ${expanded ? '내용 펼치기' : '내용 접기'}`,
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
    const action = target?.closest?.(NAVIGATION_ACTION_SELECTOR);
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

  private readonly handleFrameSubmitCapture = (event: SubmitEvent): void => {
    const eventTarget = event.target as Element | null;
    if (eventTarget?.tagName !== 'FORM') {
      return;
    }
    const form = eventTarget as HTMLFormElement;

    const submitter = event.submitter as Element | null;
    const method = submitter?.getAttribute('formmethod')
      ?? form.getAttribute('method')
      ?? 'get';
    if (method.toLowerCase() !== 'get') {
      return;
    }

    const action = submitter?.getAttribute('formaction')
      ?? form.getAttribute('action')
      ?? form.ownerDocument.location.href;
    const url = resolveUrl(action, form.ownerDocument.location.href);
    if (!url || !isInformationNavigation(form, url)) {
      return;
    }

    const FrameFormData = form.ownerDocument.defaultView?.FormData ?? FormData;
    const formData = new FrameFormData(form);
    const submitterName = submitter?.getAttribute('name');
    if (submitterName) {
      const submitterValue = (submitter as HTMLButtonElement | HTMLInputElement).value
        ?? submitter!.getAttribute('value')
        ?? '';
      if (!formData.getAll(submitterName).includes(submitterValue)) {
        formData.append(submitterName, submitterValue);
      }
    }
    for (const [name, value] of formData) {
      if (typeof value === 'string') {
        url.searchParams.append(name, value);
      }
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    this.openInProtectedTab(url);
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
      && loadedUrl.pathname.replace(/\/+$/, '') === expectedUrl.pathname;

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
    if (!matchesSouthKoreaArea(currentUrl, root)) {
      return false;
    }

    const mapLink = Array.from(
      root.querySelectorAll<HTMLAnchorElement>(
        '#climb-area-page .row.pt-main-content > .col-md-3.left-nav .mp-sidebar a[href]',
      ),
    ).find((anchor) => Boolean(anchor.querySelector('.map-preview'))
      && Boolean(mapUrlForArea(anchor, currentUrl)));
    const areaSidebar = mapLink?.closest<HTMLElement>('.col-md-3.left-nav')
      ?? root.querySelector<HTMLElement>(
        '#climb-area-page .row.pt-main-content > .col-md-3.left-nav',
      )
      ?? undefined;
    const layoutRow = areaSidebar?.parentElement;
    const mainContent = Array.from(layoutRow?.children ?? []).find((child) => (
      child instanceof HTMLElement
      && child.matches('.col-md-9.main-content')
    )) as HTMLElement | undefined;
    const ownerDocument = mainContent?.ownerDocument;

    if (
      !areaSidebar
      || !layoutRow?.matches('.row.pt-main-content')
      || !mainContent
      || !ownerDocument?.head
    ) {
      return false;
    }

    this.mapUrl = mapLink ? mapUrlForArea(mapLink, currentUrl) ?? SOUTH_KOREA_MAP_URL
      : SOUTH_KOREA_MAP_URL;

    const style = ownerDocument.createElement('style');
    style.dataset.mpKoreaSouthKoreaMap = 'styles';
    style.textContent = STYLE_TEXT;

    const section = ownerDocument.createElement('section');
    section.className = SECTION_CLASS;
    section.dataset.mpKoreaSouthKoreaMap = 'true';
    section.setAttribute('aria-label', '대한민국 클라이밍 지도');

    const heading = ownerDocument.createElement('div');
    heading.className = `title-with-border-bottom mb-1 mpkr-info-heading ${SECTION_CLASS}__heading ${SECTION_CLASS}__toggle`;
    const toggle = heading;
    toggle.setAttribute('role', 'button');
    toggle.setAttribute('tabindex', '0');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', CONTENT_ID);
    toggle.setAttribute('aria-label', '대한민국 클라이밍 지도 내용 펼치기');

    const label = ownerDocument.createElement('span');
    label.className = `${SECTION_CLASS}__label`;
    label.textContent = '대한민국 클라이밍 지도';

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
    this.mapUrl = SOUTH_KOREA_MAP_URL;
  }

  private createIframe(): void {
    if (this.iframe || !this.frameWrap) {
      return;
    }

    const iframe = this.frameWrap.ownerDocument.createElement('iframe');
    iframe.className = `${SECTION_CLASS}__frame`;
    iframe.src = this.mapUrl;
    iframe.title = 'Mountain Project 대한민국 클라이밍 지도';
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
    frameDocument.addEventListener('submit', this.handleFrameSubmitCapture, true);
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
      this.frameDocument.removeEventListener('submit', this.handleFrameSubmitCapture, true);
    }
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
    const documentElement = frameDocument.documentElement;
    const hasExpectedChrome = frameDocument.querySelector('#header-container');
    const hasExpectedMap = frameDocument.querySelector(
      '#map-and-ride-finder-container #ap-map-container',
    );
    if (!frameDocument.head || !documentElement || !hasExpectedChrome || !hasExpectedMap) {
      return;
    }

    const style = frameDocument.createElement('style');
    style.setAttribute(FRAME_CHROME_MARKER, 'styles');
    style.textContent = FRAME_CHROME_STYLE_TEXT;

    this.frameDocumentMarkerSnapshot = documentElement.getAttribute(
      FRAME_CHROME_MARKER,
    );
    documentElement.setAttribute(FRAME_CHROME_MARKER, 'true');
    frameDocument.head.append(style);
    this.frameChromeStyle = style;
  }

  private restoreFrameChromePresentation(): void {
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
