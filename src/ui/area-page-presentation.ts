const CONTAINER_CLASS = 'mp-korea-area-photo';

const STYLE_TEXT = `
#climb-area-page .${CONTAINER_CLASS} {
  width: min(360px, 100%);
  max-width: 100%;
}

#climb-area-page .${CONTAINER_CLASS} #photo-carousel,
#climb-area-page .${CONTAINER_CLASS} #photo-carousel .carousel-item,
#climb-area-page .${CONTAINER_CLASS} #photo-carousel .photo-link {
  width: 100%;
  height: auto;
  aspect-ratio: 6 / 5;
}

@media (max-width: 575px) {
  #climb-area-page .${CONTAINER_CLASS} {
    float: none !important;
    width: 100%;
    margin-left: 0 !important;
  }
}
`;

export class AreaPagePresentation {
  private container: HTMLElement | undefined;
  private style: HTMLStyleElement | undefined;

  mount(root: ParentNode = document): boolean {
    if (this.container?.isConnected && this.style?.isConnected) {
      return true;
    }

    const carousel = root.querySelector<HTMLElement>('#climb-area-page #photo-carousel');
    const container = carousel?.parentElement;
    if (
      !container
      || !container.classList.contains('float-xs-right')
      || !container.classList.contains('ml-1')
    ) {
      return false;
    }

    const style = document.createElement('style');
    style.dataset.mpKoreaAreaPresentation = 'photo-size';
    style.textContent = STYLE_TEXT;
    document.head.append(style);
    container.classList.add(CONTAINER_CLASS);

    this.container = container;
    this.style = style;
    return true;
  }

  destroy(): void {
    this.container?.classList.remove(CONTAINER_CLASS);
    this.style?.remove();
    this.container = undefined;
    this.style = undefined;
  }
}
