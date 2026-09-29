import { UI } from './design-tokens';
import {
  SHARED_SELECTORS,
  SIDEBAR_PAGE_PATH_PREFIXES,
} from '../sites/mountain-project/contract/selectors/shared';

const RAIL_CLASS = 'mpkr-left-sidebar-rail';
const RAIL_MARKER_CLASS = `${RAIL_CLASS}__marker`;
const RAIL_HOST_CLASS = 'mpkr-left-sidebar-rail-host';
const LAYOUT_CLASS = 'mpkr-left-sidebar-layout';
const LAYOUT_GUTTER_CLASS = `${LAYOUT_CLASS}--rail-gutter`;
const PANEL_CLASS = 'mpkr-left-sidebar-panel';
const PANEL_SURFACE_CLASS = `${PANEL_CLASS}__surface`;
const PANEL_BACKDROP_CLASS = `${PANEL_CLASS}__backdrop`;
const PANEL_CLOSE_CLASS = `${PANEL_CLASS}__close`;
const UNDERLINE_FALLBACK_CLASS = 'mpkr-title-border-fallback';
const STYLE_ATTRIBUTE = 'data-mpkr-left-sidebar-toggle-style';
const OPEN_DELAY_MS = 120;
const CLOSE_DELAY_MS = 250;
const PANEL_MOTION_MS = 220;
const RAIL_GAP_PX = 8;
const DESKTOP_RAIL_MAX_WIDTH_PX = 40;
const MOBILE_RAIL_MAX_WIDTH_PX = 42;
const RAIL_LEFT_PROPERTY = '--mpkr-sidebar-rail-left';
const RAIL_MARKER_TOP_PROPERTY = '--mpkr-sidebar-marker-top';
const LAYOUT_GUTTER_PROPERTY = '--mpkr-sidebar-rail-gutter';
const PANEL_TOP_PROPERTY = '--mpkr-sidebar-panel-top';
const PANEL_HEIGHT_PROPERTY = '--mpkr-sidebar-panel-height';

