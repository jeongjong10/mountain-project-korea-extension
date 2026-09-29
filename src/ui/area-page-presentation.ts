import { AREA_SELECTORS } from '../sites/mountain-project/contract/selectors/area';

const CONTAINER_CLASS = 'mpkr-area-photo';
const LEGACY_CONTAINER_CLASS = 'mp-korea-area-photo';
const STYLE_ATTRIBUTE = 'data-mpkr-area-presentation';
const LEGACY_STYLE_SELECTOR = 'style[data-mp-korea-area-presentation]';

const STYLE_TEXT = `
${AREA_SELECTORS.page} .${CONTAINER_CLASS} {
  width: min(360px, 100%);
  max-width: 100%;
}

${AREA_SELECTORS.page} .${CONTAINER_CLASS} ${AREA_SELECTORS.photoCarouselRelative},
${AREA_SELECTORS.page} .${CONTAINER_CLASS} ${AREA_SELECTORS.photoCarouselRelative} .carousel-item,
${AREA_SELECTORS.page} .${CONTAINER_CLASS} ${AREA_SELECTORS.photoCarouselRelative} .photo-link {
  width: 100%;
  height: auto;
  aspect-ratio: 6 / 5;
}

@media (max-width: 575px) {
  ${AREA_SELECTORS.page} .${CONTAINER_CLASS} {
    float: none !important;
    width: 100%;
    margin-left: 0 !important;
  }
}
`;

export class AreaPagePresentation {
  private container: HTMLElement | undefined;
  private containerClassName: string | null | undefined;
  private style: HTMLStyleElement | undefined;
  private observer: MutationObserver | undefined;
  private page: HTMLElement | undefined;

  mount(root: ParentNode = document): boolean {
    const page = root instanceof HTMLElement && root.matches(AREA_SELECTORS.page)
      ? root
      : root.querySelector<HTMLElement>(AREA_SELECTORS.page);
    if (!page) {
      return false;
    }
    if (this.page && this.page !== page) {
      this.destroy();
    }
    this.page = page;
    this.reconcile();
    this.ensureObserver();
    return Boolean(this.container);
  }

  destroy(): void {
    this.observer?.disconnect();
    this.observer = undefined;
    this.releaseContainer();
    this.style?.remove();
    this.style = undefined;
    this.page = undefined;
  }

  private reconcile(): void {
    if (!this.page) {
      return;
    }
    const carousel = this.page.querySelector<HTMLElement>(
      AREA_SELECTORS.photoCarouselRelative,
    );
    const container = carousel?.parentElement;
    if (
      !container
      || !AREA_SELECTORS.photoContainerClasses.every((className) => (
        container.classList.contains(className)
      ))
    ) {
      this.releaseContainer();
      return;
    }
    if (this.container === container && this.style?.isConnected) {
      return;
    }
    this.releaseContainer();

    this.containerClassName = this.cleanBaselineClassName(container);
    container.classList.remove(LEGACY_CONTAINER_CLASS);
    container.classList.add(CONTAINER_CLASS);
    this.container = container;
    this.ensureStyle(container.ownerDocument);
  }

  private cleanBaselineClassName(container: HTMLElement): string | null {
    const classes = Array.from(container.classList)
      .filter((className) => ![CONTAINER_CLASS, LEGACY_CONTAINER_CLASS].includes(className));
    return classes.length > 0 ? classes.join(' ') : null;
  }

  private releaseContainer(): void {
    if (this.container) {
      if (this.containerClassName === null) {
        this.container.removeAttribute('class');
      } else if (this.containerClassName !== undefined) {
        this.container.setAttribute('class', this.containerClassName);
      }
    }
    this.container = undefined;
    this.containerClassName = undefined;
  }

  private ensureStyle(ownerDocument: Document): void {
    if (this.style?.isConnected) {
      return;
    }
    ownerDocument.querySelectorAll(
      `${LEGACY_STYLE_SELECTOR}, style[${STYLE_ATTRIBUTE}]`,
    ).forEach((style) => style.remove());
    const style = ownerDocument.createElement('style');
    style.setAttribute(STYLE_ATTRIBUTE, 'true');
    style.textContent = STYLE_TEXT;
    ownerDocument.head.append(style);
    this.style = style;
  }

  private ensureObserver(): void {
    if (this.observer || !this.page) {
      return;
    }
    const Observer = this.page.ownerDocument.defaultView?.MutationObserver ?? MutationObserver;
    this.observer = new Observer(() => this.reconcile());
    this.observer.observe(this.page, { childList: true, subtree: true });
  }
}
