/** Owns only presentation; the site's button still performs all data loading. */
export class StatsProgressiveList {
  private rows: HTMLTableRowElement[] = [];
  private readonly hidden = new Map<HTMLElement, string | null>();
  private limit: number;
  private frame: number | undefined;
  private more: HTMLElement | undefined;
  private moreParent: HTMLElement | undefined;
  private moreNext: Node | null = null;
  private expanded = false;
  private destroyed = false;
  private lastScrollTop = 0;
  private readonly handleScroll = (): void => {
    const downward = this.viewport.scrollTop > this.lastScrollTop;
    this.lastScrollTop = this.viewport.scrollTop;
    if (downward) this.schedule(false);
  };
  private readonly handleWheel = (event: WheelEvent): void => {
    if (event.deltaY > 0) this.schedule(true);
  };
  private touchY = 0;
  private readonly handleTouchStart = (event: TouchEvent): void => {
    this.touchY = event.touches[0]?.clientY ?? 0;
  };
  private readonly handleTouchMove = (event: TouchEvent): void => {
    if ((event.touches[0]?.clientY ?? this.touchY) < this.touchY) this.schedule(true);
  };
  private readonly handleKey = (event: KeyboardEvent): void => {
    if (['ArrowDown', 'PageDown', 'End', ' '].includes(event.key)
      && event.target === this.viewport) this.schedule(true);
  };

  constructor(
    private readonly table: HTMLTableElement,
    private readonly viewport: HTMLElement,
    private readonly compact: boolean,
    private readonly expand: () => void,
  ) {
    this.limit = compact ? 5 : 20;
    viewport.addEventListener('scroll', this.handleScroll, { passive: true });
    viewport.addEventListener('wheel', this.handleWheel, { passive: true });
    viewport.addEventListener('touchstart', this.handleTouchStart, { passive: true });
    viewport.addEventListener('touchmove', this.handleTouchMove, { passive: true });
    viewport.addEventListener('keydown', this.handleKey);
  }

  refresh(more?: HTMLElement): void {
    this.rows = Array.from(this.table.tBodies.item(0)?.children ?? [])
      .filter((row): row is HTMLTableRowElement => row.tagName === 'TR');
    // Empty/loading tables must retain their initial display budget for arriving rows.
    const minimum = this.compact ? (this.expanded ? 10 : 5) : 20;
    this.limit = Math.max(minimum, Math.min(this.limit, this.rows.length));
    const live = new Set<HTMLElement>(this.rows);
    for (const element of this.hidden.keys()) {
      if (element !== this.more && !live.has(element)) this.restore(element);
    }
    if (more !== this.more) {
      this.restoreMore();
      this.more = more;
      if (more) {
        this.moreParent = more.parentElement ?? undefined;
        this.moreNext = more.nextSibling;
        this.viewport.append(more);
      }
    }
    this.render();
  }

  destroy(): void {
    this.destroyed = true;
    const view = this.viewport.ownerDocument.defaultView;
    if (this.frame !== undefined) view?.cancelAnimationFrame(this.frame);
    this.viewport.removeEventListener('scroll', this.handleScroll);
    this.viewport.removeEventListener('wheel', this.handleWheel);
    this.viewport.removeEventListener('touchstart', this.handleTouchStart);
    this.viewport.removeEventListener('touchmove', this.handleTouchMove);
    this.viewport.removeEventListener('keydown', this.handleKey);
    this.restoreMore();
    for (const element of this.hidden.keys()) this.restore(element);
    this.rows = [];
  }

  private schedule(intent: boolean): void {
    if (this.destroyed || this.frame !== undefined) return;
    const view = this.viewport.ownerDocument.defaultView;
    if (!view) return;
    this.frame = view.requestAnimationFrame(() => {
      this.frame = undefined;
      if (this.destroyed) return;
      if (this.compact && !this.expanded && (intent || this.viewport.scrollTop > 0)) {
        this.expanded = true;
        this.limit = Math.min(10, this.rows.length);
        this.expand();
      } else if (this.viewport.scrollHeight - this.viewport.clientHeight - this.viewport.scrollTop <= 80) {
        this.limit = Math.min(this.rows.length, this.limit + (this.compact ? 10 : 20));
      }
      this.render();
    });
  }

  private render(): void {
    this.rows.forEach((row, index) => this.setHidden(row, index >= this.limit));
    if (this.more) this.setHidden(this.more, this.limit < this.rows.length);
  }

  private setHidden(element: HTMLElement, hidden: boolean): void {
    if (hidden) {
      if (!this.hidden.has(element)) this.hidden.set(element, element.getAttribute('hidden'));
      if (element.getAttribute('hidden') !== '') element.setAttribute('hidden', '');
    } else this.restore(element);
  }

  private restore(element: HTMLElement): void {
    if (!this.hidden.has(element)) return;
    const original = this.hidden.get(element)!;
    if (original === null) element.removeAttribute('hidden');
    else element.setAttribute('hidden', original);
    this.hidden.delete(element);
  }

  private restoreMore(): void {
    if (!this.more) return;
    this.restore(this.more);
    if (this.more.parentElement === this.viewport && this.moreParent) {
      this.moreParent.insertBefore(this.more,
        this.moreNext?.parentNode === this.moreParent ? this.moreNext : null);
    }
    this.more = undefined;
    this.moreParent = undefined;
  }
}
