const BUTTON_CLASS = 'mpkr-left-sidebar-toggle';
const SIDEBAR_CLASS = 'mpkr-left-sidebar';
const COLLAPSED_CLASS = 'mpkr-left-sidebar--collapsed';
const MAIN_EXPANDED_CLASS = 'mpkr-left-sidebar-main--expanded';
const LAYOUT_CLASS = 'mpkr-left-sidebar-layout';
const DRAWER_OPEN_CLASS = 'mpkr-left-sidebar--drawer-open';
const BACKDROP_CLASS = 'mpkr-left-sidebar-backdrop';
const STYLE_ATTRIBUTE = 'data-mpkr-left-sidebar-toggle-style';

const STYLE_TEXT = `
.${SIDEBAR_CLASS} > .${BUTTON_CLASS} {
  --mpkr-sidebar-control: #184f35;
  --mpkr-sidebar-control-border: #7b8b82;
  --mpkr-sidebar-focus: #0645ad;
  align-items: center;
  background: #fff;
  border: 1px solid var(--mpkr-sidebar-control-border);
  border-radius: 4px;
  color: var(--mpkr-sidebar-control);
  cursor: pointer;
  display: inline-flex;
  height: 44px;
  justify-content: center;
  margin: 0 0 0.65rem;
  padding: 0;
  position: relative;
  touch-action: manipulation;
  transition: background-color 140ms ease, border-color 140ms ease;
  width: 44px;
  z-index: 2;
}

.${SIDEBAR_CLASS} > .${BUTTON_CLASS}:hover {
  background: #edf5f0;
  border-color: #397052;
}

.${SIDEBAR_CLASS} > .${BUTTON_CLASS}:focus-visible {
  border-color: var(--mpkr-sidebar-focus);
  outline: 2px solid var(--mpkr-sidebar-focus);
  outline-offset: 2px;
}

.${BUTTON_CLASS}__icon,
.${BUTTON_CLASS}__icon::before,
.${BUTTON_CLASS}__icon::after {
  background: currentColor;
  border-radius: 1px;
  display: block;
  height: 2px;
  width: 19px;
}

.${BUTTON_CLASS}__icon {
  position: relative;
  transition: background-color 140ms ease;
}

.${BUTTON_CLASS}__icon::before,
.${BUTTON_CLASS}__icon::after {
  content: '';
  left: 0;
  position: absolute;
  transition: top 140ms ease, transform 140ms ease;
}

.${BUTTON_CLASS}__icon::before {
  top: -6px;
}

.${BUTTON_CLASS}__icon::after {
  top: 6px;
}

.${BUTTON_CLASS}[aria-expanded="true"] .${BUTTON_CLASS}__icon {
  background: transparent;
}

.${BUTTON_CLASS}[aria-expanded="true"] .${BUTTON_CLASS}__icon::before {
  top: 0;
  transform: rotate(45deg);
}

.${BUTTON_CLASS}[aria-expanded="true"] .${BUTTON_CLASS}__icon::after {
  top: 0;
  transform: rotate(-45deg);
}

.${SIDEBAR_CLASS}.${COLLAPSED_CLASS} > :not(.${BUTTON_CLASS}) {
  display: none !important;
}

.${SIDEBAR_CLASS}.${COLLAPSED_CLASS} > .${BUTTON_CLASS} {
  margin-bottom: 0;
}

.${BACKDROP_CLASS} {
  display: none;
}

@media (min-width: 768px) {
  .${SIDEBAR_CLASS}.${COLLAPSED_CLASS} {
    flex: 0 0 44px !important;
    max-width: 44px !important;
    padding-left: 2px !important;
    padding-right: 2px !important;
    width: 44px !important;
  }

  .${MAIN_EXPANDED_CLASS} {
    flex: 0 0 calc(100% - 52px) !important;
    max-width: calc(100% - 52px) !important;
    width: calc(100% - 52px) !important;
  }
}

@media (max-width: 767.98px) {
  .${SIDEBAR_CLASS}.${COLLAPSED_CLASS},
  .${MAIN_EXPANDED_CLASS} {
    flex-basis: 100% !important;
    max-width: 100% !important;
    width: 100% !important;
  }

  .${SIDEBAR_CLASS}.${COLLAPSED_CLASS} {
    min-height: 44px;
  }

  .${SIDEBAR_CLASS}.${DRAWER_OPEN_CLASS} {
    background: #fff;
    bottom: 0;
    box-shadow: 8px 0 24px rgba(0, 0, 0, 0.18);
    box-sizing: border-box;
    left: 0;
    max-width: min(88vw, 360px) !important;
    overflow-y: auto;
    padding: 16px !important;
    position: fixed;
    top: 0;
    width: min(88vw, 360px) !important;
    z-index: 1041;
  }

  .${BACKDROP_CLASS}:not([hidden]) {
    background: rgba(0, 0, 0, 0.42);
    border: 0;
    bottom: 0;
    cursor: default;
    display: block;
    left: 0;
    padding: 0;
    position: fixed;
    right: 0;
    top: 0;
    z-index: 1040;
  }
}

@media (prefers-reduced-motion: reduce) {
  .${SIDEBAR_CLASS} > .${BUTTON_CLASS} {
    transition: none;
  }


  .${BUTTON_CLASS}__icon,
  .${BUTTON_CLASS}__icon::before,
  .${BUTTON_CLASS}__icon::after {
    transition: none;
  }
}
`;

