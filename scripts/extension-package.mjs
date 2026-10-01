import { readFileSync, realpathSync, statSync } from 'node:fs';
import { basename, isAbsolute, join, relative, sep } from 'node:path';

const hosts = ['https://mountainproject.com/*', 'https://www.mountainproject.com/*'];
const same = (actual, expected) => Array.isArray(actual)
  && JSON.stringify([...actual].sort()) === JSON.stringify([...expected].sort());

export function packageBrowser(browser = 'chrome') {
  if (!['chrome', 'whale'].includes(browser)) throw Error(`Unsupported package browser: ${browser}`);
  return browser;
}

export function localReference(value) {
  if (typeof value !== 'string' || !/^[\w./-]+$/.test(value)
    || value.split('/').some(part => !part || part === '.' || part === '..')) {
    throw Error(`Unsafe package reference: ${value}`);
  }
  return value;
}

export function inspectManifest(manifest, version, readFile, browser = 'chrome') {
  packageBrowser(browser);
  if (manifest.version !== version || manifest.manifest_version !== 3
    || manifest.name !== 'Mountain Project Korea (비공식)') {
    throw Error('Package product, version or MV3 does not match.');
  }
  if (!manifest.action || typeof manifest.action !== 'object'
    || ['sidebar_action', 'browser_action', 'page_action', 'side_panel'].some(key => key in manifest)) {
    throw Error('An MV3 toolbar action is required; sidebar and legacy actions are not allowed.');
  }
  if (!same(manifest.permissions, ['storage']) || !same(manifest.host_permissions, hosts)
    || !same(manifest.optional_permissions ?? [], []) || !same(manifest.optional_host_permissions ?? [], [])) {
    throw Error('Package permissions must be storage and the two Mountain Project HTTPS hosts only.');
  }
  if (!Array.isArray(manifest.content_scripts) || manifest.content_scripts.length !== 1
    || !same(manifest.content_scripts[0].matches, hosts)
    || !Array.isArray(manifest.content_scripts[0].js) || !manifest.content_scripts[0].js.length) {
    throw Error('Content scripts must reference local scripts on the two Mountain Project HTTPS hosts.');
  }
  const icons = manifest.icons;
  if (!icons || typeof icons !== 'object' || Array.isArray(icons) || !Object.keys(icons).length) {
    throw Error('Package icons are required.');
  }
  const actionIcons = manifest.action.default_icon;
  const required = [
    'THIRD_PARTY_NOTICES.txt', manifest.action.default_popup, ...Object.values(icons),
    ...(typeof actionIcons === 'string' ? [actionIcons] : Object.values(actionIcons ?? {})),
    ...manifest.content_scripts.flatMap(script => [...script.js, ...(script.css ?? [])]),
  ];
  for (const reference of required) {
    const data = readFile(localReference(reference));
    if (!data?.length) throw Error(`Missing or empty package file: ${reference}`);
  }
  return manifest;
}

export function inspectBuildDirectory(directory, version, browser = 'chrome') {
  packageBrowser(browser);
  if (basename(directory) !== `${browser}-mv3`) throw Error(`Wrong build target: expected ${browser}-mv3`);
  const root = realpathSync(directory);
  const readFile = (reference) => {
    const file = realpathSync(join(root, localReference(reference)));
    const path = relative(root, file);
    if (isAbsolute(path) || path === '..' || path.startsWith(`..${sep}`) || !statSync(file).isFile()) {
      throw Error(`Package reference is not a local file: ${reference}`);
    }
    return readFileSync(file);
  };
  return inspectManifest(JSON.parse(readFile('manifest.json')), version, readFile, browser);
}
