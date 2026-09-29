import { SHARED_SELECTORS } from '../contract/selectors/shared';

const HEADING_SELECTOR = 'h1, h2, h3';
const NON_TITLE_SELECTOR = [
  'a',
  'button',
  '.mpkr-area-section-hint',
  '.mpkr-area-section-chevron',
].join(', ');

export interface AuthoredSectionLandmarks {
  readonly content: HTMLElement;
  readonly structuralNode: Element;
}

export function normalizedSectionHeading(heading: HTMLHeadingElement): string {
  return Array.from(heading.childNodes)
    .filter((node) => (
      node.nodeType !== Node.COMMENT_NODE
      && (!(node instanceof HTMLElement) || !node.matches(NON_TITLE_SELECTOR))
    ))
    .map((node) => node.textContent ?? '')
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isAuthoredSectionBoundary(node: Node): boolean {
  return node instanceof Element
    && (node.matches(HEADING_SELECTOR) || node.querySelector(HEADING_SELECTOR) !== null);
}

export function locateAuthoredSection(
  heading: HTMLHeadingElement,
): AuthoredSectionLandmarks | undefined {
  const controlledId = heading.getAttribute('aria-controls');
  const controlled = controlledId
    ? heading.ownerDocument.getElementById(controlledId)
    : null;
  const controlledContent = controlled?.matches(SHARED_SELECTORS.authoredContent)
    ? controlled
    : controlled?.querySelector<HTMLElement>(SHARED_SELECTORS.authoredContent);
  if (controlled && controlledContent) {
    return { content: controlledContent, structuralNode: controlled };
  }

  let sibling = heading.nextElementSibling;
  while (sibling) {
    if (isAuthoredSectionBoundary(sibling)) {
      return undefined;
    }
    if (sibling.matches(SHARED_SELECTORS.authoredContent)) {
      return {
        content: sibling as HTMLElement,
        structuralNode: sibling,
      };
    }
    const nested = sibling.querySelector<HTMLElement>(SHARED_SELECTORS.authoredContent);
    if (nested) {
      return { content: nested, structuralNode: sibling };
    }
    sibling = sibling.nextElementSibling;
  }
  return undefined;
}
