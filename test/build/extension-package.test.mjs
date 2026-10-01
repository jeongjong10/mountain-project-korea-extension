import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { inspectManifest, inspectBuildDirectory, localReference } from '../../scripts/extension-package.mjs';

const hosts = ['https://mountainproject.com/*', 'https://www.mountainproject.com/*'];
function manifest() {
  return {
    name: 'Mountain Project Korea (비공식)', version: '0.1.0', manifest_version: 3,
    permissions: ['storage'], host_permissions: hosts,
    action: { default_popup: 'popup.html', default_icon: { 16: 'icon/16.png' } },
    icons: { 16: 'icon/16.png' },
    content_scripts: [{ matches: hosts, js: ['content-scripts/content.js'] }],
  };
}
const references = new Map([
  ['THIRD_PARTY_NOTICES.txt', Buffer.from('Notices')],
  ['popup.html', Buffer.from('<html></html>')],
  ['icon/16.png', Buffer.from('icon')],
  ['content-scripts/content.js', Buffer.from('void 0;')],
]);
const inspect = (value, files = references, browser = 'whale') => inspectManifest(value, '0.1.0', p => files.get(p), browser);

test('the shared validator accepts only the Chrome and Whale MV3 toolbar packages', () => {
  assert.equal(inspect(manifest()).manifest_version, 3);
  assert.equal(inspect(manifest(), references, 'chrome').manifest_version, 3);
  assert.throws(() => inspect(manifest(), references, 'firefox'), /browser/);
  for (const patch of [
    { manifest_version: 2 }, { version: '0.1.1' }, { name: 'Different product' },
    { action: undefined }, { sidebar_action: {} }, { browser_action: {} }, { side_panel: {} },
  ]) assert.throws(() => inspect({ ...manifest(), ...patch }));
});

test('permissions and content-script hosts cannot exceed the two MP HTTPS origins', () => {
  for (const patch of [
    { permissions: ['storage', 'tabs'] }, { permissions: [] },
    { optional_permissions: ['tabs'] }, { optional_host_permissions: ['<all_urls>'] },
    { host_permissions: [...hosts, 'https://example.com/*'] },
    { host_permissions: ['http://mountainproject.com/*', hosts[1]] },
    { content_scripts: [] }, { content_scripts: [{ matches: ['<all_urls>'], js: ['content-scripts/content.js'] }] },
    { content_scripts: [{ matches: hosts, js: [] }] },
    { content_scripts: [{ matches: hosts }] },
  ]) assert.throws(() => inspect({ ...manifest(), ...patch }));
});

test('every manifest popup, icon, script and optional CSS reference must exist and be nonempty', () => {
  for (const name of references.keys()) {
    const files = new Map(references); files.delete(name);
    assert.throws(() => inspect(manifest(), files), /Missing/);
    files.set(name, Buffer.alloc(0));
    assert.throws(() => inspect(manifest(), files), /empty/);
  }
  for (const patch of [
    { action: { default_popup: 'popup.html', default_icon: 'icon/missing.png' } },
    { action: {} }, { icons: {} },
    { content_scripts: [{ matches: hosts, js: ['content-scripts/content.js'], css: ['assets/missing.css'] }] },
  ]) assert.throws(() => inspect({ ...manifest(), ...patch }));
});

test('remote, absolute, encoded, Windows and escaping references are rejected before reading', () => {
  for (const reference of [
    'https://example.com/popup.html', '//example.com/popup.html', '/popup.html', '../popup.html',
    'assets/../../popup.html', 'C:/popup.html', 'icon\\16.png', '%2e%2e/popup.html',
    'popup.html?remote=true', 'popup.html#fragment', './popup.html', 'assets//x.js', '',
  ]) {
    assert.throws(() => localReference(reference), /Unsafe/);
    assert.throws(() => inspect({ ...manifest(), action: { default_popup: reference } }), /Unsafe/);
  }
});

test('build inspection rejects the wrong browser directory, missing files and escaping symlinks', t => {
  const root = mkdtempSync(join(tmpdir(), 'mpkr-package-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const directory = join(root, 'whale-mv3');
  mkdirSync(join(directory, 'icon'), { recursive: true });
  mkdirSync(join(directory, 'content-scripts'));
  for (const [name, data] of references) writeFileSync(join(directory, name), data);
  writeFileSync(join(directory, 'manifest.json'), JSON.stringify(manifest()));
  assert.equal(inspectBuildDirectory(directory, '0.1.0', 'whale').version, '0.1.0');
  assert.throws(() => inspectBuildDirectory(directory, '0.1.0', 'chrome'), /Wrong build target/);
  assert.throws(() => inspectBuildDirectory(directory, '0.1.0', 'firefox'), /browser/);
  rmSync(join(directory, 'popup.html'));
  assert.throws(() => inspectBuildDirectory(directory, '0.1.0', 'whale'), /ENOENT/);
  writeFileSync(join(root, 'outside.html'), '<html></html>');
  symlinkSync(join(root, 'outside.html'), join(directory, 'popup.html'));
  assert.throws(() => inspectBuildDirectory(directory, '0.1.0', 'whale'), /not a local file/);
});
