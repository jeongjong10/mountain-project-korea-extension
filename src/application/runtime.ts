import type { PageLifecycle, SettingsRepository } from './ports';

export interface ApplicationRuntime extends PageLifecycle {
  start(): Promise<void>;
  setEnabled(enabled: boolean): Promise<void>;
}

export interface ApplicationShell {
  mount(change: (enabled: boolean) => Promise<void>): void;
  render(enabled: boolean): void;
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
  let revision = 0;
  let started: Promise<void> | undefined;
  let unwatch: (() => void) | undefined;

  const apply = (next: boolean) => {
    if (destroyed) return;
    revision += 1;
    shell?.render(next);
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
    const beforeWrite = revision;
    await settings.setEnabled(next);
    // A storage event may already have applied this or a newer external value.
    if (revision === beforeWrite) apply(next);
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
          const stopWatching = settings.watch((next) => apply(next.enabled));
          if (destroyed) {
            stopWatching();
            return;
          }
          unwatch = stopWatching;
          const initial = await settings.get();
          if (!destroyed && revision === initialRevision) apply(initial.enabled);
        } catch (error) {
          destroy();
          throw error;
        }
      })();
      return started;
    },
  };
}
