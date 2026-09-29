import { readFileSync } from 'node:fs';
import type { ExtensionSettings } from '@/core/settings';
const mock = vi.hoisted(() => ({
  listener: undefined as undefined | ((settings: ExtensionSettings) => void),
  get: vi.fn(async () => ({ enabled: true })),
  setEnabled: vi.fn(async (_enabled: boolean) => {}),
  unwatch: vi.fn(),
}));
vi.mock('wxt/browser', () => ({ browser: { runtime: { getManifest: () => ({ version: '0.1.0' }) } } }));
vi.mock('@/platforms/webextension/settings-repository', () => ({
  WebExtensionSettingsRepository: class {
    get = mock.get;
    setEnabled = mock.setEnabled;
    watch(listener: (settings: ExtensionSettings) => void) { mock.listener = listener; return mock.unwatch; }
  },
}));
const popupHtml = readFileSync('src/entrypoints/popup/index.html', 'utf8');
const input = () => document.querySelector<HTMLInputElement>('#enabled')!;
const state = () => document.querySelector('#state')!.textContent;
const error = () => document.querySelector<HTMLElement>('#error')!;
const settle = async () => { for (let i = 0; i < 6; i++) await Promise.resolve(); };

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  mock.get.mockResolvedValue({ enabled: true });
  mock.setEnabled.mockResolvedValue(undefined);
  // Import the entrypoint through Vitest so its storage mock is used; do not fetch it as an HTML script.
  document.body.innerHTML = popupHtml.match(/<body>([\s\S]*?)<\/body>/)![1]!
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
});
afterEach(() => {
  window.dispatchEvent(new Event('pagehide'));
  document.querySelectorAll('[data-mpkr-popup-theme]').forEach(node => node.remove());
});

it('keeps the open popup synchronized with header changes and saves popup changes', async () => {
  await import('@/entrypoints/popup/main');
  await settle();
  expect(input().checked).toBe(true);
  expect(document.querySelector('#destination svg')).toBeNull();
  mock.listener!({ enabled: false });
  expect(input().checked).toBe(false);
  expect(state()).toBe('꺼짐');
  input().click();
  await settle();
  expect(mock.setEnabled).toHaveBeenCalledWith(true);
  expect(input().checked).toBe(true);
  expect(state()).toBe('켜짐');
  expect(error().hidden).toBe(true);
  window.dispatchEvent(new Event('pagehide'));
  expect(mock.unwatch).toHaveBeenCalledTimes(1);
});

it('disables the switch during storage operations and restores the last saved state after a failed write', async () => {
  let resolveRead!: (value: ExtensionSettings) => void;
  mock.get.mockImplementationOnce(() => new Promise(resolve => { resolveRead = resolve; }));
  await import('@/entrypoints/popup/main');
  expect(input().disabled).toBe(true);
  expect(state()).toBe('확인 중');
  resolveRead({ enabled: true });
  await settle();
  expect(input().disabled).toBe(false);
  let rejectWrite!: (reason: Error) => void;
  mock.setEnabled.mockImplementationOnce(() => new Promise((_resolve, reject) => { rejectWrite = reject; }));
  input().click();
  expect(input().disabled).toBe(true);
  rejectWrite(new Error('storage failure'));
  await settle();
  expect(input().checked).toBe(true);
  expect(input().disabled).toBe(false);
  expect(state()).toBe('켜짐');
  expect(error().hidden).toBe(false);
  expect(error().textContent).toContain('저장하지 못했습니다');
  input().click();
  await settle();
  expect(input().checked).toBe(false);
  expect(state()).toBe('꺼짐');
  expect(error().hidden).toBe(true);
});

it('keeps the switch disabled and provides recovery guidance when initial settings cannot be loaded', async () => {
  mock.get.mockRejectedValueOnce(new Error('storage unavailable'));
  await import('@/entrypoints/popup/main');
  await settle();
  expect(input().disabled).toBe(true);
  expect(state()).toBe('확인 실패');
  expect(error().hidden).toBe(false);
  expect(error().textContent).toContain('팝업을 닫고 다시 열어 주세요');
  expect(mock.unwatch).toHaveBeenCalledTimes(1);
});
