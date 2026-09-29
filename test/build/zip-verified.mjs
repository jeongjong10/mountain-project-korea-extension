import { execFileSync } from 'node:child_process';
import { zip } from 'wxt';

await zip({
  hooks: {
    'zip:start': (wxt) => {
      execFileSync(
        process.execPath,
        ['test/build/content-script-smoke.mjs', wxt.config.outDir],
        { stdio: 'inherit' },
      );
    },
  },
});
