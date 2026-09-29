import type { DomTranslationTarget } from '../application/ports';

interface WatchedComment {
  target: DomTranslationTarget;
  element: Element;
  root: Element | null;
  near: boolean;
}

/** Observe stable comment containers: translated source nodes become hidden. */
export class CommentVisibility {
  private readonly targets = new Map<string, WatchedComment>();
  private readonly observers = new Map<Element | null, IntersectionObserver>();
  private readonly visibleRoots = new Set<Element>();
  private outer?: IntersectionObserver;
  private generation = 0;

  constructor(private readonly changed: (target: DomTranslationTarget, visible: boolean) => void) {}

  watch(target: DomTranslationTarget): boolean {
    if (target.category !== 'comment' || typeof IntersectionObserver === 'undefined') return false;
    const source = target.sourceElements[0];
    if (!source) return false;
    const element = source.closest('tr, .comment-body') ?? target.parent;
    const root = element.closest('.mpkr-route-stats-ticks-viewport');
    const old = this.targets.get(target.id);
    if (old?.target === target && old.element === element && old.root === root) return true;
    this.remove(target.id);
    this.changed(target, false);
    this.targets.set(target.id, { target, element, root, near: false });
    let observer = this.observers.get(root);
    if (!observer) {
      const generation = this.generation;
      observer = new IntersectionObserver((entries) => {
        if (generation !== this.generation || this.observers.get(root) !== observer) return;
        for (const entry of entries) {
          for (const item of this.targets.values()) {
            if (item.root !== root || item.element !== entry.target) continue;
            item.near = entry.isIntersecting && !item.element.closest('[hidden]');
            this.changed(item.target, item.near && (!root || this.visibleRoots.has(root)));
          }
        }
      }, { root, rootMargin: '240px 0px', threshold: 0 });
      this.observers.set(root, observer);
      if (root) {
        this.outer ??= new IntersectionObserver((entries) => {
          if (generation !== this.generation) return;
          for (const entry of entries) {
            if (entry.isIntersecting) this.visibleRoots.add(entry.target);
            else this.visibleRoots.delete(entry.target);
            for (const item of this.targets.values()) {
              if (item.root === entry.target) this.changed(item.target,
                item.near && entry.isIntersecting && !item.element.closest('[hidden]'));
            }
          }
        }, { rootMargin: '240px 0px' });
        this.outer.observe(root);
      }
    }
    observer.observe(element);
    return true;
  }

  refresh(): void {
    for (const item of [...this.targets.values()]) {
      if (!item.element.isConnected) this.remove(item.target.id);
      else this.watch(item.target);
    }
  }

  remove(id: string): void {
    const item = this.targets.get(id);
    if (!item) return;
    this.targets.delete(id);
    const peers = [...this.targets.values()];
    const observer = this.observers.get(item.root);
    if (!peers.some((peer) => peer.root === item.root && peer.element === item.element)) observer?.unobserve(item.element);
    if (!peers.some((peer) => peer.root === item.root)) {
      observer?.disconnect();
      this.observers.delete(item.root);
      if (item.root) {
        this.outer?.unobserve(item.root);
        this.visibleRoots.delete(item.root);
      }
    }
  }

  destroy(): void {
    this.generation += 1;
    this.targets.clear();
    for (const observer of this.observers.values()) observer.disconnect();
    this.observers.clear();
    this.outer?.disconnect();
    this.outer = undefined;
    this.visibleRoots.clear();
  }
}
