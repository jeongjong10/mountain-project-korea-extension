import { NavigationControls } from '../ui/navigation-controls';
import { createMountainProjectApplication } from '../application/mountain-project-application';
import { createApplicationRuntime } from '../application/runtime';
import { ChromeTranslationProvider } from '../platforms/chrome/chrome-translation-provider';
import { WebExtensionSettingsRepository } from '../platforms/webextension/settings-repository';
import { MOUNTAIN_PROJECT_MATCH_PATTERNS } from '../sites/mountain-project/contract/origins';

export default defineContentScript({
  matches: [...MOUNTAIN_PROJECT_MATCH_PATTERNS],
  allFrames: true,
  runAt: 'document_idle',
  async main(ctx) {
    const runtime = createApplicationRuntime(
      new WebExtensionSettingsRepository(),
      createMountainProjectApplication(new ChromeTranslationProvider()),
      new NavigationControls(),
    );
    // Register before the asynchronous settings read so invalidation cannot leak work.
    ctx.onInvalidated(() => runtime.destroy());
    await runtime.start();
  },
});
