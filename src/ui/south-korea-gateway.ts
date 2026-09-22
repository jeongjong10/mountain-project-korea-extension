const SOUTH_KOREA_URL = 'https://www.mountainproject.com/area/106225629/south-korea';

const GATEWAY_CLASS = 'mpkr-south-korea-gateway';
const STYLE_ATTRIBUTE = 'data-mpkr-south-korea-gateway-style';
const SOURCE_ATTRIBUTE = 'data-mpkr-south-korea-gateway-source';
const GUIDEBOOK_HEADINGS = new Set(['Beyond the Guidebook', '가이드북 그 이상']);

const GATEWAY_STYLES = `
.${GATEWAY_CLASS} {
  --mpkr-gateway-action: #0645ad;
  --mpkr-gateway-border: #0645ad;
  --mpkr-gateway-copy: #343a40;
  --mpkr-gateway-foreground: #111;
  --mpkr-gateway-hover: #f5f7f6;
  --mpkr-gateway-pressed: #e9eeeb;
  --mpkr-gateway-surface: #fff;
  background: var(--mpkr-gateway-surface);
  border: 1px solid var(--mpkr-gateway-border);
  box-sizing: border-box;
  color: var(--mpkr-gateway-foreground);
  margin: 0 0 0.5rem;
  max-width: 100%;
  transition: background-color 120ms ease;
  width: 100%;
}

[${SOURCE_ATTRIBUTE}="true"][hidden] {
  display: none !important;
}

.${GATEWAY_CLASS}:hover,
.${GATEWAY_CLASS}:focus-within {
  background: var(--mpkr-gateway-hover);
}

.${GATEWAY_CLASS}:active {
  background: var(--mpkr-gateway-pressed);
}

.${GATEWAY_CLASS}__link {
  align-items: center;
  box-sizing: border-box;
  color: var(--mpkr-gateway-foreground);
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  justify-content: space-between;
  max-width: 100%;
  min-height: 68px;
  padding: 14px 12px;
  text-decoration: none;
  touch-action: manipulation;
  width: 100%;
}

.${GATEWAY_CLASS}__link:hover,
.${GATEWAY_CLASS}__link:focus,
.${GATEWAY_CLASS}__link:active {
  color: var(--mpkr-gateway-foreground);
  text-decoration: none;
}

.${GATEWAY_CLASS}__link:focus-visible {
  outline: 2px solid #039;
  outline-offset: 2px;
}

.${GATEWAY_CLASS}__content {
  flex: 1 1 230px;
  min-width: 0;
}

.${GATEWAY_CLASS}__title {
  color: var(--mpkr-gateway-foreground);
  display: block;
  font-family: inherit;
  font-size: inherit;
  font-weight: 700;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.${GATEWAY_CLASS}__copy {
  color: var(--mpkr-gateway-copy);
  display: block;
  line-height: 1.3;
  margin-top: 2px;
  overflow-wrap: anywhere;
}

.${GATEWAY_CLASS}__action {
  color: var(--mpkr-gateway-action);
  flex: 0 0 auto;
  font-weight: 700;
  line-height: 1.3;
  margin-left: auto;
  white-space: nowrap;
}

.${GATEWAY_CLASS}__link:hover .${GATEWAY_CLASS}__action,
.${GATEWAY_CLASS}__link:focus .${GATEWAY_CLASS}__action,
.${GATEWAY_CLASS}__link:active .${GATEWAY_CLASS}__action {
  color: #00327d;
}

@media (max-width: 576px) {
  .${GATEWAY_CLASS}__link {
    align-items: flex-start;
    padding: 14px 10px;
  }

  .${GATEWAY_CLASS}__content {
    flex-basis: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .${GATEWAY_CLASS} {
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

interface SourceState {
  element: HTMLElement;
  hiddenAttribute: string | null;
  sourceAttribute: string | null;
}

export class SouthKoreaGateway {
  private root: HTMLElement | undefined;
  private style: HTMLStyleElement | undefined;
  private removeListeners: (() => void) | undefined;
  private sourceState: SourceState | undefined;

  constructor(
    private readonly navigate: Navigate = (url) => window.location.assign(url),
  ) {}

  mount(root: ParentNode = document): void {
    if (this.root?.isConnected) {
      return;
    }
    if (this.root) {
      this.destroy();
    }
    if (root.querySelector('[data-mpkr-south-korea-gateway="true"]')) {
      return;
    }
    const heading = Array.from(root.querySelectorAll<HTMLElement>('h1, h2'))
      .find((element) => GUIDEBOOK_HEADINGS.has(directText(element)));
    const source = heading?.closest<HTMLElement>('.text-center.pb-2.border-light');
    if (!source?.parentElement) {
      return;
    }

    const ownerDocument = source.ownerDocument;
    const gateway = ownerDocument.createElement('aside');
    gateway.className = GATEWAY_CLASS;
    gateway.dataset.mpkrSouthKoreaGateway = 'true';

    const link = ownerDocument.createElement('a');
    link.className = `${GATEWAY_CLASS}__link`;
    link.href = SOUTH_KOREA_URL;

    const content = ownerDocument.createElement('span');
    content.className = `${GATEWAY_CLASS}__content`;

    const title = ownerDocument.createElement('strong');
    title.className = `${GATEWAY_CLASS}__title`;
    title.textContent = '대한민국 클라이밍';

    const copy = ownerDocument.createElement('span');
    copy.className = `${GATEWAY_CLASS}__copy small`;
    copy.textContent = 'South Korea의 지역과 루트를 한국어로 살펴보세요.';

    const action = ownerDocument.createElement('span');
    action.className = `${GATEWAY_CLASS}__action`;
    action.textContent = '지역 보기';

    const activate = (): void => this.navigate(SOUTH_KOREA_URL);

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

    content.append(title, copy);
    link.append(content, action);
    gateway.append(link);

    if (!ownerDocument.querySelector(`style[${STYLE_ATTRIBUTE}]`)) {
      const style = ownerDocument.createElement('style');
      style.setAttribute(STYLE_ATTRIBUTE, 'true');
      style.textContent = GATEWAY_STYLES;
      (ownerDocument.head ?? ownerDocument.documentElement).append(style);
      this.style = style;
    }

    this.sourceState = {
      element: source,
      hiddenAttribute: source.getAttribute('hidden'),
      sourceAttribute: source.getAttribute(SOURCE_ATTRIBUTE),
    };
    source.setAttribute(SOURCE_ATTRIBUTE, 'true');
    source.setAttribute('hidden', '');
    source.before(gateway);
    this.root = gateway;
  }

  destroy(): void {
    this.removeListeners?.();
    this.root?.remove();
    this.style?.remove();
    if (this.sourceState) {
      const { element, hiddenAttribute, sourceAttribute } = this.sourceState;
      if (hiddenAttribute === null) {
        element.removeAttribute('hidden');
      } else {
        element.setAttribute('hidden', hiddenAttribute);
      }
      if (sourceAttribute === null) {
        element.removeAttribute(SOURCE_ATTRIBUTE);
      } else {
        element.setAttribute(SOURCE_ATTRIBUTE, sourceAttribute);
      }
    }
    this.removeListeners = undefined;
    this.root = undefined;
    this.style = undefined;
    this.sourceState = undefined;
  }
}