const STYLE_TEXT = `
.${LAYOUT_CLASS} {
  isolation: isolate;
  position: relative !important;
}

.${LAYOUT_CLASS} > .main-content,
.${LAYOUT_CLASS} > [class*="col-"] {
  flex-basis: 100% !important;
  float: none !important;
  max-width: 100% !important;
  width: 100% !important;
}

.${LAYOUT_CLASS}.${LAYOUT_GUTTER_CLASS} {
  box-sizing: border-box;
  padding-left: var(${LAYOUT_GUTTER_PROPERTY}) !important;
}

.${RAIL_HOST_CLASS} {
  position: relative !important;
}

.${RAIL_CLASS} {
  background: ${UI.color.surfaceSubtle};
  border: 1px solid ${UI.color.border};
  border-radius:  0 ${UI.radius.small} ${UI.radius.small} 0;
  border-right: 3px solid ${UI.color.link};
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
  color: ${UI.color.text};
  cursor: pointer;
  bottom: 0;
  display: block;
  left: var(${RAIL_LEFT_PROPERTY});
  min-height: 156px;
  padding: 0;
  position: absolute;
  top: 0;
  transform: translateX(0);
  transition:
    background-color ${UI.motion.fast},
    border-color ${UI.motion.fast},
    color ${UI.motion.fast},
    opacity 120ms ease,
    transform 160ms ease,
    width ${UI.motion.fast};
  will-change: opacity, transform;
  width: 38px;
  z-index: 1047;
}

.${RAIL_MARKER_CLASS} {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  height: 156px;
  justify-content: center;
  position: absolute;
  top: var(${RAIL_MARKER_TOP_PROPERTY}, 0px);
  transition: top 80ms linear;
  width: 100%;
}

.${RAIL_CLASS}:hover,
.${RAIL_CLASS}:focus-visible,
.${RAIL_CLASS}[aria-expanded="true"] {
  background: ${UI.color.surfaceHover};
  border-color: ${UI.color.borderHover};
  border-right-color: ${UI.color.linkHover};
  color: ${UI.color.linkHover};
  width: 40px;
}

.${RAIL_CLASS}:focus-visible,
.${PANEL_CLOSE_CLASS}:focus-visible {
  outline: 2px solid ${UI.color.link};
  outline-offset: 2px;
}

.${RAIL_CLASS}__chevron {
  font-size: ${UI.font.body};
  line-height: 1;
  transform: translateX(-1px);
  transition: transform 120ms ease;
}

.${RAIL_CLASS}__label {
  color: inherit;
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1;
  text-orientation: upright;
  writing-mode: vertical-rl;
}

.${RAIL_CLASS}[aria-expanded="true"] .${RAIL_CLASS}__chevron {
  transform: rotate(180deg) translateX(1px);
}

.${RAIL_CLASS}[aria-expanded="true"],
.${RAIL_CLASS}[data-mpkr-motion="closing"] {
  opacity: 0;
  pointer-events: none;
  transform: translateX(-6px);
  z-index: 1045;
}

.${PANEL_CLASS}[hidden] { display: none !important; }

.${PANEL_CLASS}:not([hidden]) {
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
  z-index: 3;
}

.${PANEL_BACKDROP_CLASS} { display: none; }

.${PANEL_SURFACE_CLASS} {
  background: ${UI.color.surface};
  box-shadow: 4px 0 12px rgba(0, 0, 0, 0.16);
  box-sizing: border-box;
  height: var(${PANEL_HEIGHT_PROPERTY}, 100%);
  left: 0;
  overflow-y: auto;
  padding: 0 14px 16px;
  pointer-events: auto;
  position: absolute;
  top: var(${PANEL_TOP_PROPERTY}, 0px);
  will-change: transform;
  max-width: 100%;
  width: 328px;
}

.${PANEL_CLASS}[data-mpkr-state="open"] .${PANEL_SURFACE_CLASS} {
  animation: mpkr-sidebar-flyout-enter ${PANEL_MOTION_MS}ms cubic-bezier(0.22, 0.72, 0.28, 1) both;
}

.${PANEL_CLASS}[data-mpkr-state="closing"] .${PANEL_SURFACE_CLASS} {
  animation: mpkr-sidebar-flyout-exit ${PANEL_MOTION_MS}ms cubic-bezier(0.4, 0, 0.6, 1) both;
  pointer-events: none;
}

.${PANEL_CLASS}__content > ${SHARED_SELECTORS.leftNavigation} {
  float: none !important;
  flex: none !important;
  margin: 0 !important;
  max-width: none !important;
  padding: 0 !important;
  width: auto !important;
}

.${PANEL_CLASS}__header {
  align-items: center;
  background: ${UI.color.surface};
  display: flex;
  justify-content: space-between;
  margin: 0 -14px 12px;
  min-height: 46px;
  padding: 0 10px 0 14px;
  position: sticky;
  top: 0;
  z-index: 1;
}

.${UNDERLINE_FALLBACK_CLASS} { border-bottom: 1px solid ${UI.color.link}; }

.${PANEL_CLASS}__title {
  color: ${UI.color.text};
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0;
}

.${PANEL_CLOSE_CLASS} {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: ${UI.radius.small};
  color: ${UI.color.text};
  cursor: pointer;
  display: inline-flex;
  font-size: 1.5rem;
  height: 38px;
  justify-content: center;
  line-height: 1;
  padding: 0;
  width: 38px;
}

.${PANEL_CLOSE_CLASS}:hover { background: ${UI.color.surfaceHover}; color: ${UI.color.linkHover}; }

@keyframes mpkr-sidebar-flyout-enter {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

@keyframes mpkr-sidebar-flyout-exit {
  from { transform: translateX(0); }
  to { transform: translateX(-100%); }
}

@media (hover: none), (pointer: coarse), (max-width: 767.98px) {
  .${RAIL_CLASS} {
    min-height: 124px;
    width: 40px;
  }

  .${RAIL_MARKER_CLASS} {
    height: 124px;
  }

  .${RAIL_CLASS}:hover,
  .${RAIL_CLASS}:focus-visible,
  .${RAIL_CLASS}[aria-expanded="true"] { width: 42px; }

  .${PANEL_CLASS}:not([hidden]) { pointer-events: auto; }

  .${PANEL_BACKDROP_CLASS} {
    background: rgba(0, 0, 0, 0.36);
    border: 0;
    display: block;
    height: var(${PANEL_HEIGHT_PROPERTY}, 100%);
    left: 0;
    padding: 0;
    pointer-events: auto;
    position: absolute;
    right: 0;
    top: var(${PANEL_TOP_PROPERTY}, 0px);
    width: 100%;
  }

  .${PANEL_CLASS}[data-mpkr-state="open"] .${PANEL_BACKDROP_CLASS} {
    animation: mpkr-sidebar-backdrop-enter ${PANEL_MOTION_MS}ms ease-out both;
  }

  .${PANEL_CLASS}[data-mpkr-state="closing"] .${PANEL_BACKDROP_CLASS} {
    animation: mpkr-sidebar-backdrop-exit ${PANEL_MOTION_MS}ms ease-in both;
    pointer-events: none;
  }

  .${PANEL_SURFACE_CLASS} {
    max-width: calc(100% - 28px);
    width: 328px;
  }
}

@keyframes mpkr-sidebar-backdrop-enter {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes mpkr-sidebar-backdrop-exit {
  from { opacity: 1; }
  to { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .${RAIL_CLASS},
  .${RAIL_MARKER_CLASS},
  .${RAIL_CLASS}__chevron,
  .${PANEL_BACKDROP_CLASS},
  .${PANEL_SURFACE_CLASS} {
    animation: none;
    transition: none;
  }
}
`;

