import { readFileSync } from 'node:fs';
import { inspectBuildDirectory } from '../../scripts/extension-package.mjs';

const [directory, browser, ...extra] = process.argv.slice(2);
if (!directory || !browser || extra.length) throw Error('Usage: package-verified.mjs <directory> <chrome|whale>');
const { version } = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
inspectBuildDirectory(directory, version, browser);
console.log(`Package manifest and local references verified: ${browser} ${version}`);
