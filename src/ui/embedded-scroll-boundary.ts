const SCROLL_EPSILON_PX = 1;
const LINE_HEIGHT_PX = 16;

export interface EmbeddedScrollBoundaryOptions {
  ignoreWithin?: string;
}

function wheelPixels(event: WheelEvent, frameWindow: Window | null): number {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return event.deltaY * LINE_HEIGHT_PX;
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return event.deltaY * (frameWindow?.innerHeight ?? 800);
  }
  return event.deltaY;
}

function canScroll(element: Element, deltaY: number, frameWindow: Window | null): boolean {
  if (!('scrollHeight' in element) || !('clientHeight' in element)
    || !('scrollTop' in element)) return false;
  const overflowY = frameWindow?.getComputedStyle(element).overflowY ?? '';
  if (!['auto', 'scroll', 'overlay'].includes(overflowY)) return false;
  if (element.scrollHeight <= element.clientHeight + SCROLL_EPSILON_PX) return false;
  if (deltaY < 0) return element.scrollTop > SCROLL_EPSILON_PX;
  return element.scrollTop + element.clientHeight < element.scrollHeight - SCROLL_EPSILON_PX;
}

function hasScrollableAncestor(
  target: EventTarget | null,
  frameDocument: Document,
  deltaY: number,
): boolean {
  const frameWindow = frameDocument.defaultView;
  let element = target && 'nodeType' in target && (target as Node).nodeType === 1
    ? target as Element
    : null;
  while (element) {
    if (canScroll(element, deltaY, frameWindow)) return true;
    element = element.parentElement;
  }

  const scrollingElement = frameDocument.scrollingElement;
  if (!scrollingElement) return false;
  if (deltaY < 0) return scrollingElement.scrollTop > SCROLL_EPSILON_PX;
  return scrollingElement.scrollTop + scrollingElement.clientHeight
    < scrollingElement.scrollHeight - SCROLL_EPSILON_PX;
}

export function connectEmbeddedScrollBoundary(
  frameDocument: Document,
  parentWindow: Window,
  options: EmbeddedScrollBoundaryOptions = {},
): () => void {
  const handleWheel = (event: WheelEvent): void => {
    if (event.ctrlKey || event.deltaY === 0) return;
    const target = event.target && 'nodeType' in event.target
      && (event.target as Node).nodeType === 1
      ? event.target as Element
      : null;
    if (options.ignoreWithin && target?.closest(options.ignoreWithin)) return;

    const deltaY = wheelPixels(event, frameDocument.defaultView);
    if (hasScrollableAncestor(event.target, frameDocument, deltaY)) return;

    if (event.cancelable) event.preventDefault();
    parentWindow.scrollBy(0, deltaY);
  };

  frameDocument.addEventListener('wheel', handleWheel, { capture: true, passive: false });
  return () => frameDocument.removeEventListener('wheel', handleWheel, true);
}