type PageKind = 'area' | 'route' | 'generic';

interface SidebarLabels {
  visible: string;
  accessible: string;
}

interface BodyScrollLock {
  body: HTMLElement;
  count: number;
  overflow: string;
  priority: string;
}

interface RailHostState {
  count: number;
  hadClass: boolean;
}

interface SidebarBinding {
  sidebar: HTMLElement;
  layout: HTMLElement;
  railHost: HTMLElement;
  marker: Comment;
  rail: HTMLButtonElement;
  panel: HTMLElement;
  surface: HTMLElement;
  content: HTMLElement;
  closeButton: HTMLButtonElement;
  backdrop: HTMLButtonElement;
  labels: SidebarLabels;
  originalLayoutClassName: string | null;
  originalLayoutStyle: string | null;
  originalGutterValue: string;
  originalGutterPriority: string;
  openTimer: ReturnType<typeof setTimeout> | undefined;
  closeTimer: ReturnType<typeof setTimeout> | undefined;
  motionTimer: ReturnType<typeof setTimeout> | undefined;
  railHovered: boolean;
  panelHovered: boolean;
  pinned: boolean;
  mobile: boolean;
  scrollLocked: boolean;
  suppressFocusOpen: boolean;
  handleRailMouseEnter: () => void;
  handleRailMouseLeave: () => void;
  handleRailFocus: () => void;
  handleRailClick: (event: MouseEvent) => void;
  handlePanelMouseEnter: () => void;
  handlePanelMouseLeave: () => void;
  handlePanelFocusIn: () => void;
  handleCloseClick: () => void;
  handleBackdropClick: () => void;
}

interface SidebarLayoutMeasurement {
  binding: SidebarBinding;
  hasOutsideSpace: boolean;
  markerTop: number;
  panelTop: number;
  panelHeight: number;
  railLeft: number;
  railGutter: number;
}

const BODY_SCROLL_LOCKS = new WeakMap<Document, BodyScrollLock>();
const RAIL_HOSTS = new WeakMap<HTMLElement, RailHostState>();

function registerRailHost(host: HTMLElement): void {
  const current = RAIL_HOSTS.get(host);
  if (current) {
    current.count += 1;
    return;
  }
  RAIL_HOSTS.set(host, { count: 1, hadClass: host.classList.contains(RAIL_HOST_CLASS) });
  host.classList.add(RAIL_HOST_CLASS);
}

function unregisterRailHost(host: HTMLElement): void {
  const current = RAIL_HOSTS.get(host);
  if (!current) return;
  current.count -= 1;
  if (current.count > 0) return;
  if (!current.hadClass) host.classList.remove(RAIL_HOST_CLASS);
  RAIL_HOSTS.delete(host);
}

function isSidebar(element: Element): element is HTMLElement {
  return element instanceof HTMLElement
    && element.matches(SHARED_SELECTORS.leftNavigation)
    && Boolean(element.querySelector(SHARED_SELECTORS.sidebarContent));
}

function ownerDocumentOf(root: ParentNode): Document | null {
  return root.nodeType === Node.DOCUMENT_NODE ? root as Document : root.ownerDocument;
}

function pageKindFor(sidebar: HTMLElement): PageKind {
  const pathname = sidebar.ownerDocument.defaultView?.location.pathname ?? '';
  if (pathname.startsWith(SIDEBAR_PAGE_PATH_PREFIXES.area)
    || sidebar.closest(SHARED_SELECTORS.areaPage)) return 'area';
  if (pathname.startsWith(SIDEBAR_PAGE_PATH_PREFIXES.route)
    || sidebar.closest(SHARED_SELECTORS.routePage)) return 'route';
  return 'generic';
}

function labelsFor(kind: PageKind): SidebarLabels {
  if (kind === 'area') return { visible: '다른 지역', accessible: '다른 지역 목록' };
  if (kind === 'route') return { visible: '다른 루트', accessible: '다른 루트 목록' };
  return { visible: '메뉴', accessible: '메뉴' };
}

function usesFinePointer(ownerDocument: Document): boolean {
  const view = ownerDocument.defaultView;
  if (!view?.matchMedia) return Boolean(view && view.innerWidth > 767);
  const narrow = view.matchMedia('(max-width: 767.98px)').matches;
  const coarse = view.matchMedia('(hover: none), (pointer: coarse)').matches;
  const fine = view.matchMedia('(hover: hover) and (pointer: fine)').matches;
  return fine && !coarse && !narrow;
}

function prefersReducedMotion(ownerDocument: Document): boolean {
  return ownerDocument.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

function ensureTitleUnderline(element: HTMLElement): void {
  const style = element.ownerDocument.defaultView?.getComputedStyle(element);
  const width = Number.parseFloat(style?.borderBottomWidth ?? '0');
  if (!style || style.borderBottomStyle === 'none' || width === 0) {
    element.classList.add(UNDERLINE_FALLBACK_CLASS);
  }
}

function focusableElements(surface: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]', 'button:not([disabled])', 'input:not([disabled])',
    'select:not([disabled])', 'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');
  return Array.from(surface.querySelectorAll<HTMLElement>(selector))
    .filter((element) => !element.hidden && element.getAttribute('aria-hidden') !== 'true');
}

