# Sidebar Runtime Error Investigation (2026-09-28)

## Report and Current Evidence

- Report: `ReferenceError: SIDEBAR_LINK_PATHS is not defined`, `content-scripts/content.js:346`, on `/route/105798994/high-exposure`.
- The current source and both built bundles contain no `SIDEBAR_LINK_PATHS` reference. `src/ui/left-sidebar-toggle.ts` imports `SIDEBAR_PAGE_PATH_PREFIXES` from the shared site contract. Line 346 of the investigated Chrome bundle is a CSS background declaration, not the reported JavaScript reference.
- The investigated content SHA256 is `b4ee302460f300be7e964459320c6082e0db5f59ab890f5e846bc8274c15554d`. The user's loaded extension directory and in-memory content script were not accessible. An older loaded bundle or retained error record is plausible, not proven. This report does not mark the user's observed failure resolved.

## Prevention Changes

- Production builds now require TypeScript checking. Previously `wxt build` transpiled without that gate, allowing undefined TypeScript symbols to survive a build.
- A focused test covers High Exposure URL-based sidebar classification without the `#route-page` wrapper.
- `test/build/content-script-smoke.mjs` executes the emitted content script, including its async entrypoint, on synthetic Route and Area DOM. It checks initialization, sidebar open/close, OFF/ON, reinjection, duplicate settings subscriptions and runtime errors. Browser storage is mocked; iframe loads and external requests are disabled. This is not full browser or translation-engine verification.
- Chrome ZIP packaging runs the same smoke check at WXT's `zip:start` hook, before creating a new archive. Direct WXT CLI calls bypass these project command gates.
- This investigation made no product-source or UI-behavior changes to suppress the reported error. A concurrent sidebar source change was preserved, not reverted; the final artifact was rebuilt from that working tree and checked separately below.

## Live Check and Limits

A separate temporary Chrome profile loaded the actual unpacked Chrome artifact. High Exposure reached `mpKoreaCore=ready`, had one rail labeled `다른 루트`, and sidebar open/close changed both `aria-expanded` and panel visibility correctly. The reported ReferenceError was not observed during that flow.

The subsequent page-reload check timed out awaiting `Runtime.evaluate`; the overall browser script exited unsuccessfully. Reload is therefore not recorded as passed. Two captured exceptions traversed Mountain Project's `ap-vendor-full.js` and AJAX handlers, with no extension stack frame. Non-read requests were blocked during this check, so no claim is made that those site exceptions are independent of the test conditions.

Temporary raw evidence: `/tmp/mpkr-sidebar-live-vJ30Xe/results.json`. The test browser was terminated and no user login profile was used.

## Final Artifact Verification

- Chrome and Firefox build commands passed the new typecheck and emitted-bundle smoke gates. Both final content scripts have SHA256 `7f8a67ad780d08a1a40b870d6d595d71818b5d127a6ce1551e5068d0e60c565a`.
- Sidebar unit tests: 19/19 passed initially; the final working-tree rerun, including concurrent additions, passed 21/21. The full suite was not rerun for this focused change.
- Negative control: a temporary artifact with an undefined `SIDEBAR_LINK_PATHS` reference was rejected by the smoke command with exit code 1. No product source was mutated for this check.
- A second real Chrome run loaded the final artifact on High Exposure. Startup and sidebar open/close passed, with zero captured extension exceptions. Evidence: `/tmp/mpkr-sidebar-live-9SiYYf/results.json`. Two site-path exceptions remained under the read-only request restriction.
- The second live run deliberately covered initial navigation and sidebar interaction only. It does not replace the earlier failed reload result. The synthetic bundle test covers reinjection and OFF/ON, not a real site reload.
- ZIP helper syntax and failure propagation were tested with mocks; no new ZIP was generated in this investigation.

## User Installation Follow-up

Reload the unpacked extension from this repository's `.output/chrome-mv3`, then reload the site tab; rebuilding files alone does not replace a content script already executing in a tab. If a new error is captured afterwards, obtain the loaded extension directory and the newly captured stack/source. Preserve the distinction between an old stored error and a new failure. Do not conclude that this is a stale installation until that identity is checked.

### Repeated Report After Reload

The user reported that reloading did not remove the error. This remains unresolved in the user's browser.

A targeted read of Chrome's extension installation metadata in both local profiles found the same extension ID, `ddmpejdbjngfoljiiabiclkohhopodpf`, registered at `C:\Users\JJY\Desktop\AI Agent 작업 폴더\MountainProjectKoreaExtension\.output\chrome-mv3`. Thus the available evidence does not support blaming an incorrectly selected installation directory. No login information or browsing history was read.

Both filesystem path case variants exposed to the coding environment return content hash `7f8a67ad780d08a1a40b870d6d595d71818b5d127a6ce1551e5068d0e60c565a`; line 346 is a CSS `min-height` declaration. That establishes the on-disk build available here, not the user's in-memory script. A direct Windows file cross-check could not run because PowerShell execution returned `Exec format error`.

The next evidence requested is a screenshot of the source around the error's `content-scripts/content.js:346`, preferably from a newly captured error after clearing the error list and revisiting High Exposure. Do not repeat reload-only advice or mark this resolved without identifying the failing source.

### Pasted Error-Viewer Source

The user's subsequent attachment contained line-number labels, the visible content script, and a final notice that 118 lines were not displayed. After removing the display labels and normalizing CRLF, all 243,005 visible code characters exactly matched the prefix of the verified `7f8a67...` bundle. Line 346 was `min-height: 124px;`. The sidebar used the declared `Cr={area:"/area/",route:"/route/"}` constant, not `SIDEBAR_LINK_PATHS`.

Chromium's implementation explains how a historical error can appear against updated source:

- [ErrorConsole::OnExtensionInstalled](https://github.com/chromium/chromium/blob/main/chrome/browser/extensions/error_console/error_console.cc#L223) preserves runtime errors across extension reloads; manifest errors are removed separately.
- [Error-page source selection and Clear All](https://github.com/chromium/chromium/blob/main/chrome/browser/resources/extensions/error_page.ts) use the stored stack location to request source and a separate operation to delete errors.
- [DeveloperPrivateRequestFileSourceFunction](https://github.com/chromium/chromium/blob/main/chrome/browser/extensions/api/developer_private/developer_private_functions.cc) reads the file at the current extension path rather than retaining the original failing bundle.

Official Chromium main was checked on 2026-09-28; the user's installed Chrome version was not independently checked. The attachment establishes the displayed source's identity, not the originating build or whether a fresh error was added. The user was asked whether Clear All preceded a newly observed occurrence. The issue remains open until that distinction is confirmed.

During this comparison another task rebuilt Chrome to `e7482ccf6ab5abffa56bbb4a76081bbfeffce6585064427e5ea1a69eca1319c6`; the untouched Firefox artifact still matched `7f8a67...` and confirmed the prefix comparison. This investigation did not change product source, rebuild, or suppress error reporting in this follow-up.
