import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { zip } from 'wxt';
import { inspectBuildDirectory, packageBrowser } from '../../scripts/extension-package.mjs';
import { inspectZip } from '../../scripts/release.mjs';

const args = process.argv.slice(2);
if (args.length && (args.length !== 2 || args[0] !== '--browser')) {
  throw Error('Usage: zip-verified.mjs [--browser chrome|whale|edge]');
}
const browser = packageBrowser(args[1]);
const { name, version } = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));

await zip({
  browser,
  manifestVersion: 3,
  hooks: {
    'zip:start': (wxt) => {
      if (wxt.config.browser !== browser || wxt.config.manifestVersion !== 3) throw Error('Wrong ZIP build target');
      inspectBuildDirectory(wxt.config.outDir, version, browser);
      execFileSync(
        process.execPath,
        ['test/build/content-script-smoke.mjs', wxt.config.outDir],
        { stdio: 'inherit' },
      );
    },
    'zip:extension:done': (_wxt, zipPath) => {
      if (basename(zipPath) !== `${name}-${version}-${browser}.zip`) throw Error('Wrong ZIP output target');
      inspectZip(readFileSync(zipPath), version, browser);
      console.log(`ZIP manifest and local references verified: ${browser} ${version}`);
    },
  },
});