function lockBodyScroll(ownerDocument: Document): boolean {
  const body = ownerDocument.body;
  if (!body) return false;
  const existing = BODY_SCROLL_LOCKS.get(ownerDocument);
  if (existing) {
    existing.count += 1;
    return true;
  }
  BODY_SCROLL_LOCKS.set(ownerDocument, {
    body,
    count: 1,
    overflow: body.style.getPropertyValue('overflow'),
    priority: body.style.getPropertyPriority('overflow'),
  });
  body.style.setProperty('overflow', 'hidden');
  return true;
}

function unlockBodyScroll(ownerDocument: Document): void {
  const lock = BODY_SCROLL_LOCKS.get(ownerDocument);
  if (!lock) return;
  lock.count -= 1;
  if (lock.count > 0) return;
  if (lock.overflow) lock.body.style.setProperty('overflow', lock.overflow, lock.priority);
  else lock.body.style.removeProperty('overflow');
  BODY_SCROLL_LOCKS.delete(ownerDocument);
}

export class LeftSidebarToggle {
  private readonly bindings = new Map<HTMLElement, SidebarBinding>();
  private style: HTMLStyleElement | undefined;
  private ownsStyle = false;
  private observer: MutationObserver | undefined;
  private observedRoot: ParentNode | undefined;
  private observedDocument: Document | undefined;
  private observedWindow: Window | undefined;
  private layoutFrame: number | undefined;
  private reconcileQueued = false;
  private idSequence = 0;
  private openBinding: SidebarBinding | undefined;

  mount(root: ParentNode = document): number {
    if (this.observedRoot && this.observedRoot !== root) this.destroy();
    this.observedRoot = root;
    this.ensureStyle(root);
    this.reconcile(root);
    this.ensureObserver(root);
    return this.bindings.size;
  }

  destroy(): void {
    this.observer?.disconnect();
    this.observer = undefined;
    this.reconcileQueued = false;
    this.observedDocument?.removeEventListener('keydown', this.handleDocumentKeydown);
    this.observedDocument?.removeEventListener('pointerdown', this.handleDocumentPointerDown, true);
    this.observedDocument?.removeEventListener('focusin', this.handleDocumentFocusIn);
    this.observedWindow?.removeEventListener('resize', this.handleWindowResize);
    this.observedWindow?.removeEventListener('scroll', this.handleWindowScroll);
    if (this.layoutFrame !== undefined) {
      this.observedWindow?.cancelAnimationFrame(this.layoutFrame);
      this.layoutFrame = undefined;
    }
    this.observedDocument = undefined;
    this.observedWindow = undefined;
    for (const binding of this.bindings.values()) this.restoreBinding(binding);
    this.bindings.clear();
    this.openBinding = undefined;
    if (this.ownsStyle) this.style?.remove();
    this.style = undefined;
    this.ownsStyle = false;
    this.observedRoot = undefined;
  }

  private ensureStyle(root: ParentNode): void {
    const ownerDocument = ownerDocumentOf(root);
    if (!ownerDocument?.head || this.style?.isConnected) return;
    const existing = ownerDocument.head.querySelector<HTMLStyleElement>(`style[${STYLE_ATTRIBUTE}]`);
    if (existing) {
      this.style = existing;
      this.ownsStyle = false;
      return;
    }
    const style = ownerDocument.createElement('style');
    style.setAttribute(STYLE_ATTRIBUTE, 'true');
    style.textContent = STYLE_TEXT;
    ownerDocument.head.append(style);
    this.style = style;
    this.ownsStyle = true;
  }

  private ensureObserver(root: ParentNode): void {
    if (this.observer) return;
    const target = root.nodeType === Node.DOCUMENT_NODE ? (root as Document).documentElement : root;
    if (!(target instanceof Node)) return;
    const ownerDocument = ownerDocumentOf(root);
    if (ownerDocument && this.observedDocument !== ownerDocument) {
      this.observedDocument = ownerDocument;
      this.observedWindow = ownerDocument.defaultView ?? undefined;
      ownerDocument.addEventListener('keydown', this.handleDocumentKeydown);
      ownerDocument.addEventListener('pointerdown', this.handleDocumentPointerDown, true);
      ownerDocument.addEventListener('focusin', this.handleDocumentFocusIn);
      this.observedWindow?.addEventListener('resize', this.handleWindowResize);
      this.observedWindow?.addEventListener('scroll', this.handleWindowScroll, { passive: true });
    }
    const Observer = target.ownerDocument?.defaultView?.MutationObserver ?? MutationObserver;
    this.observer = new Observer(() => this.queueReconcile());
    this.observer.observe(target, { childList: true, subtree: true });
  }

