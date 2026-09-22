import { browser } from 'wxt/browser';
import type {
  ExtensionSettings,
  SettingsRepository,
} from '../../core/settings';

const ENABLED_KEY = 'enabled';

interface StorageChange {
  newValue?: unknown;
  oldValue?: unknown;
}

export class WebExtensionSettingsRepository implements SettingsRepository {
  async get(): Promise<ExtensionSettings> {
    const stored = await browser.storage.local.get(ENABLED_KEY);
    return { enabled: stored[ENABLED_KEY] !== false };
  }

  async setEnabled(enabled: boolean): Promise<void> {
    await browser.storage.local.set({ [ENABLED_KEY]: enabled });
  }

  watch(listener: (settings: ExtensionSettings) => void): () => void {
    const onChanged = (
      changes: Record<string, StorageChange>,
      areaName: string,
    ) => {
      if (areaName !== 'local' || !changes[ENABLED_KEY]) {
        return;
      }
      listener({ enabled: changes[ENABLED_KEY].newValue !== false });
    };
    browser.storage.onChanged.addListener(onChanged);
    return () => browser.storage.onChanged.removeListener(onChanged);
  }
}
