import type { ApplicationShell } from '../application/runtime';
import { SOUTH_KOREA_AREA_URL } from '../sites/mountain-project/contract/regions/south-korea';
import { NAVIGATION_HEADER, navigationUserItems } from '../sites/mountain-project/dom/navigation';

import { NAVIGATION_CONTROL_CSS, createKoreaIcon } from './navigation-control-style';
import { FirstRunOnboarding } from './first-run-onboarding';

export class NavigationControls implements ApplicationShell {
  private observer?: MutationObserver;
  private style?: HTMLStyleElement;
  private pairs = new Map<HTMLElement, { label: HTMLLabelElement; link: HTMLAnchorElement; input: HTMLInputElement; error: HTMLDivElement }>();
  private enabled?: boolean;
  private pending = false;
  private saveError = false;
  private isFirstRun = false;
  private onboardingSuppressed = false;
  private change?: (enabled: boolean) => Promise<void>;
  private readonly onboarding = new FirstRunOnboarding();

  mount(change: (enabled: boolean) => Promise<void>): void {
    if (this.observer) return;
    this.change = change;
    this.style = document.createElement('style');
    this.style.textContent = NAVIGATION_CONTROL_CSS;
    document.head.append(this.style);
    this.observer = new MutationObserver((records) => {
      if (records.some((record) =>
        record.target instanceof Element && record.target.closest(NAVIGATION_HEADER)
        || [...record.addedNodes, ...record.removedNodes].some((node) =>
          node instanceof Element && (node.matches(NAVIGATION_HEADER) || node.querySelector(NAVIGATION_HEADER))))) {
        this.reconcile();
      }
    });
    this.reconcile();
  }

  private reconcile(): void {
    const observer = this.observer;
    if (!observer) return;
    observer.disconnect();
    const targets = navigationUserItems(document);
    for (const [target, pair] of this.pairs) {
      if (!targets.includes(target)) {
        pair.label.remove();
        pair.link.remove();
        pair.error.remove();
        this.pairs.delete(target);
      }
    }
    for (const target of targets) {
      let pair = this.pairs.get(target);
      if (!pair) {
        const label = document.createElement('label');
        label.className = 'mp-nav-control';
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.setAttribute('role', 'switch');
        input.setAttribute('aria-label', '확장 기능');
        const error = document.createElement('div');
        error.className = 'mp-nav-error mpkr-status-message';
        error.hidden = true;
        const errorTitle = document.createElement('strong');
        errorTitle.textContent = '설정을 저장하지 못했습니다.';
        const errorDetail = document.createElement('p');
        errorDetail.textContent = '기존 설정을 유지했습니다. 스위치를 다시 눌러 주세요.';
        error.append(errorTitle, errorDetail);
        error.setAttribute('role', 'status');
        error.setAttribute('aria-live', 'polite');
        error.setAttribute('aria-atomic', 'true');
        const labelText = document.createElement('span');
        labelText.className = 'mp-nav-copy';
        labelText.textContent = '확장 기능';
        label.append(labelText, input);
        input.addEventListener('change', async () => {
          if (this.pending || !this.change) return;
          const next = input.checked;
          this.pending = true;
          this.saveError = false;
          this.updateInputs();
          try { await this.change(next); }
          catch {
            if (this.observer) {
              this.saveError = true;
              this.onboardingSuppressed = true;
            }
          }
          finally { this.pending = false; this.updateInputs(); }
        });
        const link = document.createElement('a');
        link.className = 'mp-nav-control';
        const linkText = document.createElement('span');
        linkText.className = 'mp-nav-copy';
        linkText.textContent = '대한민국';
        link.setAttribute('aria-label', '대한민국');
        link.append(createKoreaIcon(), linkText);
        link.href = SOUTH_KOREA_AREA_URL;
        pair = { label, input, link, error };
        this.pairs.set(target, pair);
      }
      if (pair.error.parentElement !== target.parentElement) target.parentElement?.append(pair.error);
      if (target.previousElementSibling !== pair.link || pair.link.previousElementSibling !== pair.label) {
        target.before(pair.label, pair.link);
      }
    }
    this.updateInputs();
    this.updateOnboarding();
    // Observe header descendants, plus only direct ancestor children to detect
    // whole-header replacement. Never observe the page-content subtree.
    const headers = document.querySelectorAll(NAVIGATION_HEADER);
    for (const header of headers) {
      observer.observe(header, { childList: true, subtree: true });
      for (let parent = header.parentElement; parent; parent = parent.parentElement) {
        observer.observe(parent, { childList: true });
      }
    }
    if (!headers.length) {
      observer.observe(document.documentElement, { childList: true });
      if (document.body) observer.observe(document.body, { childList: true });
    }
  }

  render(enabled: boolean, context?: { isFirstRun: boolean }): void {
    this.enabled = enabled;
    this.isFirstRun = context?.isFirstRun === true;
    if (!this.isFirstRun) this.onboardingSuppressed = false;
    this.saveError = false;
    this.updateInputs();
    this.updateOnboarding();
  }

  private updateInputs(): void {
    for (const { input, error } of this.pairs.values()) {
      error.hidden = !this.saveError;
      input.checked = this.enabled === true;
      input.disabled = this.pending || this.enabled === undefined;
      input.setAttribute(
        'aria-label',
        this.isFirstRun && !this.onboardingSuppressed
          ? '확장 기능을 켜서 한국어 기능 시작'
          : '확장 기능',
      );
    }
    this.updateOnboarding();
  }

  private updateOnboarding(): void {
    if (!this.isFirstRun || this.onboardingSuppressed) {
      this.onboarding.hide();
      return;
    }
    const target = [...this.pairs.values()]
      .map(({ label }) => label)
      .find((label) => label.getClientRects().length > 0)
      ?? this.pairs.values().next().value?.label;
    if (target) this.onboarding.show(target);
    else this.onboarding.hide();
  }

  destroy(): void {
    this.observer?.disconnect();
    this.observer = undefined;
    this.change = undefined;
    for (const { label, link, error } of this.pairs.values()) { label.remove(); link.remove(); error.remove(); }
    this.saveError = false;
    this.isFirstRun = false;
    this.onboardingSuppressed = false;
    this.onboarding.destroy();
    this.pairs.clear();
    this.style?.remove();
    this.style = undefined;
  }
}