  private queueReconcile(): void {
    if (this.reconcileQueued || !this.observedRoot) return;
    this.reconcileQueued = true;
    queueMicrotask(() => {
      this.reconcileQueued = false;
      if (this.observedRoot) this.reconcile(this.observedRoot);
    });
  }

  private reconcile(root: ParentNode): void {
    for (const [sidebar, binding] of this.bindings) {
      if (!sidebar.isConnected) {
        this.restoreBinding(binding);
        this.bindings.delete(sidebar);
      }
    }
    const sidebars = Array.from(root.querySelectorAll(SHARED_SELECTORS.leftNavigation))
      .filter(isSidebar);
    for (const sidebar of sidebars) {
      if (!this.bindings.has(sidebar)) this.bindSidebar(sidebar);
    }
    this.positionRails();
  }

  private bindSidebar(sidebar: HTMLElement): void {
    const ownerDocument = sidebar.ownerDocument;
    const layout = sidebar.parentElement;
    if (!layout || sidebar.closest(`.${PANEL_CLASS}`)) return;
    const railHost = layout;
    const labels = labelsFor(pageKindFor(sidebar));
    const panelId = this.createId(ownerDocument, 'mpkr-left-sidebar-panel');
    const titleId = this.createId(ownerDocument, 'mpkr-left-sidebar-title');
    const marker = ownerDocument.createComment('mpkr-left-sidebar-position');

    const rail = ownerDocument.createElement('button');
    rail.type = 'button';
    rail.className = RAIL_CLASS;
    rail.setAttribute('aria-controls', panelId);
    rail.setAttribute('aria-expanded', 'false');
    rail.setAttribute('aria-label', `${labels.accessible} 열기`);
    const visualLabel = ownerDocument.createElement('span');
    visualLabel.className = `${RAIL_CLASS}__label`;
    visualLabel.setAttribute('aria-hidden', 'true');
    visualLabel.textContent = labels.visible;
    const chevron = ownerDocument.createElement('span');
    chevron.className = `${RAIL_CLASS}__chevron`;
    chevron.setAttribute('aria-hidden', 'true');
    chevron.textContent = '\u203a';
    const markerContent = ownerDocument.createElement('span');
    markerContent.className = RAIL_MARKER_CLASS;
    markerContent.append(visualLabel, chevron);
    rail.append(markerContent);

    const panel = ownerDocument.createElement('section');
    panel.id = panelId;
    panel.className = PANEL_CLASS;
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-labelledby', titleId);
    const backdrop = ownerDocument.createElement('button');
    backdrop.type = 'button';
    backdrop.className = PANEL_BACKDROP_CLASS;
    backdrop.hidden = true;
    backdrop.tabIndex = -1;
    backdrop.setAttribute('aria-label', `${labels.accessible} 닫기`);
    const surface = ownerDocument.createElement('div');
    surface.className = PANEL_SURFACE_CLASS;
    surface.tabIndex = -1;
    const header = ownerDocument.createElement('header');
    header.className = [
      `${PANEL_CLASS}__header`,
      SHARED_SELECTORS.titleWithBorderBottomClass,
      'mb-1',
    ].join(' ');
    const title = ownerDocument.createElement('h2');
    title.id = titleId;
    title.className = `${PANEL_CLASS}__title`;
    title.textContent = labels.visible;
    const closeButton = ownerDocument.createElement('button');
    closeButton.type = 'button';
    closeButton.className = PANEL_CLOSE_CLASS;
    closeButton.setAttribute('aria-label', `${labels.accessible} 닫기`);
    closeButton.title = `${labels.accessible} 닫기`;
    closeButton.textContent = '\u00d7';
    header.append(title, closeButton);
    const content = ownerDocument.createElement('div');
    content.className = `${PANEL_CLASS}__content`;
    surface.append(header, content);
    panel.append(backdrop, surface);

    const binding: SidebarBinding = {
      sidebar, layout, railHost, marker, rail, panel, surface, content, closeButton,
      backdrop, labels, originalLayoutClassName: layout.getAttribute('class'),
      originalLayoutStyle: layout.getAttribute('style'),
      originalGutterValue: layout.style.getPropertyValue(LAYOUT_GUTTER_PROPERTY),
      originalGutterPriority: layout.style.getPropertyPriority(LAYOUT_GUTTER_PROPERTY),
      openTimer: undefined, closeTimer: undefined, motionTimer: undefined, railHovered: false,
      panelHovered: false, pinned: false, mobile: false, scrollLocked: false,
      suppressFocusOpen: false,
      handleRailMouseEnter: () => this.handleRailMouseEnter(binding),
      handleRailMouseLeave: () => this.handleRailMouseLeave(binding),
      handleRailFocus: () => this.handleRailFocus(binding),
      handleRailClick: (event) => this.handleRailClick(binding, event),
      handlePanelMouseEnter: () => this.handlePanelMouseEnter(binding),
      handlePanelMouseLeave: () => this.handlePanelMouseLeave(binding),
      handlePanelFocusIn: () => this.clearCloseTimer(binding),
      handleCloseClick: () => this.close(binding, true),
      handleBackdropClick: () => this.close(binding, true),
    };

    this.bindings.set(sidebar, binding);
    registerRailHost(railHost);
    layout.classList.add(LAYOUT_CLASS);
    layout.insertBefore(marker, sidebar);
    content.append(sidebar);
    layout.append(panel);
    railHost.append(rail);
    ensureTitleUnderline(header);
    rail.addEventListener('mouseenter', binding.handleRailMouseEnter);
    rail.addEventListener('mouseleave', binding.handleRailMouseLeave);
    rail.addEventListener('focus', binding.handleRailFocus);
    rail.addEventListener('click', binding.handleRailClick);
    surface.addEventListener('mouseenter', binding.handlePanelMouseEnter);
    surface.addEventListener('mouseleave', binding.handlePanelMouseLeave);
    surface.addEventListener('focusin', binding.handlePanelFocusIn);
    closeButton.addEventListener('click', binding.handleCloseClick);
    backdrop.addEventListener('click', binding.handleBackdropClick);
  }