interface AttributeSnapshot {
  className: string | null;
  id: string | null;
}

interface SidebarBinding {
  sidebar: HTMLElement;
  layout: HTMLElement;
  mainElements: HTMLElement[];
  button: HTMLButtonElement;
  backdrop: HTMLButtonElement;
  sidebarSnapshot: AttributeSnapshot;
  layoutClassName: string | null;
  mainClassNames: Map<HTMLElement, string | null>;
  handleClick: () => void;
  handleBackdropClick: () => void;
  handleDocumentKeydown: (event: KeyboardEvent) => void;
}

function restoreAttribute(
  element: HTMLElement,
  name: 'class' | 'id',
  value: string | null,
): void {
  if (value === null) {
    element.removeAttribute(name);
  } else {
    element.setAttribute(name, value);
  }
}

function isSidebar(element: Element): element is HTMLElement {
  return element instanceof HTMLElement
    && element.classList.contains('left-nav')
    && Boolean(element.querySelector('.mp-sidebar'));
}

function isMainColumn(element: Element, sidebar: HTMLElement): element is HTMLElement {
  if (!(element instanceof HTMLElement) || element === sidebar) {
    return false;
  }

  return element.classList.contains('main-content')
    || Array.from(element.classList).some((className) => (
      /^col-(?:xs|sm|md|lg|xl)-(?:[7-9]|1[0-2])$/.test(className)
    ));
}

function ownerDocumentOf(root: ParentNode): Document | null {
  return root.nodeType === Node.DOCUMENT_NODE
    ? root as Document
    : root.ownerDocument;
}

export class LeftSidebarToggle {
  private readonly bindings = new Map<HTMLElement, SidebarBinding>();
  private style: HTMLStyleElement | undefined;
  private observer: MutationObserver | undefined;
  private observedRoot: ParentNode | undefined;
  private reconcileQueued = false;
  private idSequence = 0;

  mount(root: ParentNode = document): number {
    if (this.observedRoot && this.observedRoot !== root) {
      this.destroy();
    }

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

    for (const binding of this.bindings.values()) {
      this.restoreBinding(binding);
    }
    this.bindings.clear();

    this.style?.remove();
    this.style = undefined;
    this.observedRoot = undefined;
  }

  private ensureStyle(root: ParentNode): void {
    const ownerDocument = ownerDocumentOf(root);
    if (!ownerDocument?.head || this.style?.isConnected) {
      return;
    }

    const existing = ownerDocument.head.querySelector<HTMLStyleElement>(
      `style[${STYLE_ATTRIBUTE}]`,
    );
    if (existing) {
      this.style = existing;
      return;
    }

    const style = ownerDocument.createElement('style');
    style.setAttribute(STYLE_ATTRIBUTE, 'true');
    style.textContent = STYLE_TEXT;
    ownerDocument.head.append(style);
    this.style = style;
  }

  private ensureObserver(root: ParentNode): void {
    if (this.observer) {
      return;
    }

    const target = root.nodeType === Node.DOCUMENT_NODE
      ? (root as Document).documentElement
      : root;
    if (!(target instanceof Node)) {
      return;
    }

    const Observer = target.ownerDocument?.defaultView?.MutationObserver ?? MutationObserver;
    this.observer = new Observer(() => this.queueReconcile());
    this.observer.observe(target, { childList: true, subtree: true });
  }

  private queueReconcile(): void {
    if (this.reconcileQueued || !this.observedRoot) {
      return;
    }

    this.reconcileQueued = true;
    queueMicrotask(() => {
      this.reconcileQueued = false;
      if (this.observedRoot) {
        this.reconcile(this.observedRoot);
      }
    });
  }

  private reconcile(root: ParentNode): void {
    for (const [sidebar, binding] of this.bindings) {
      if (!sidebar.isConnected || !isSidebar(sidebar)) {
        this.restoreBinding(binding);
        this.bindings.delete(sidebar);
      }
    }

    const sidebars = Array.from(root.querySelectorAll('.left-nav')).filter(isSidebar);
    for (const sidebar of sidebars) {
      if (!this.bindings.has(sidebar)) {
        this.bindSidebar(sidebar);
      }
    }
  }

