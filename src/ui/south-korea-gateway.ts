import { UI } from './design-tokens';
import { SOUTH_KOREA_AREA_URL } from '../sites/mountain-project/contract/regions/south-korea';
import { MAIN_SELECTORS } from '../sites/mountain-project/contract/selectors/main';
import { GUIDEBOOK_GATEWAY_HEADINGS } from '../sites/mountain-project/contract/text/main';

const GATEWAY_CLASS = 'mpkr-south-korea-gateway';
const STYLE_ATTRIBUTE = 'data-mpkr-south-korea-gateway-style';
const HOST_ATTRIBUTE = 'data-mpkr-south-korea-gateway';
const GATEWAY_SUBTITLE = 'South Korea의 지역과 루트를 한국어로 살펴보세요.';

const GATEWAY_STYLES = `
[${HOST_ATTRIBUTE}="true"] {
  --mpkr-gateway-arrow-rail-width: 3.25rem;
  --mpkr-gateway-dark: #27313b;
  --mpkr-gateway-foreground: #111;
  --mpkr-gateway-hover-foreground: ${UI.color.surface};
  --mpkr-gateway-overlay: rgba(0, 0, 0, 0.80);
  --mpkr-gateway-surface: ${UI.color.surfaceSubtle};
  background: var(--mpkr-gateway-surface);
  color: var(--mpkr-gateway-foreground);
  cursor: pointer;
  outline: 1px solid ${UI.color.link};
  outline-offset: -1px;
  position: relative;
  transition: background-color ${UI.motion.fast}, color ${UI.motion.fast}, outline-color ${UI.motion.fast};
}

[${HOST_ATTRIBUTE}="true"] > :not(.${GATEWAY_CLASS}__link) {
  visibility: hidden !important;
}

[${HOST_ATTRIBUTE}="true"]:focus-within {
  background: var(--mpkr-gateway-dark);
  color: var(--mpkr-gateway-hover-foreground);
}

[${HOST_ATTRIBUTE}="true"]:active {
  background: #1d252d;
}

.${GATEWAY_CLASS}__link {
  align-items: center;
  box-sizing: border-box;
  color: var(--mpkr-gateway-foreground);
  cursor: pointer;
  display: flex;
  font: inherit;
  inset: 0;
  justify-content: center;
  padding: 0;
  position: absolute;
  text-decoration: none;
  touch-action: manipulation;
  z-index: 1;
}

.${GATEWAY_CLASS}__link:hover,
.${GATEWAY_CLASS}__link:focus,
.${GATEWAY_CLASS}__link:active {
  color: var(--mpkr-gateway-foreground);
  text-decoration: none;
}

.${GATEWAY_CLASS}__link:focus-visible {
  outline: 3px solid ${UI.color.link};
  outline-offset: -3px;
}

.${GATEWAY_CLASS}__content {
  box-sizing: border-box;
  min-width: 0;
  padding-right: var(--mpkr-gateway-arrow-rail-width);
  position: relative;
  width: 100%;
  z-index: 0;
}

.${GATEWAY_CLASS}__title {
  color: var(--mpkr-gateway-foreground);
  display: block;
  overflow-wrap: anywhere;
  transition: color ${UI.motion.fast};
}

.${GATEWAY_CLASS}__copy {
  color: var(--mpkr-gateway-foreground);
  display: block;
  overflow-wrap: anywhere;
  transition: color ${UI.motion.fast};
}

.${GATEWAY_CLASS}__overlay {
  background: var(--mpkr-gateway-overlay);
  inset: 0;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  transition: opacity 120ms ease, visibility 120ms ease;
  visibility: hidden;
  z-index: 2;
}

.${GATEWAY_CLASS}__action {
  align-items: center;
  box-sizing: border-box;
  color: var(--mpkr-gateway-hover-foreground);
  display: flex;
  font-size: 2rem;
  font-weight: ${UI.font.controlWeight};
  inset: 0;
  justify-content: center;
  line-height: 1.2;
  opacity: 0;
  padding: 0 var(--mpkr-gateway-arrow-rail-width) 0 0;
  pointer-events: none;
  position: absolute;
  transition: opacity 100ms ease, visibility 100ms ease;
  visibility: hidden;
  z-index: 3;
}

.${GATEWAY_CLASS}__arrow-rail {
  align-items: center;
  border-left: 1px solid rgba(6, 69, 173, 0.32);
  bottom: 0;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 0;
  transition: background-color ${UI.motion.fast}, border-color ${UI.motion.fast};
  width: var(--mpkr-gateway-arrow-rail-width);
  z-index: 4;
}

.${GATEWAY_CLASS}__arrow {
  border-right: 2px solid ${UI.color.link};
  border-top: 2px solid ${UI.color.link};
  box-sizing: border-box;
  display: block;
  height: 0.72rem;
  transform: rotate(45deg);
  transition: border-color ${UI.motion.fast}, transform ${UI.motion.fast};
  width: 0.72rem;
}

[${HOST_ATTRIBUTE}="true"]:focus-within .${GATEWAY_CLASS}__overlay,
[${HOST_ATTRIBUTE}="true"]:focus-within .${GATEWAY_CLASS}__action {
  opacity: 1;
  visibility: visible;
}

[${HOST_ATTRIBUTE}="true"]:focus-within .${GATEWAY_CLASS}__title,
[${HOST_ATTRIBUTE}="true"]:focus-within .${GATEWAY_CLASS}__copy {
  color: var(--mpkr-gateway-hover-foreground);
}

[${HOST_ATTRIBUTE}="true"]:focus-within .${GATEWAY_CLASS}__arrow-rail {
  background: rgba(255, 255, 255, 0.08);
  border-left-color: rgba(255, 255, 255, 0.32);
}

[${HOST_ATTRIBUTE}="true"]:focus-within .${GATEWAY_CLASS}__arrow {
  border-color: ${UI.color.surface};
  transform: translateX(2px) rotate(45deg);
}

@media (hover: hover) and (pointer: fine) {
  [${HOST_ATTRIBUTE}="true"]:hover {
    background: var(--mpkr-gateway-dark);
    color: var(--mpkr-gateway-hover-foreground);
    outline-color: rgba(255, 255, 255, 0.28);
  }

  [${HOST_ATTRIBUTE}="true"]:hover .${GATEWAY_CLASS}__overlay,
  [${HOST_ATTRIBUTE}="true"]:hover .${GATEWAY_CLASS}__action {
    opacity: 1;
    visibility: visible;
  }

  [${HOST_ATTRIBUTE}="true"]:hover .${GATEWAY_CLASS}__title,
  [${HOST_ATTRIBUTE}="true"]:hover .${GATEWAY_CLASS}__copy {
    color: var(--mpkr-gateway-hover-foreground);
  }

  [${HOST_ATTRIBUTE}="true"]:hover .${GATEWAY_CLASS}__arrow-rail {
    background: rgba(255, 255, 255, 0.08);
    border-left-color: rgba(255, 255, 255, 0.32);
  }

  [${HOST_ATTRIBUTE}="true"]:hover .${GATEWAY_CLASS}__arrow {
    border-color: ${UI.color.surface};
    transform: translateX(2px) rotate(45deg);
  }
}

[${HOST_ATTRIBUTE}="true"]:active .${GATEWAY_CLASS}__action {
  transform: translateY(1px);
}

@media (max-width: 480px) {
  [${HOST_ATTRIBUTE}="true"] {
    --mpkr-gateway-arrow-rail-width: 2.75rem;
  }

  .${GATEWAY_CLASS}__action {
    font-size: 1.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  [${HOST_ATTRIBUTE}="true"],
  .${GATEWAY_CLASS}__content,
  .${GATEWAY_CLASS}__overlay,
  .${GATEWAY_CLASS}__arrow-rail,
  .${GATEWAY_CLASS}__arrow,
  .${GATEWAY_CLASS}__action {
    transition: none;
  }
}
`;