  private handleRailMouseEnter(binding: SidebarBinding): void {
    binding.railHovered = true;
    this.clearCloseTimer(binding);
    if (usesFinePointer(binding.sidebar.ownerDocument)) this.scheduleOpen(binding, false);
  }

  private handleRailMouseLeave(binding: SidebarBinding): void {
    binding.railHovered = false;
    this.clearOpenTimer(binding);
    this.scheduleClose(binding);
  }

  private handleRailFocus(binding: SidebarBinding): void {
    if (binding.suppressFocusOpen) {
      binding.suppressFocusOpen = false;
      return;
    }
    this.scheduleOpen(binding, true);
  }

  private handlePanelMouseEnter(binding: SidebarBinding): void {
    binding.panelHovered = true;
    this.clearCloseTimer(binding);
  }

  private handlePanelMouseLeave(binding: SidebarBinding): void {
    binding.panelHovered = false;
    this.scheduleClose(binding);
  }

  private handleRailClick(binding: SidebarBinding, event: MouseEvent): void {
    this.clearOpenTimer(binding);
    const finePointer = usesFinePointer(binding.sidebar.ownerDocument);
    if (!finePointer) {
      if (this.isOpen(binding)) this.close(binding, true);
      else this.open(binding, true);
      return;
    }
    if (!this.isOpen(binding)) {
      binding.pinned = true;
      this.open(binding, event.detail === 0);
      return;
    }
    binding.pinned = !binding.pinned;
    if (!binding.pinned) this.scheduleClose(binding);
  }

  private scheduleOpen(binding: SidebarBinding, focusPanel: boolean): void {
    this.clearOpenTimer(binding);
    if (this.isOpen(binding)) return;
    binding.openTimer = setTimeout(() => {
      binding.openTimer = undefined;
      const ownerDocument = binding.sidebar.ownerDocument;
      if (!binding.railHovered && ownerDocument.activeElement !== binding.rail) return;
      this.open(binding, focusPanel);
    }, OPEN_DELAY_MS);
  }

  private scheduleClose(binding: SidebarBinding): void {
    this.clearCloseTimer(binding);
    if (!this.isOpen(binding) || binding.pinned || binding.mobile) return;
    binding.closeTimer = setTimeout(() => {
      binding.closeTimer = undefined;
      const active = binding.sidebar.ownerDocument.activeElement;
      if (binding.railHovered || binding.panelHovered
        || active === binding.rail || binding.surface.contains(active)) return;
      this.close(binding, false);
    }, CLOSE_DELAY_MS);
  }

  private open(binding: SidebarBinding, focusPanel: boolean): void {
    if (this.openBinding && this.openBinding !== binding) this.close(this.openBinding, false);
    this.clearOpenTimer(binding);
    this.clearCloseTimer(binding);
    this.clearMotionTimer(binding);
    this.openBinding = binding;
    binding.mobile = !usesFinePointer(binding.sidebar.ownerDocument);
    this.positionBindings([binding]);
    binding.panel.hidden = false;
    binding.panel.dataset.mpkrState = 'open';
    binding.panel.removeAttribute('aria-hidden');
    binding.surface.removeAttribute('inert');
    binding.rail.removeAttribute('data-mpkr-motion');
    binding.backdrop.hidden = !binding.mobile;
    binding.rail.setAttribute('aria-expanded', 'true');
    binding.rail.setAttribute('aria-label', `${binding.labels.accessible} 닫기`);
    if (binding.mobile) {
      binding.panel.setAttribute('aria-modal', 'true');
      binding.scrollLocked = lockBodyScroll(binding.sidebar.ownerDocument);
    } else {
      binding.panel.removeAttribute('aria-modal');
    }
    if (focusPanel || binding.mobile) binding.closeButton.focus();
  }