  private bindSidebar(sidebar: HTMLElement): void {
    const layout = sidebar.parentElement;
    if (!layout) {
      return;
    }

    const mainElements = Array.from(layout.children)
      .filter((element) => isMainColumn(element, sidebar));
    if (mainElements.length === 0) {
      return;
    }

    const ownerDocument = sidebar.ownerDocument;
    const sidebarSnapshot: AttributeSnapshot = {
      className: sidebar.getAttribute('class'),
      id: sidebar.getAttribute('id'),
    };
    const layoutClassName = layout.getAttribute('class');
    const mainClassNames = new Map(
      mainElements.map((element) => [element, element.getAttribute('class')]),
    );

    if (!sidebar.id) {
      sidebar.id = this.createSidebarId(ownerDocument);
    }
    sidebar.classList.add(SIDEBAR_CLASS);
    layout.classList.add(LAYOUT_CLASS);

    const button = ownerDocument.createElement('button');
    button.type = 'button';
    button.className = BUTTON_CLASS;
    button.setAttribute('aria-controls', sidebar.id);
    button.setAttribute('aria-expanded', 'true');
    button.setAttribute('aria-label', '사이드바 닫기');
    button.title = '사이드바 닫기';

    const icon = ownerDocument.createElement('span');
    icon.className = `${BUTTON_CLASS}__icon`;
    icon.setAttribute('aria-hidden', 'true');
    button.append(icon);

    const backdrop = ownerDocument.createElement('button');
    backdrop.type = 'button';
    backdrop.className = BACKDROP_CLASS;
    backdrop.hidden = true;
    backdrop.tabIndex = -1;
    backdrop.setAttribute('aria-label', '사이드바 닫기');

    const setExpanded = (expanded: boolean, asDrawer = false): void => {
      sidebar.classList.toggle(COLLAPSED_CLASS, !expanded);
      sidebar.classList.toggle(DRAWER_OPEN_CLASS, expanded && asDrawer);
      for (const mainElement of mainElements) {
        mainElement.classList.toggle(MAIN_EXPANDED_CLASS, !expanded);
      }

      const label = expanded ? '사이드바 닫기' : '사이드바 열기';
      button.setAttribute('aria-expanded', String(expanded));
      button.setAttribute('aria-label', label);
      button.title = label;
      backdrop.hidden = !(expanded && asDrawer);
    };

    const isNarrowViewport = (): boolean => {
      const view = ownerDocument.defaultView;
      return view?.matchMedia?.('(max-width: 767.98px)').matches
        ?? Boolean(view && view.innerWidth <= 767);
    };

    const handleClick = (): void => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      setExpanded(!expanded, !expanded && isNarrowViewport());
    };

    const closeDrawer = (): void => {
      if (!sidebar.classList.contains(DRAWER_OPEN_CLASS)) {
        return;
      }
      setExpanded(false);
      button.focus();
    };

    const handleBackdropClick = (): void => closeDrawer();
    const handleDocumentKeydown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        closeDrawer();
      }
    };

    button.addEventListener('click', handleClick);
    backdrop.addEventListener('click', handleBackdropClick);
    ownerDocument.addEventListener('keydown', handleDocumentKeydown);
    sidebar.prepend(button);
    layout.append(backdrop);
    this.bindings.set(sidebar, {
      sidebar,
      layout,
      mainElements,
      button,
      backdrop,
      sidebarSnapshot,
      layoutClassName,
      mainClassNames,
      handleClick,
      handleBackdropClick,
      handleDocumentKeydown,
    });
  }

  private restoreBinding(binding: SidebarBinding): void {
    binding.button.removeEventListener('click', binding.handleClick);
    binding.backdrop.removeEventListener('click', binding.handleBackdropClick);
    binding.sidebar.ownerDocument.removeEventListener('keydown', binding.handleDocumentKeydown);
    binding.button.remove();
    binding.backdrop.remove();
    restoreAttribute(binding.sidebar, 'class', binding.sidebarSnapshot.className);
    restoreAttribute(binding.sidebar, 'id', binding.sidebarSnapshot.id);
    restoreAttribute(binding.layout, 'class', binding.layoutClassName);
    for (const [mainElement, className] of binding.mainClassNames) {
      restoreAttribute(mainElement, 'class', className);
    }
  }

  private createSidebarId(ownerDocument: Document): string {
    let id: string;
    do {
      this.idSequence += 1;
      id = `mpkr-left-sidebar-${this.idSequence}`;
    } while (ownerDocument.getElementById(id));
    return id;
  }
}
