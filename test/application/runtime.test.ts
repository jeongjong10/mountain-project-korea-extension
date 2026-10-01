import { createApplicationRuntime } from '@/application/runtime';
import type { ExtensionSettings, SettingsRepository } from '@/application/ports';

function setup() {
  let listener!: (settings: ExtensionSettings) => void;
  let resolve!: (settings: ExtensionSettings) => void;
  let reject!: (error: Error) => void;
  const initial = new Promise<ExtensionSettings>((yes, no) => { resolve = yes; reject = no; });
  const unwatch = vi.fn();
  const settings: SettingsRepository = {
    get: vi.fn(() => initial),
    setEnabled: vi.fn(async () => {}),
    watch: vi.fn((callback) => { listener = callback; return unwatch; }),
  };
  const page = { enable: vi.fn(), disable: vi.fn(), destroy: vi.fn() };
  const runtime = createApplicationRuntime(settings, page);
  return {
    runtime,
    settings,
    page,
    resolve,
    reject,
    unwatch,
    emit: (enabled: boolean, isFirstRun = false) => listener({ enabled, isFirstRun }),
  };
}

describe('application runtime', () => {
  it('starts once, follows settings and ignores repeated states', async () => {
    const s = setup();
    const start = s.runtime.start();
    expect(s.runtime.start()).toBe(start);
    s.resolve({ enabled: true });
    await start;
    s.emit(true);
    expect(s.page.enable).toHaveBeenCalledTimes(1);
    s.emit(false);
    s.emit(false);
    expect(s.page.disable).toHaveBeenCalledTimes(1);
    s.emit(true);
    expect(s.page.enable).toHaveBeenCalledTimes(2);
    s.runtime.destroy();
    s.runtime.destroy();
    s.emit(true);
    s.runtime.enable();
    s.runtime.disable();
    await s.runtime.start();
    expect(s.unwatch).toHaveBeenCalledTimes(1);
    expect(s.page.destroy).toHaveBeenCalledTimes(1);
    expect(s.page.enable).toHaveBeenCalledTimes(2);
    expect(s.settings.get).toHaveBeenCalledTimes(1);
  });

  it('applies initial disabled state and permits explicit enable/disable', async () => {
    const s = setup();
    const start = s.runtime.start();
    s.resolve({ enabled: false });
    await start;
    expect(s.page.disable).toHaveBeenCalledTimes(1);
    s.runtime.enable();
    s.runtime.enable();
    s.runtime.disable();
    expect(s.page.enable).toHaveBeenCalledTimes(1);
    expect(s.page.disable).toHaveBeenCalledTimes(2);
    s.runtime.destroy();
  });

  it('passes first-run state to the shell and clears it only after enable persists', async () => {
    const s = setup();
    const shell = { mount: vi.fn(), render: vi.fn(), destroy: vi.fn() };
    const runtime = createApplicationRuntime(s.settings, s.page, shell);
    const start = runtime.start();
    s.resolve({ enabled: false, isFirstRun: true });
    await start;
    expect(shell.render).toHaveBeenLastCalledWith(false, { isFirstRun: true });

    let finish!: () => void;
    vi.mocked(s.settings.setEnabled).mockImplementation(() => new Promise<void>((resolve) => {
      finish = resolve;
    }));
    const save = runtime.setEnabled(true);
    expect(shell.render).toHaveBeenLastCalledWith(true, { isFirstRun: true });
    finish();
    await save;
    expect(shell.render).toHaveBeenLastCalledWith(true, { isFirstRun: false });
    runtime.destroy();
  });

  it('does not revive a page destroyed while reading settings', async () => {
    const s = setup();
    const start = s.runtime.start();
    s.runtime.destroy();
    s.resolve({ enabled: true });
    await start;
    s.emit(true);
    expect(s.page.enable).not.toHaveBeenCalled();
    expect(s.unwatch).toHaveBeenCalledTimes(1);
  });

  it('keeps a newer first-run OFF state when a pending enable save resolves', async () => {
    const s = setup();
    const shell = { mount: vi.fn(), render: vi.fn(), destroy: vi.fn() };
    const runtime = createApplicationRuntime(s.settings, s.page, shell);
    const start = runtime.start();
    s.resolve({ enabled: false, isFirstRun: true });
    await start;
    let finish!: () => void;
    vi.mocked(s.settings.setEnabled).mockImplementation(() => new Promise<void>((resolve) => {
      finish = resolve;
    }));

    const save = runtime.setEnabled(true);
    s.emit(false, true);
    const renderCount = shell.render.mock.calls.length;
    finish();
    await save;

    expect(shell.render).toHaveBeenCalledTimes(renderCount);
    expect(shell.render).toHaveBeenLastCalledWith(false, { isFirstRun: true });
    expect(s.page.enable).toHaveBeenCalledOnce();
    expect(s.page.disable).toHaveBeenCalledTimes(2);
    runtime.destroy();
  });

  it('keeps a newer watched value over a stale initial read', async () => {
    const s = setup();
    const start = s.runtime.start();
    s.emit(false);
    s.resolve({ enabled: true });
    await start;
    expect(s.page.enable).not.toHaveBeenCalled();
    expect(s.page.disable).toHaveBeenCalledTimes(1);
    s.runtime.destroy();
  });

  it('forwards a watched key deletion as first-run OFF state', async () => {
    const s = setup();
    const shell = { mount: vi.fn(), render: vi.fn(), destroy: vi.fn() };
    const runtime = createApplicationRuntime(s.settings, s.page, shell);
    const start = runtime.start();
    s.resolve({ enabled: true, isFirstRun: false });
    await start;

    s.emit(false, true);

    expect(shell.render).toHaveBeenLastCalledWith(false, { isFirstRun: true });
    expect(s.page.disable).toHaveBeenCalledOnce();
    runtime.destroy();
  });

  it('does not overwrite a newer watched state when a save resolves, or revive after invalidation', async () => {
    const s = setup();
    const start = s.runtime.start();
    s.resolve({ enabled: true }); await start;
    let finish!: () => void;
    vi.mocked(s.settings.setEnabled).mockImplementation(() => new Promise<void>((resolve) => { finish = resolve; }));
    const save = s.runtime.setEnabled(false);
    s.emit(false); s.emit(true);
    finish(); await save;
    expect(s.page.enable).toHaveBeenCalledTimes(2);
    expect(s.page.disable).toHaveBeenCalledTimes(1);
    const pending = s.runtime.setEnabled(false);
    s.runtime.destroy();
    finish(); await pending;
    expect(s.page.disable).toHaveBeenCalledTimes(1);
  });

  it('enables synchronously before the settings write settles', async () => {
    const s = setup();
    const start = s.runtime.start();
    s.resolve({ enabled: false });
    await start;
    let finish!: () => void;
    vi.mocked(s.settings.setEnabled).mockImplementation(() => new Promise<void>((resolve) => {
      finish = resolve;
    }));

    const save = s.runtime.setEnabled(true);
    expect(s.page.enable).toHaveBeenCalledTimes(1);
    expect(s.settings.setEnabled).toHaveBeenCalledWith(true);
    finish();
    await save;
    expect(s.page.enable).toHaveBeenCalledTimes(1);
  });

  it('rolls back an optimistic enable when saving fails', async () => {
    const s = setup();
    const start = s.runtime.start();
    s.resolve({ enabled: false });
    await start;
    vi.mocked(s.settings.setEnabled).mockRejectedValue(new Error('storage unavailable'));

    const save = s.runtime.setEnabled(true);
    expect(s.page.enable).toHaveBeenCalledTimes(1);
    await expect(save).rejects.toThrow('storage unavailable');
    expect(s.page.disable).toHaveBeenCalledTimes(2);
  });

  it('keeps a newer storage event when an optimistic enable write fails', async () => {
    const s = setup();
    const start = s.runtime.start();
    s.resolve({ enabled: false });
    await start;
    let fail!: (error: Error) => void;
    vi.mocked(s.settings.setEnabled).mockImplementation(() => new Promise<void>((_resolve, reject) => {
      fail = reject;
    }));

    const save = s.runtime.setEnabled(true);
    s.emit(false);
    fail(new Error('storage unavailable'));
    await expect(save).rejects.toThrow('storage unavailable');
    expect(s.page.enable).toHaveBeenCalledTimes(1);
    expect(s.page.disable).toHaveBeenCalledTimes(2);
  });

  it('keeps OFF deferred until persistence succeeds', async () => {
    const s = setup();
    const start = s.runtime.start();
    s.resolve({ enabled: true });
    await start;
    let finish!: () => void;
    vi.mocked(s.settings.setEnabled).mockImplementation(() => new Promise<void>((resolve) => {
      finish = resolve;
    }));

    const save = s.runtime.setEnabled(false);
    expect(s.page.disable).not.toHaveBeenCalled();
    finish();
    await save;
    expect(s.page.disable).toHaveBeenCalledOnce();
  });

  it('unsubscribes and disposes on initialization failure', async () => {
    const s = setup();
    const start = s.runtime.start();
    s.reject(new Error('storage unavailable'));
    await expect(start).rejects.toThrow('storage unavailable');
    expect(s.unwatch).toHaveBeenCalledTimes(1);
    expect(s.page.destroy).toHaveBeenCalledTimes(1);
    s.emit(true);
    expect(s.page.enable).not.toHaveBeenCalled();
  });
});