  private close(binding: SidebarBinding, restoreFocus: boolean): void {
    this.clearOpenTimer(binding);
    this.clearCloseTimer(binding);
    if (!this.isOpen(binding)) return;
    this.clearMotionTimer(binding);
    binding.panel.dataset.mpkrState = 'closing';
    binding.panel.setAttribute('aria-hidden', 'true');
    binding.surface.setAttribute('inert', '');
    binding.rail.dataset.mpkrMotion = 'closing';
    binding.panel.removeAttribute('aria-modal');
    binding.rail.setAttribute('aria-expanded', 'false');
    binding.rail.setAttribute('aria-label', `${binding.labels.accessible} 열기`);
    binding.pinned = false;
    binding.mobile = false;
    if (binding.scrollLocked) {
      unlockBodyScroll(binding.sidebar.ownerDocument);
      binding.scrollLocked = false;
    }
    if (this.openBinding === binding) this.openBinding = undefined;
    if (restoreFocus && binding.rail.isConnected) {
      binding.suppressFocusOpen = binding.sidebar.ownerDocument.activeElement !== binding.rail;
      binding.rail.focus();
    }
    const finish = (): void => {
      binding.motionTimer = undefined;
      binding.panel.hidden = true;
      binding.backdrop.hidden = true;
      binding.panel.removeAttribute('data-mpkr-state');
      binding.panel.removeAttribute('aria-hidden');
      binding.surface.removeAttribute('inert');
      binding.rail.removeAttribute('data-mpkr-motion');
    };
    if (prefersReducedMotion(binding.sidebar.ownerDocument)) finish();
    else binding.motionTimer = setTimeout(finish, PANEL_MOTION_MS);
  }