function directText(element: Element): string {
  return Array.from(element.childNodes)
    .filter((node): node is Text => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.nodeValue ?? '')
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

type Navigate = (url: string) => void;

interface HostState {
  element: HTMLElement;
  gatewayAttribute: string | null;
}

export class SouthKoreaGateway {
  private root: HTMLElement | undefined;
  private link: HTMLAnchorElement | undefined;
  private style: HTMLStyleElement | undefined;
  private removeListeners: (() => void) | undefined;
  private hostState: HostState | undefined;

  constructor(
    private readonly navigate: Navigate = (url) => window.location.assign(url),
  ) {}

  mount(root: ParentNode = document): void {
    if (this.root?.isConnected && this.link?.isConnected) {
      return;
    }
    if (this.root || this.link) {
      this.destroy();
    }
    if (root.querySelector(`[${HOST_ATTRIBUTE}="true"]`)) {
      return;
    }

    const heading = Array.from(
      root.querySelectorAll<HTMLElement>(MAIN_SELECTORS.gatewayHeadings),
    ).find((element) => GUIDEBOOK_GATEWAY_HEADINGS.has(directText(element)));
    const host = heading?.closest<HTMLElement>(MAIN_SELECTORS.gatewayHost);
    if (!heading || !host) {
      return;
    }

    const ownerDocument = host.ownerDocument;
    const link = ownerDocument.createElement('a');
    link.className = `${GATEWAY_CLASS}__link`;
    link.href = SOUTH_KOREA_AREA_URL;

    const content = ownerDocument.createElement('div');
    content.className = `${GATEWAY_CLASS}__content`;

    const title = ownerDocument.createElement(heading.tagName.toLowerCase());
    title.className = [heading.className, `${GATEWAY_CLASS}__title`]
      .filter(Boolean)
      .join(' ');
    title.textContent = '대한민국 클라이밍';

    const originalSubtitle = Array.from(host.children)
      .find((element): element is HTMLElement => (
        element instanceof HTMLElement
        && element !== heading
        && /^H[1-6]$/.test(element.tagName)
      ));
    const subtitle = ownerDocument.createElement(originalSubtitle?.tagName.toLowerCase() ?? 'h3');
    subtitle.className = [originalSubtitle?.className, `${GATEWAY_CLASS}__copy`]
      .filter(Boolean)
      .join(' ');
    subtitle.textContent = GATEWAY_SUBTITLE;

    const overlay = ownerDocument.createElement('span');
    overlay.className = `${GATEWAY_CLASS}__overlay`;
    overlay.setAttribute('aria-hidden', 'true');

    const action = ownerDocument.createElement('span');
    action.className = `${GATEWAY_CLASS}__action`;
    action.textContent = '지역 보기';
    action.setAttribute('aria-hidden', 'true');

    const arrowRail = ownerDocument.createElement('span');
    arrowRail.className = `${GATEWAY_CLASS}__arrow-rail`;
    arrowRail.setAttribute('aria-hidden', 'true');

    const arrow = ownerDocument.createElement('span');
    arrow.className = `${GATEWAY_CLASS}__arrow`;
    arrowRail.append(arrow);

    link.setAttribute('aria-label', '대한민국 클라이밍 지역 보기');

    const activate = (): void => this.navigate(SOUTH_KOREA_AREA_URL);
    const handleLinkKeydown = (event: KeyboardEvent): void => {
      if ((event.key !== ' ' && event.key !== 'Spacebar') || event.repeat) {
        return;
      }
      event.preventDefault();
      activate();
    };
    const handleLinkClick = (event: MouseEvent): void => {
      event.stopPropagation();
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
        return;
      }
      event.preventDefault();
      activate();
    };

    link.addEventListener('keydown', handleLinkKeydown);
    link.addEventListener('click', handleLinkClick);
    this.removeListeners = () => {
      link.removeEventListener('keydown', handleLinkKeydown);
      link.removeEventListener('click', handleLinkClick);
    };

    content.append(title, subtitle);
    link.append(content, overlay, action, arrowRail);

    if (!ownerDocument.querySelector(`style[${STYLE_ATTRIBUTE}]`)) {
      const style = ownerDocument.createElement('style');
      style.setAttribute(STYLE_ATTRIBUTE, 'true');
      style.textContent = GATEWAY_STYLES;
      (ownerDocument.head ?? ownerDocument.documentElement).append(style);
      this.style = style;
    }

    this.hostState = {
      element: host,
      gatewayAttribute: host.getAttribute(HOST_ATTRIBUTE),
    };
    host.setAttribute(HOST_ATTRIBUTE, 'true');
    host.append(link);
    this.root = host;
    this.link = link;
  }

  destroy(): void {
    this.removeListeners?.();
    this.link?.remove();
    this.style?.remove();
    if (this.hostState) {
      const { element, gatewayAttribute } = this.hostState;
      if (gatewayAttribute === null) {
        element.removeAttribute(HOST_ATTRIBUTE);
      } else {
        element.setAttribute(HOST_ATTRIBUTE, gatewayAttribute);
      }
    }
    this.removeListeners = undefined;
    this.root = undefined;
    this.link = undefined;
    this.style = undefined;
    this.hostState = undefined;
  }
}
