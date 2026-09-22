import { WebExtensionSettingsRepository } from '../../platforms/webextension/settings-repository';

const settings = new WebExtensionSettingsRepository();
const enabled = document.querySelector<HTMLInputElement>('#enabled');
const status = document.querySelector<HTMLElement>('#status');

if (!enabled || !status) {
  throw new Error('Popup controls are missing');
}

const renderStatus = (value: boolean) => {
  status.textContent = value ? '번역 켜짐' : '번역 꺼짐';
};

settings.get().then((current) => {
  enabled.checked = current.enabled;
  renderStatus(current.enabled);
});

enabled.addEventListener('change', async () => {
  enabled.disabled = true;
  await settings.setEnabled(enabled.checked);
  renderStatus(enabled.checked);
  enabled.disabled = false;
});