  private readonly handleDocumentKeydown = (event: KeyboardEvent): void => {
    const binding = this.openBinding;
    if (!binding) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close(binding, true);
      return;
    }
    if (event.key !== 'Tab' || !binding.mobile) return;
    const focusable = focusableElements(binding.surface);
    if (focusable.length === 0) {
      event.preventDefault();
      binding.surface.focus();
      return;
    }
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    const active = binding.sidebar.ownerDocument.activeElement;
    if (event.shiftKey && (active === first || !binding.surface.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  private readonly handleDocumentPointerDown = (event: PointerEvent): void => {
    const binding = this.openBinding;
    const target = event.target;
    if (!binding || binding.mobile || !binding.pinned || !(target instanceof Node)) return;
    if (!binding.rail.contains(target) && !binding.surface.contains(target)) {
      this.close(binding, false);
    }
  };

  private readonly handleDocumentFocusIn = (event: FocusEvent): void => {
    const binding = this.openBinding;
    const target = event.target;
    if (!binding || binding.mobile || binding.pinned || !(target instanceof Node)) return;
    if (!binding.rail.contains(target) && !binding.surface.contains(target)) {
      this.close(binding, false);
    }
  };

  private readonly handleWindowResize = (): void => {
    this.scheduleLayoutUpdate();
  };

  private readonly handleWindowScroll = (): void => {
    this.scheduleLayoutUpdate();
  };

  private scheduleLayoutUpdate(): void {
    const view = this.observedWindow;
    if (!view || this.layoutFrame !== undefined) return;
    this.layoutFrame = view.requestAnimationFrame(() => {
      this.layoutFrame = undefined;
      this.positionRails();
    });
  }

  private positionRails(): void {
    this.positionBindings(this.bindings.values());
  }

  private positionBindings(bindings: Iterable<SidebarBinding>): void {
    const measurements = Array.from(bindings, (binding) => this.measureBinding(binding));
    for (const measurement of measurements) this.applyMeasurement(measurement);
  }

  private measureBinding(binding: SidebarBinding): SidebarLayoutMeasurement {
    const maxRailWidth = usesFinePointer(binding.sidebar.ownerDocument)
      ? DESKTOP_RAIL_MAX_WIDTH_PX
      : MOBILE_RAIL_MAX_WIDTH_PX;
    const hostRect = binding.railHost.getBoundingClientRect();
    const hostLeft = Math.max(0, hostRect.left);
    const hasOutsideSpace = hostLeft >= maxRailWidth + RAIL_GAP_PX;
    const view = binding.sidebar.ownerDocument.defaultView;
    const markerHeight = usesFinePointer(binding.sidebar.ownerDocument) ? 156 : 124;
    const visibleTop = Math.max(0, hostRect.top);
    const visibleBottom = Math.min(view?.innerHeight ?? hostRect.bottom, hostRect.bottom);
    const centeredTop = ((visibleTop + Math.max(visibleTop, visibleBottom) - markerHeight) / 2)
      - hostRect.top;
    const maxMarkerTop = Math.max(0, hostRect.height - markerHeight);
    const panelTop = Math.max(0, Math.min(-hostRect.top, hostRect.height));
    const panelBottom = Math.max(
      panelTop,
      Math.min(hostRect.height, (view?.innerHeight ?? hostRect.bottom) - hostRect.top),
    );

    return {
      binding,
      hasOutsideSpace,
      markerTop: Math.round(Math.max(0, Math.min(centeredTop, maxMarkerTop))),
      panelTop: Math.round(panelTop),
      panelHeight: Math.round(Math.max(0, panelBottom - panelTop)),
      railLeft: hasOutsideSpace ? -(RAIL_GAP_PX + maxRailWidth) : 0,
      railGutter: maxRailWidth + RAIL_GAP_PX,
    };
  }

  private applyMeasurement(measurement: SidebarLayoutMeasurement): void {
    const {
      binding, hasOutsideSpace, markerTop, panelTop, panelHeight, railLeft, railGutter,
    } = measurement;
    binding.rail.style.setProperty(RAIL_MARKER_TOP_PROPERTY, `${markerTop}px`);
    binding.panel.style.setProperty(PANEL_TOP_PROPERTY, `${panelTop}px`);
    binding.panel.style.setProperty(PANEL_HEIGHT_PROPERTY, `${panelHeight}px`);

    binding.layout.classList.toggle(LAYOUT_GUTTER_CLASS, !hasOutsideSpace);
    if (hasOutsideSpace) {
      if (binding.originalGutterValue) {
        binding.layout.style.setProperty(
          LAYOUT_GUTTER_PROPERTY,
          binding.originalGutterValue,
          binding.originalGutterPriority,
        );
      } else {
        binding.layout.style.removeProperty(LAYOUT_GUTTER_PROPERTY);
      }
      binding.rail.style.setProperty(
        RAIL_LEFT_PROPERTY,
        `${railLeft}px`,
      );
      return;
    }

    binding.layout.style.setProperty(
      LAYOUT_GUTTER_PROPERTY,
      `${railGutter}px`,
    );
    binding.rail.style.setProperty(RAIL_LEFT_PROPERTY, `${railLeft}px`);
  }

  private isOpen(binding: SidebarBinding): boolean {
    return binding.rail.getAttribute('aria-expanded') === 'true';
  }

  private clearOpenTimer(binding: SidebarBinding): void {
    if (binding.openTimer === undefined) return;
    clearTimeout(binding.openTimer);
    binding.openTimer = undefined;
  }

  private clearCloseTimer(binding: SidebarBinding): void {
    if (binding.closeTimer === undefined) return;
    clearTimeout(binding.closeTimer);
    binding.closeTimer = undefined;
  }

  private clearMotionTimer(binding: SidebarBinding): void {
    if (binding.motionTimer === undefined) return;
    clearTimeout(binding.motionTimer);
    binding.motionTimer = undefined;
  }

  private restoreBinding(binding: SidebarBinding): void {
    this.clearOpenTimer(binding);
    this.clearCloseTimer(binding);
    this.clearMotionTimer(binding);
    binding.rail.removeEventListener('mouseenter', binding.handleRailMouseEnter);
    binding.rail.removeEventListener('mouseleave', binding.handleRailMouseLeave);
    binding.rail.removeEventListener('focus', binding.handleRailFocus);
    binding.rail.removeEventListener('click', binding.handleRailClick);
    binding.surface.removeEventListener('mouseenter', binding.handlePanelMouseEnter);
    binding.surface.removeEventListener('mouseleave', binding.handlePanelMouseLeave);
    binding.surface.removeEventListener('focusin', binding.handlePanelFocusIn);
    binding.closeButton.removeEventListener('click', binding.handleCloseClick);
    binding.backdrop.removeEventListener('click', binding.handleBackdropClick);
    if (binding.scrollLocked) {
      unlockBodyScroll(binding.sidebar.ownerDocument);
      binding.scrollLocked = false;
    }
    binding.rail.remove();
    unregisterRailHost(binding.railHost);
    if (binding.marker.isConnected) binding.marker.replaceWith(binding.sidebar);
    else binding.layout.append(binding.sidebar);
    binding.panel.remove();
    if (binding.originalLayoutClassName === null) binding.layout.removeAttribute('class');
    else binding.layout.setAttribute('class', binding.originalLayoutClassName);
    if (binding.originalLayoutStyle === null) binding.layout.removeAttribute('style');
    else binding.layout.setAttribute('style', binding.originalLayoutStyle);
  }

  private createId(ownerDocument: Document, prefix: string): string {
    let id: string;
    do {
      this.idSequence += 1;
      id = `${prefix}-${this.idSequence}`;
    } while (ownerDocument.getElementById(id));
    return id;
  }
}
