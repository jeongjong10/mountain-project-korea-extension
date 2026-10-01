const extension = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
}));

vi.mock('wxt/browser', () => ({
  browser: {
    storage: {
      local: { get: extension.get, set: extension.set },
      onChanged: {
        addListener: extension.addListener,
        removeListener: extension.removeListener,
      },
    },
  },
}));

import { WebExtensionSettingsRepository } from '@/platforms/webextension/settings-repository';

describe('web extension settings repository', () => {
  beforeEach(() => vi.clearAllMocks());

  it('defaults OFF and identifies first run only when the enabled key is absent', async () => {
    extension.get.mockResolvedValue({});
    await expect(new WebExtensionSettingsRepository().get()).resolves.toEqual({
      enabled: false,
      isFirstRun: true,
    });
  });

  it.each([true, false])('preserves a persisted %s setting without onboarding', async (enabled) => {
    extension.get.mockResolvedValue({ enabled });
    await expect(new WebExtensionSettingsRepository().get()).resolves.toEqual({
      enabled,
      isFirstRun: false,
    });
  });

  it('persists the explicit enabled state', async () => {
    extension.set.mockResolvedValue(undefined);
    await new WebExtensionSettingsRepository().setEnabled(true);
    expect(extension.set).toHaveBeenCalledWith({ enabled: true });
  });

  it('restores first-run OFF semantics when the enabled key is deleted', () => {
    let onChanged!: (
      changes: Record<string, { newValue?: unknown; oldValue?: unknown }>,
      areaName: string,
    ) => void;
    extension.addListener.mockImplementation((listener) => { onChanged = listener; });
    const listener = vi.fn();
    new WebExtensionSettingsRepository().watch(listener);

    onChanged({ enabled: { oldValue: true } }, 'local');

    expect(listener).toHaveBeenCalledWith({ enabled: false, isFirstRun: true });
  });
});
