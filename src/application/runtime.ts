import type { PageLifecycle, SettingsRepository } from './ports';

export interface ApplicationRuntime extends PageLifecycle {
  start(): Promise<void>;
  setEnabled(enabled: boolean): Promise<void>;
}

export interface ApplicationShell {
  mount(change: (enabled: boolean) => Promise<void>): void;
  render(enabled: boolean, context?: { isFirstRun: boolean }): void;
  destroy(): void;
}

/** Owns one page's settings subscription and terminal disposal. No extension APIs. */
export function createApplicationRuntime(
  settings: SettingsRepository,
  page: PageLifecycle,
  shell?: ApplicationShell,
): ApplicationRuntime {
  let destroyed = false;
  let enabled: boolean | undefined;
  let isFirstRun = false;
  let revision = 0;
  let started: Promise<void> | undefined;
  let unwatch: (() => void) | undefined;

  const apply = (next: boolean, nextIsFirstRun = false) => {
    if (destroyed) return;
    revision += 1;
    isFirstRun = nextIsFirstRun;
    shell?.render(next, { isFirstRun });
    if (enabled === next) return;
    enabled = next;
    if (next) page.enable();
    else page.disable();
  };
  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    unwatch?.();
    unwatch = undefined;
    shell?.destroy();
    page.destroy();
  };

  const setEnabled = async (next: boolean) => {
    if (destroyed) return;
    if (!next) {
      const beforeWrite = revision;
      await settings.setEnabled(false);
      // A storage event may already have applied this or a newer external value.
      if (revision === beforeWrite) apply(false);
      return;
    }

    const previous = enabled;
    apply(true, isFirstRun);
    const optimisticRevision = revision;
    try {
      await settings.setEnabled(true);
      if (!destroyed && revision === optimisticRevision && isFirstRun) {
        isFirstRun = false;
        shell?.render(true, { isFirstRun: false });
      }
    } catch (error) {
      // Roll back only when storage has not supplied a newer authoritative value.
      if (!destroyed && revision === optimisticRevision && previous !== undefined) apply(previous, isFirstRun);
      throw error;
    }
  };

  return {
    setEnabled,
    enable: () => apply(true),
    disable: () => apply(false),
    destroy,
    start() {
      if (destroyed) return Promise.resolve();
      if (started) return started;
      // Subscribe first: a newer setting must win over an in-flight initial read.
      started = (async () => {
        const initialRevision = revision;
        try {
          shell?.mount(setEnabled);
          const stopWatching = settings.watch((next) => {
            apply(next.enabled, next.isFirstRun === true);
          });
          if (destroyed) {
            stopWatching();
            return;
          }
          unwatch = stopWatching;
          const initial = await settings.get();
          if (!destroyed && revision === initialRevision) {
            apply(initial.enabled, initial.isFirstRun === true);
          }
        } catch (error) {
          destroy();
          throw error;
        }
      })();
      return started;
    },
  };
}
