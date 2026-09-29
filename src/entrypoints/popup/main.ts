import { createApplicationRuntime } from '../../application/runtime';
import { WebExtensionSettingsRepository } from '../../platforms/webextension/settings-repository';
import { UI_TOKEN_CSS } from '../../ui/design-tokens';
import { SOUTH_KOREA_AREA_URL } from '../../sites/mountain-project/contract/regions/south-korea';
import { browser } from 'wxt/browser';

const theme = document.createElement('style');
theme.dataset.mpkrPopupTheme = '';
theme.textContent = UI_TOKEN_CSS;
document.head.append(theme);

const enabled = document.querySelector<HTMLInputElement>('#enabled');
const status = document.querySelector<HTMLElement>('#status');
const state = document.querySelector<HTMLElement>('#state');
const error = document.querySelector<HTMLElement>('#error');
const destination = document.querySelector<HTMLAnchorElement>('#destination');
const version = document.querySelector<HTMLElement>('#version');
if (!enabled || !status || !state || !error || !destination || !version) throw new Error('Popup controls are missing');
destination.href = SOUTH_KOREA_AREA_URL;
version.textContent = browser.runtime.getManifest().version;

const showError = (message: string) => {
  error.textContent = message;
  error.hidden = false;
};

let current = false;
const render = (value: boolean) => {
  current = value;
  enabled.checked = value;
  state.textContent = value ? '켜짐' : '꺼짐';
  status.textContent = value
    ? '번역, 지도·통계 등 페이지 편의 기능이 켜져 있습니다.'
    : '원래 페이지로 표시합니다. 다시 켜면 확장 기능이 적용됩니다.';
  error.hidden = true;
  error.textContent = '';
};
const runtime = createApplicationRuntime(new WebExtensionSettingsRepository(), {
  enable: () => {},
  disable: () => {},
  destroy: () => {},
}, {
  mount: () => {},
  render,
  destroy: () => {},
});
window.addEventListener('pagehide', () => runtime.destroy(), { once: true });
enabled.disabled = true;
void runtime.start().then(() => { enabled.disabled = false; }).catch(() => {
  state.textContent = '확인 실패';
  status.textContent = '확장 기능 설정을 확인할 수 없습니다.';
  showError('설정을 불러오지 못했습니다. 팝업을 닫고 다시 열어 주세요.');
});
enabled.addEventListener('change', async () => {
  enabled.disabled = true;
  error.hidden = true;
  try { await runtime.setEnabled(enabled.checked); }
  catch {
    enabled.checked = current;
    showError('설정을 저장하지 못했습니다. 다시 시도해 주세요.');
  } finally { enabled.disabled = false; }
});
