import { connectEmbeddedScrollBoundary } from '@/ui/embedded-scroll-boundary';

function setScrollMetrics(
  element: HTMLElement,
  { clientHeight, scrollHeight, scrollTop }: {
    clientHeight: number;
    scrollHeight: number;
    scrollTop: number;
  },
): void {
  Object.defineProperties(element, {
    clientHeight: { configurable: true, value: clientHeight },
    scrollHeight: { configurable: true, value: scrollHeight },
    scrollTop: { configurable: true, writable: true, value: scrollTop },
  });
}

describe('connectEmbeddedScrollBoundary', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="viewport"><div id="target"></div></div>';
  });

  it('passes wheel movement to the parent when the iframe has no vertical scroll', () => {
    const scrollBy = vi.fn();
    const disconnect = connectEmbeddedScrollBoundary(
      document,
      { scrollBy } as unknown as Window,
    );

    document.querySelector('#target')!.dispatchEvent(new WheelEvent('wheel', {
      bubbles: true,
      cancelable: true,
      deltaY: 80,
    }));

    expect(scrollBy).toHaveBeenCalledWith(0, 80);
    disconnect();
  });

  it('keeps scrolling inside the iframe until a scrollable viewport reaches its boundary', () => {
    const scrollBy = vi.fn();
    const viewport = document.querySelector<HTMLElement>('#viewport')!;
    viewport.style.overflowY = 'auto';
    setScrollMetrics(viewport, { clientHeight: 100, scrollHeight: 300, scrollTop: 50 });
    connectEmbeddedScrollBoundary(document, { scrollBy } as unknown as Window);

    const target = document.querySelector('#target')!;
    target.dispatchEvent(new WheelEvent('wheel', { bubbles: true, deltaY: 40 }));
    expect(scrollBy).not.toHaveBeenCalled();

    viewport.scrollTop = 200;
    target.dispatchEvent(new WheelEvent('wheel', { bubbles: true, deltaY: 40 }));
    expect(scrollBy).toHaveBeenCalledWith(0, 40);
  });

  it('preserves wheel interaction inside an excluded map canvas', () => {
    document.body.innerHTML = '<div id="ap-map-container"><button id="map-control"></button></div>';
    const scrollBy = vi.fn();
    connectEmbeddedScrollBoundary(
      document,
      { scrollBy } as unknown as Window,
      { ignoreWithin: '#ap-map-container' },
    );

    document.querySelector('#map-control')!.dispatchEvent(new WheelEvent('wheel', {
      bubbles: true,
      deltaY: 100,
    }));

    expect(scrollBy).not.toHaveBeenCalled();
  });
});
