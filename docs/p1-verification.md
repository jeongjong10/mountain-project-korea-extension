# P1 verification

## 2026-09-29 Feature Request content correction

- Feature Request titles and descriptions now use structured translation with the existing original/retranslate controls. Metadata, form values and the site's original data remain intact.
- Help tests passed (8/8), including dynamic replacement, cached reuse, original/retry controls, newline/link preservation and input/vote protection. Product/test type checks, Chrome MV3 build and existing bundle smoke passed.
- Built content script SHA-256: `46c7daa37bfa72478132c5eacc2000448dcfd3584c37934deaebf5f4d6cfe174`. The public Help Hub script was inspected to confirm source-data-backed editing/filtering. Native translation quality and live submissions/votes were not exercised in this focused correction. No browser was opened.

## 2026-09-29 About and Help Hub follow-up

- Added `/about` detection and guarded prose translation, plus fixed heading/stat labels. Contributor/admin identities, ranks, counts, links and formatting remain unchanged.
- Help Hub now collects Getting Started card headings/body and topic introductions; Feature Request filters, split form labels, notifications and option display labels are localized without changing authored data or submitted category values.
- Focused checks passed in separate runs: About 1, Help 8, route contracts 89 and page capabilities 39. No whole-suite claim. Happy DOM 18 required test-only retention of weak observer callbacks and an ancestor-selector workaround; native Chromium subtree queries matched all four card headings.
- Production/test type checks and the Chrome MV3 build with existing content-script smoke passed. The browser-checked content script was `a589c6e52c3b77eb710689f061e078899ab9ab7268b3d4a4e676be9f7122f895`; concurrent work later replaced `.output`, so this is not a claim about every subsequent bundle.
- Task-owned Chromium 149 loaded the real extension on public `/about` and `/help-hub`. About headings/stat labels, four Getting Started cards (13 inline targets), translated CTA, Feature Request category selection, modal labels and implicit option value preservation were confirmed. Native body translation remained in language-pack preparation; translation quality and live submission/voting were not validated.
- The task-owned browser wrapper/profile and delegated agent were closed. No user browser or unrelated working session was stopped.

Current-source synchronization note (2026-09-28): this file preserves time-stamped P1 evidence for older working artifacts. The current implementation has since added section retranslation, long-comment paragraph splitting and further tests. Use `README.md` and `docs/translation-runtime.md` for current behavior, and use the latest synchronization result recorded below or in the project SSOT for current test/build counts. Historical 416-test and frozen-artifact claims remain evidence for those exact runs only.

Latest local check (2026-09-28 14:38 KST): production and test TypeScript checks passed. The full Vitest run completed 51/52 files and 489/490 tests; `comment-visibility.test.ts` exceeded its 5 s limit only in that parallel run. An immediate single-worker rerun passed the file 5/5 and the affected 250-row case in 1.217 s. Chrome MV3 and Firefox MV2 builds both passed with 285.92 kB content scripts and 296.38/296.52 kB total output. This is current working-tree evidence, not a clean committed release snapshot.

Latest scope note (2026-09-28 afternoon): the working Chrome output changed after the historical 416-test/build record. The limited live follow-up at the end of this report uses an explicitly frozen `631dfdbb…` artifact. It confirms selected live behavior, but actual Translator output/original-text restoration and final release-artifact identity remain open. Do not read the historical status below as acceptance of later output bytes.

Status: technical remediation and integrated verification complete. All three previously failing files pass (12/12), source/test typechecks pass, the full suite passes 48 files / 416 tests, and the final Chrome build includes byte-identical runtime notices. Earlier failures below are preserved as superseded evidence. This does not assert that publication or every external release condition is complete.

Verified on 2026-09-28, Asia/Seoul, against the concurrently edited working tree. This verifier owns only `test/boundary/application-boundary.test.ts` and this report. No Git operations, dependency installs, package/config changes, or product edits were performed by this verifier; concurrent owners' changes are preserved. Temporary smoke tooling/results are under `/tmp`.

## Remediation verification

The boundary check now parses actual TypeScript imports/access expressions and resolves lexical bindings using the already-installed TypeScript 7 API. It allows the local DOM `browser` variable without renaming product code. Regression cases retain detection of unbound/ambient `browser` and `chrome`, explicit global-object access, WXT entrypoint calls, aliased imports, re-exports, import types, dynamic import, and require. API-looking comments/string content is ignored.

Focused command with the environment below: `node_modules/.bin/node node_modules/vitest/vitest.mjs run test/boundary/application-boundary.test.ts --maxWorkers=1 --minWorkers=1`. At 11:32:16 KST, exit 0: 1 file / 4 tests passed in 23.01 s. Its final form also passed in the combined check below.

Main confirmed translation owner `01a0e5d8-eff2-7791-96b2-1d5c28ac0fbc` and license owner `01a0e5d9-9ea7-70a1-9a05-a3264995abce` complete. Translation fixes are test-only bounded MutationObserver draining/cleanup and fake-timer coverage, with no product changes or timeout increases. License notices are in `public/THIRD_PARTY_NOTICES.txt` (6,232 B). Privacy publication is independent and was reported by main as blocked by GitHub integration permissions (no remote commit, public URL still 404); it is not claimed complete here.

Integrated commands use the same environment as the historical checks:

| Command | Actual result |
| --- | --- |
| `node_modules/.bin/node node_modules/typescript/bin/tsc -p tsconfig.json --noEmit` | Exit 0 after both owners completed. |
| `node_modules/.bin/node node_modules/typescript/bin/tsc -p tsconfig.test.json --noEmit` | Exit 0, including the AST boundary test. |
| `node_modules/.bin/node node_modules/vitest/vitest.mjs run test/boundary/application-boundary.test.ts test/localization/help-pages.test.ts test/localization/comment-visibility.test.ts --maxWorkers=2 --minWorkers=1` | Exit 0, 11:38:50 KST, 41.40 s: 3 files / 12 tests passed. |
| `node_modules/.bin/node node_modules/vitest/vitest.mjs run --maxWorkers=2 --minWorkers=1` | Exit 0, 11:40:00 KST, 378.58 s: 48 files / 416 tests passed, zero failures. Run once in this remediation pass; no timeout increases or assertion removal. |
| `node_modules/.bin/node node_modules/wxt/bin/wxt.mjs build` | Exit 0 after both owners completed and the suite passed; one Chrome build in this remediation pass. WXT 0.21.4 / Vite 6.4.3, 4.910 s reported. |

## 2026-09-28 11:47 artifact snapshot — superseded

Final `.output/chrome-mv3` version `0.1.0`, manifest timestamp `2026-09-28T02:47:16.326Z` (11:47:16 KST). At 11:47:50 KST, Node assertions on parsed JSON confirmed the name `Mountain Project Korea (비공식)`, description `Mountain Project 지원 페이지의 한국어 번역과 탐색을 돕는 비공식 확장 프로그램.`, exactly `storage`, the two MP HTTPS host patterns, matching content-script hosts, `all_frames: true`, and `document_idle`. The description matches current `wxt.config.ts`; concurrent edits removed the earlier non-affiliation sentence. That edit was preserved, not performed by this verifier.

| Output | Bytes |
| --- | ---: |
| `manifest.json` | 582 |
| `popup.html` | 753 |
| `chunks/popup-CKHHAwiW.js` | 2,502 |
| `assets/popup-C3EY_dD4.css` | 389 |
| `content-scripts/content.js` | 240,663 |
| `THIRD_PARTY_NOTICES.txt` | 6,232 |
| Total | 251,121 |

`assert.deepEqual` confirmed the packaged notice bytes exactly equal `public/THIRD_PARTY_NOTICES.txt`; the notice covers WXT 0.21.4, @wxt-dev/browser 0.3.0, Vite 6.4.3 and esbuild 0.25.12. No fixture or preview files are packaged. Current artifact inventory and hashes are saved in `/tmp/mpkr-p1-remediation-artifact.json`:

- Content script: `cb824136b239d547fd56b2bf8b7a140c64b3df465cf1197c2039012ce9951cc1`, timestamp `2026-09-28T02:47:15.616Z`.
- Manifest: `7c977902759201331b987e203d544177dd76f32eb4d617e0a5b2f670e31a0243`.
- Packaged notices: `91c9fa018994aaf8487ab1c5a1bb90419d084b35a906cfdc0de131a3b1f315ec`.

No whole-site smoke was repeated in this remediation pass. The browser observations below apply to their recorded earlier content hashes, not this changed final content script or the user's installed extension. The historical browser exceptions, actual Translator output, unopened map iframe, and main-reported privacy publication block are not closed by passing unit tests/build. Asset-review findings beyond inclusion of the supplied runtime notices remain with that review/main.

## Historical checks (superseded)

From the repository root, each command used `PATH="$PWD/node_modules/.bin:$PATH" TMPDIR=/tmp`:

| Command | Actual result |
| --- | --- |
| `node_modules/.bin/node node_modules/typescript/bin/tsc -p tsconfig.json --noEmit` | Exit 0; current source passes. |
| `node_modules/.bin/node node_modules/typescript/bin/tsc -p tsconfig.test.json --noEmit` | Exit 0; current tests pass typechecking, including the supplied Chrome provider context fields. |
| `node_modules/.bin/node node_modules/vitest/vitest.mjs run` | Run once, 11:18:41 KST; exit 1 after 149.19 s. 44 files passed, 3 failed; 403 tests passed, 3 failed (406 total). Chrome provider: 2 passed. |

The initial failures that triggered remediation:

1. `test/boundary/application-boundary.test.ts:31`: reports `ui/region-directory.ts: extension or WXT API`. Inspection of `src/ui/region-directory.ts:79` shows a local `HTMLDivElement` named `browser`; its `.className`, `.append`, and `.hidden` accesses match the test's text regex. This is a boundary-check false positive, not evidence of an extension API escaping its platform layer.
2. `test/localization/help-pages.test.ts`: dynamic Help Hub search-result heading remained `How do I add a route?` instead of containing the mock translation prefix. Cause unresolved; no real machine translation is involved in this test.
3. `test/localization/comment-visibility.test.ts:33`: the six-visible-ticks / two-entering-rows scenario timed out at 5000 ms. Cause unresolved; do not dismiss as flaky without further evidence.

The passing generic-area tests emitted happy-dom warnings that iframe page loading is disabled. Their success is not live iframe verification. Previous 52+8 results were not reused as current acceptance evidence. Concurrent edits mean this run is a time-bounded observation, not an immutable source snapshot.

## Historical isolated browser smoke

Completed 11:21:36-11:22:07 KST using existing cached Chromium 1228 (`Chrome/149.0.7827.55`) and Node's native WebSocket/CDP, without installation. A fresh `/tmp/mpkr-p1-live-*` profile loaded the actual `.output/chrome-mv3` extension; the user's browser was never attached. The harness blocked 53 non-GET requests and performed no login or site submission. Its browser process was terminated after completion.

Command: `node_modules/.bin/node /tmp/mpkr-p1-live-smoke.mjs` with the environment above. Sandbox launch failed with crashpad `setsockopt: Operation not permitted`; an authorized unsandboxed isolated launch succeeded. Temporary harness readiness/escaping errors were corrected before accepting observations. Results: `/tmp/mpkr-p1-live-results.json`.

All four original MP pages returned HTTP 200. Each had the expected page-kind marker, ready/enabled state, exactly one header switch and one South Korea link, disabled/inactive state after OFF, and ready/enabled state after ON again. Visible header text restored English while OFF and Korean while ON; this is not a whole-DOM equality claim.

| Original MP path | Additional observation |
| --- | --- |
| `/` | Detected `main`; Korean gateway copy reverted to the original heading while OFF. |
| `/area/106225629/south-korea` | Detected `area`; original map link remained `https://www.mountainproject.com/map/106225629/south-korea`. Collapsed map was not opened, so map iframe loading is not verified. |
| `/route/105872668/whitney-gilman-ridge` | Detected `route`; original stats link retained the matching `/route/stats/105872668/whitney-gilman-ridge` URL. Exactly one stats iframe before and after ON/OFF/ON; inside it, `route-stats`, enabled, one header switch, zero nested stats iframes. |
| `/route/stats/105872668/whitney-gilman-ridge` | Detected `route-stats`; toggles worked without creating another stats iframe. |

Limits: original-source link destinations were inspected, not clicked. No translated blocks or original-text toggle controls appeared: the `Translator` API existed, but model availability/output and original-text toggling were not verified. Six `Runtime.exceptionThrown` events were recorded only as `Uncaught`; attribution was not captured, so this is not an error-free-console claim. The smoke used one default headless viewport and bounded waits; it does not cover visual layout, all dynamic states, or arbitrary reinjection.

## Historical artifact and release gate

The four-page smoke used the pre-final content script, SHA-256 `391ea365ea1ffc2475daf8d0a44abbcb9bc0bf8742673760bca8978476355fd4`, timestamp `2026-09-28T02:21:22.440Z` (11:21:22 KST). Its manifest already contained the store owner's unofficial/non-affiliation copy. The final content script differs, so the four-page smoke is not claimed as testing every final byte.

Main explicitly confirmed store owner `01a0e5cd-dfd3-72e1-ae49-f347530433ca` complete and final build allowed. The verifier then ran exactly one Chrome build: `node_modules/.bin/node node_modules/wxt/bin/wxt.mjs build`, with the environment above. Exit 0; WXT 0.21.4 / Vite 6.4.3 reported 5.986 s total. Final manifest written `2026-09-28T02:23:08.260Z` (11:23:08 KST), version `0.1.0`.

Final manifest was parsed and assertions passed at 11:23:27 KST:

- Name: `Mountain Project Korea (비공식)`.
- Description: `Mountain Project 지원 페이지의 한국어 번역과 탐색을 돕는 비공식 확장 프로그램. Mountain Project 및 onX와 제휴하지 않습니다.`
- Permissions exactly `storage`; host permissions and content-script matches exactly `https://mountainproject.com/*` and `https://www.mountainproject.com/*`; `all_frames: true`, `document_idle`.
- Popup title remains `Mountain Project Korea`; it is distinct from the updated store manifest name.

Final `.output/chrome-mv3` inventory: `manifest.json` 637 B; `popup.html` 753 B; `chunks/popup-CKHHAwiW.js` 2,502 B; `assets/popup-C3EY_dD4.css` 389 B; `content-scripts/content.js` 241,845 B. Five files total 246,126 B; no packaged fixture or preview files. Content timestamp `2026-09-28T02:23:07.623Z`, SHA-256 `f3e89dedf8471c8977db170e64394779d88b43424206583926451ed807ea13dc`; manifest SHA-256 `51b9ef17cca6646aeb0e60fafa042029e4ed582340d8e68d895b1bf373301032`.

Final-artifact route-only smoke passed at 11:23:45-11:23:54 KST: `node_modules/.bin/node /tmp/mpkr-p1-live-smoke.mjs final-route`, exit 0, same final content hash as above. Route detection, OFF/ON, one header switch and original stats URL passed. The stats iframe count was 1 -> 0 -> 1; restored iframe detected `route-stats`, had one switch, and contained no nested stats iframe. Results are in `/tmp/mpkr-p1-final-route-results.json`; its temporary browser terminated. Two `Cannot read properties of undefined (reading 'ready')` exceptions had stacks through MP's `ap-vendor-full.js` dynamic evaluation; cause remains unresolved, including possible effects of blocking 23 non-GET requests. Passing scoped assertions does not establish a clean console.

At that historical stage, the automated suite had not been rerun. The separately owned [asset and attribution review](asset-and-attribution-review.md) tracks its own residual findings; this technical report does not independently close those findings. No Firefox/Safari build, zip, publication, store submission, or Notion write was performed by this verifier.

No claim is made that any locally built artifact matches the user's installed extension. Real Translator model output, logged-in flows, account writes, broad browser/device coverage, and final release readiness are not established by these checks.

## 2026-09-28 afternoon scoped live follow-up

Task scope was read from the [final-artifact live verification card](https://app.notion.com/p/3e958ad3a0b2816da450d05e6cce3a0b) and [handoff](https://app.notion.com/p/3e958ad3a0b281459b4cfa80f4a170cf). The verifier changed only this report in the repository. No product edits, rebuild, full-suite rerun, dependency installation, Git mutation, login, comment/activity write, permission inquiry, or store submission was performed. Existing changed/deleted/untracked files were preserved.

### Artifact identity and concurrency

- HEAD remains `27bc57526e60a47f368d462040b215c9fba8b222`, branch `feature/asia-scope`; this is not a clean source snapshot.
- Initial read found content SHA-256 `a15c537eb271afcf29ff90baeb2c966b53c1f1919dfdf1d6eadf5a9c8abf9c96`, 261,505 bytes, mtime 13:39:22 KST. It already differed from the historical `cb824136…` artifact.
- Before the live run, the working output changed again. The artifact actually loaded by the browser was copied to an isolated `/tmp` directory and every file's SHA-256/size compared before use. Content SHA-256: **`631dfdbb8296e2c04bc6d0fb8fe97ac1e5f2ec087c0fcc438d80212c83e4c32b`**, 260,221 bytes, mtime `2026-09-28T04:42:46.926Z` (13:42:46 KST).
- Manifest remains SHA-256 `7c977902759201331b987e203d544177dd76f32eb4d617e0a5b2f670e31a0243`, 582 bytes, version 0.1.0, mtime 13:42:47 KST. The packaged notice remains `91c9fa018994aaf8487ab1c5a1bb90419d084b35a906cfdc0de131a3b1f315ec`, 6,232 bytes. Six files total 270,679 bytes.
- Both the 13:43:40–13:44:21 KST extension/baseline comparison and the 13:44:59–13:45:39 KST one-page diagnostic used these same six hashes. Source output remained byte-identical during each completed run. This does **not** bind the historical 416 tests to the later content script.
- A subsequent attempt to copy the working output failed with `ENOENT` for `.output/chrome-mv3/src/entrypoints/popup` while that directory was changing. No browser launched for that failed attempt. Remaining attribution observation therefore uses the already frozen `631dfdbb…` copy. The current workspace output must be matched to an agreed release candidate before final acceptance; this verifier did not stop or modify other work.
- At report close, the working content script read as `e8152d4a6c9faec6f8e27ede7f38c339baccb46dbf63da4364b8a659066d3362`. It differs from the tested frozen artifact and was not silently substituted into these results.

### Execution and environment

Pre-existing Chrome for Testing `149.0.7827.55` was launched headlessly in fresh temporary profiles, controlled by native Node WebSocket/CDP. No connection was made to the user's running browser. A default-sandbox `about:blank` preflight failed before DevTools startup with Crashpad `setsockopt: Operation not permitted` / `SIGTRAP`; the official `require_escalated` approval path then permitted the same isolated launch and limited tests. No approval rejection or Windows UI bypass occurred. The Computer Use skill was read, but its required `node_repl` tool was not provided; Windows automation was not attempted.

All browser-page requests other than GET/HEAD/OPTIONS were blocked. The first extension run blocked 45 such requests, and its no-extension comparison blocked 15. This prevents the observations from representing an unrestricted production network session. The browsers were terminated after each bounded run. The follow-up removed `--disable-gpu` and `--disable-background-networking` after observing an environment-dependent map failure; no unsafe WebGL opt-in flag or site security bypass was added.

### Confirmed behavior and remaining gaps

| Scope | Actual observation | Limit |
| --- | --- | --- |
| South Korea Area | HTTP 200, page kind `area`, ready/enabled, one working header switch; OFF gives inactive/disabled, ON restores ready/enabled and one switch. | This is not whole-DOM equivalence or authenticated-input verification. |
| Whitney–Gilman Ridge Route | HTTP 200, kind `route`; ON/OFF/ON works. Stats iframe count is **1 → 0 → 1**; the re-created iframe reaches `route-stats`, enabled, one switch, **zero nested stats iframes**. | Limited representative path; no account operations were submitted. |
| Original navigation links | Map URL remains `https://www.mountainproject.com/map/106225629/south-korea`; stats URL remains `https://www.mountainproject.com/route/stats/105872668/whitney-gilman-ridge`. Both iframe documents returned HTTP 200. | Link preservation and actual iframe load are confirmed; no statement about arbitrary links. |
| Map opening | A real pointer click opened the map toggle and loaded the iframe. With default GPU settings, actual South Korea satellite tiles, route/area markers, map controls and a visible canvas rendered. OFF removes the iframe; ON re-creates the collapsed map section without a duplicate frame. | Map visual/attribution findings below apply to the recorded desktop viewport only. |
| Chrome Translator | API exists; `availability({sourceLanguage:'en',targetLanguage:'ko'})` returned **`downloadable`**. An explicit real `Translator.create` diagnostic with user activation `true` remained **pending after 18 seconds**, with no download-progress event or translated output. No mocked translation/provider was injected. | Neither successful model output nor a permanent model failure was established. This is a bounded initialization wait, not proof that the API cannot work. |
| Original-text control | Machine-translation blocks and `.mpkr-original-toggle` were **0** on Area and Route. Dictionary-translated Korean UI was visible. | Actual machine translation, its original-text toggle, and restoration of that translated source remain **unverified**. Korean labels alone do not close this requirement. |

### Exception attribution

In the first identical-environment comparison, both **with and without the extension** had the same `TypeError: Cannot read properties of undefined (reading 'ready')` pattern, two events per Area and Route. Captured stacks point through MP's `ap-vendor-full.js` dynamic evaluation and each page's AJAX `success` handler (Area lines 373/397; Route lines 315/339 in the downloaded documents). The extension is therefore not required to reproduce this symptom under those conditions. This does not prove a pure upstream bug: request blocking and browser flags remain possible contributors, and an unrestricted network control was not performed.

The initial map attempt with GPU disabled emitted `Failed to initialize WebGL` through MP's `maps.js`, produced an empty map, and exposed no attribution nodes. The one-page diagnostic after removing the GPU/background-network disabling flags rendered map tiles and had zero captured `Runtime.exceptionThrown` events. Two launch options and timing changed together, so the exact cause of disappearing `ready` exceptions is not isolated. Neither result is a site-wide clean-console claim.

### Map attribution visibility

The final bounded observation (13:46:59–13:47:21 KST) used the existing frozen `631dfdbb…` artifact, Area only, and normal outer-page scrolling. The source iframe was 1,218 × 760 CSS pixels within a 1,440 × 1,100 viewport. Actual tiles and markers rendered; 24 non-GET/HEAD/OPTIONS requests were blocked and zero runtime exceptions were captured for this short run.

- `a.mapboxgl-ctrl-logo` points to `https://www.mapbox.com/`, computed `display:block`, `visibility:visible`, and an 88 × 23 pixel box inside the iframe (local x=282, y≈685.6). This establishes presence and in-frame geometry, **not unobscured visual display**.
- `© Mapbox`, `© OpenStreetMap`, and `Improve this map` links exist in the frame DOM, but each had `visibility:hidden` and a zero-size rectangle in this observation. No conclusion is drawn about the cause or what attribution is legally sufficient.
- Before scrolling, the outer page's native registration notice overlays the lower map area. After ordinary scrolling, the screenshot shows the iframe's own native “Join the Community! It's FREE” notice covering the map's lower section, including the logo's expected position. The outer-document hit test returned the iframe at the logo center; that does not rule out this **inside-frame** overlay. The screenshot therefore prevents claiming the provider credit is visibly unobscured or the attribution requirement passed.
- No login, registration, overlay dismissal/bypass, or product style changes were used to alter that state. Agreed iframe header/footer/cookie UI behavior was not changed. This remains a targeted presentation/source-comparison follow-up for the implementation/asset owners; the user need not sign in just to make this verification pass.

Attribution evidence: `/tmp/mpkr-final-scoped-gDafjO/results.json` and `/tmp/mpkr-final-scoped-gDafjO/extension-area-attribution-after-scroll.png`. Attribution is **open**, despite successful map rendering.

### User-dependent follow-up and evidence

No user account access is needed for the remaining representative checks. First coordinate and freeze the actual release candidate internally; copying or reloading a moving `.output` cannot establish release identity. Once fixed, the smallest useful user-assisted check is in a Chrome profile where the English→Korean model finishes initialization: open the representative route, activate translation by one normal page click if prompted, wait for actual Korean body text, then use **원문 보기 → 원문 숨기기 → extension OFF** on that same section. Record the extension build identity and a screenshot/result. If model initialization stays pending, report that state instead of claiming a renderer failure. Do not ask for login, comments, climbing records, or external message submission.

The permanent evidence is this report. Temporary reproducibility material (not required to exist in future handoffs): `/tmp/mpkr-final-scoped-live.mjs`; initial comparison `/tmp/mpkr-final-scoped-p7tuJp/results.json`; one-page model/map diagnostic `/tmp/mpkr-final-scoped-lZWspU/results.json`; screenshots in those run directories. These screenshots contain live upstream page content and are verification evidence, not approved public demo/store assets.

Result: limited live checks are documented; the final-artifact task is **not fully accepted**. Remaining acceptance conditions are actual machine translation plus original restoration, attribution visibility/remaining cause, and matching all accepted evidence to the agreed release artifact. Historical account/form unit tests remain historical automated evidence; no real user input/account-write flows were exercised here.

## 2026-09-28 13:52–13:55 KST bounded gap follow-up

This follow-up reused `/tmp/mpkr-final-scoped-lZWspU/chrome-mv3` after rechecking its content SHA-256 equals the same frozen `631dfdbb8296e2c04bc6d0fb8fe97ac1e5f2ec087c0fcc438d80212c83e4c32b`. It did not copy, rebuild, or retest the changing workspace output. The previous model-attempt profile `/tmp/mpkr-final-scoped-lZWspU/profile-Wk64iY` was reused to retain any downloaded component state. A separate fresh profile with extensions disabled provided the original-map control. Same Chrome for Testing version, default GPU/background-network settings, initial 1,440 × 1,100 viewport and GET/HEAD/OPTIONS-only page-request policy were used. This section narrows earlier uncertainties without changing product code or agreed iframe UI.

### Actual model initialization: 180-second bound

One real `Translator.create({sourceLanguage:'en',targetLanguage:'ko'})` attempt ran with `navigator.userActivation.isActive === true`, a download-progress listener, and the previously used isolated profile. The API returned initial availability `downloadable`. The attempt was observed about every 10 seconds while the independent map comparison ran.

- At the 180-second deadline it still had status **creating**, with **zero download-progress events**, no resolved translator, no translated result, no error/rejection, and zero extension machine-translation blocks/original-text controls.
- The profile contains `TranslateKit/lib` and `TranslateKit/models/en_ko` / `en_es` directories, but the bounded filesystem inventory found no payload files in those directories. Directory existence is not evidence of a completed model download.
- This closes the short-wait ambiguity: the model did not become usable within a three-minute real initialization attempt in this environment. It still does **not** prove permanent model failure or a product translation/renderer defect. The browser was closed at the deadline; no additional retries, alternate provider, injected translation, unsafe feature flags or download-access bypass were used.
- Actual translation and original restoration therefore remain open. The next useful check is the already identified same-build Chrome/profile where the language pack can complete, not another unit-test or dictionary-label check. No account login is required for that translation check.

### Attribution: original source versus extension iframe

The original URL `https://www.mountainproject.com/map/106225629/south-korea` was opened directly without the extension and compared with the actual embedded map document. The two documents contained **byte-identical `#attribution-popup` outerHTML**: class `display-none`, with `© Mapbox`, `© OpenStreetMap`, and `Improve this map` links inside. Both were initially collapsed (`display:none`, zero rectangle; child `.info` visibility hidden). The hidden text links therefore reflect an observed original-site state; they are not evidence that this extension independently deleted those credits. No exposed attribution disclosure button was found in the recorded map button/title/id/class candidates in either document. The popup was not force-opened via script or CSS.

The Mapbox **logo** has a different practical outcome:

| Observation | Original map without extension | Extension map iframe |
| --- | --- | --- |
| Native access notice | `#access-gate`, fixed, z-index 999; same registration/login wording | Same native gate exists inside the frame |
| Initial desktop view | Logo 88 × 23 px at y=869, above the gate starting around y=901; screenshot and hit test show it unobscured | Logo 88 × 23 px at frame-local y≈685.6; gate starts around y=561.3 and covers it |
| Same 1,218 × 760 viewport | Native page can scroll (`scrollHeight=1509`, `clientHeight=760`) | Frame document has no vertical scroll range (`scrollHeight=clientHeight=760`) |
| Ordinary scroll comparison | After 400 px normal page scroll, logo is at y=469; the top hit-test element is the logo anchor and the screenshot visibly shows it | Inner scrollY is 0; at the logo center the top elements are `access-gate__message/content/wrap`, then `#access-gate`, with the logo underneath |

This identifies a concrete **layout/scroll interaction between the embedded document and the original fixed notice**. The observation supports checking whether the embedded layout can reserve unobscured map space or preserve useful normal scrolling while retaining the original notice. It does not authorize removing the notice, bypassing sign-in, forcibly exposing hidden source controls, or reverting the agreed header/footer UI. No such change was made. The native source's collapsed copyright presentation remains a separate source/policy review question; visual presence alone is not a licensing conclusion.

The visible registration/login message was treated as an access boundary: no login, registration, notice dismissal, hidden-node click, credential use, or map-data write was attempted. Only ordinary map opening, window-size change and scrolling were used; remaining product presentation work can be done internally without asking the user to sign in to make this check pass.

### Evidence and resulting status

Run: 13:52:17–13:55:23 KST. The extension page/frame blocked 22 non-read requests; original-map control blocked 13. Four `ready` exceptions occurred in the extension Area/frame's MP AJAX handlers during this run and none in the direct-map control. The earlier matched Area/Route comparison already reproduced this exception without the extension, so this differing route/timing comparison does not overturn that finding or establish a single cause.

Temporary evidence: `/tmp/mpkr-gap-check-WcrVEP/results.json`, `attribution-controls.json`, `map-native-controls.json`, `original-map-matched-viewport.json`, `scroll-comparison.json`, and `translatekit-inventory.json`. Visual comparison: `original-map.png`, `extension-map.png`, and `original-map-matched-scrolled.png` in that same directory. The report above is the durable record. Both isolated browsers were closed after the bounded follow-up.

Status remains **partial / acceptance open**. Model initialization is now characterized over 180 seconds, and the attribution concern is narrowed from unspecified missing credits to a demonstrated iframe layout/scroll problem plus an unchanged original collapsed popup. No user decision is required to investigate the layout internally. Final real-model/original-restoration verification and release-artifact identity still need closure.

## 2026-09-28 14:44–14:48 KST final RC representative live verification

The historical observations above remain attached to their original artifacts. This new run used a frozen copy of `.output/chrome-mv3/`, content SHA-256 **`b4ee302460f300be7e964459320c6082e0db5f59ab890f5e846bc8274c15554d`**. All six artifact file hashes matched before and after both extension runs. The root coordinator supplied this build after source/test type checks, 52 test files / 490 tests, and its build passed. No product change or rebuild occurred during live verification. The owner later requested removal of unnecessary additions: the duplicate build/ZIP and redundant summary were deleted after verifying that all six files in the retained `.output/chrome-mv3/` matched the tested copy.

Chrome `154.0.8037.57` reused an isolated profile containing the official English→Korean model. Browser-target CDP `Extensions.loadUnpacked` loaded the actual RC; no mock provider, translated-text injection, user profile, login, form submission, gate dismissal or hidden attribution disclosure was used. Page requests were restricted to GET/HEAD/OPTIONS. All browsers were terminated.

The South Korea Area and representative Whitney Gilman Ridge Route both produced actual Korean machine-translation bodies. Original-text controls showed the original and returned to the preceding display state. OFF preserved the inspected source nodes, text and child identity/order (2 Area + 3 Route sections), and removed all translation blocks and original toggles. Empty `style` attributes can remain; after normalizing only these attributes, inspected source HTML matched. This is not a byte-for-byte whole-DOM claim.

Route stats loaded its real root, had zero nested stats frames, and followed **1→0→1** on ON/OFF/ON. Its existing single frame-local extension switch was preserved. The map rendered real satellite imagery/markers and, after normal iframe scrolling, the actual Mapbox logo was unobscured in both inner and outer hit tests and the inspected screenshot. The native access notice remained visible with the same internal content and links; OFF removed the added space/style. The source attribution popup remained unchanged and collapsed.

The map notice's padding/height changes during scrolling were independently reproduced without the extension at the same viewport. The original `climb-main.js` scroll handler changes its padding after 100px; this is native behavior, not notice removal. The initial harness's stricter conditions (all Area paragraphs hidden, no frame-local switch, byte-identical notice outerHTML across native scrolling) were corrected in the derived summary, with raw results preserved.

After an additional 10 seconds, each page had 11 nonempty translation bodies. Route still retained originals in **Protection (501 characters)** and **two photo-card captions (57 characters each)** with the intended placeholder-integrity warning. These 3 translations were not completed. Source reading and DOM observation support an intentional original-preservation fallback, not a proven renderer/content-loss defect; the specific failed token/model output was not isolated. Translation coverage and linguistic quality remain limited, and no complete-page translation claim is made.

The initial run captured two MP `ready` TypeErrors on Area and none on Route. The follow-up captured the same two plus one gstatic reCAPTCHA `charCodeAt` error. Recorded stacks did not point to extension source. Request restrictions and timing remain possible contributors, so a clean-console or pure-upstream-cause claim is not made.

**Result:** the agreed RC's representative real-model/original-restoration, map-layout and stats ON/OFF checks are now confirmed with the stated coverage limits. This closes the earlier environment-bound verification gaps for this RC; it is not store approval, license clearance, authenticated-input verification, full translation coverage, or proof about the user's installed copy.

Full concise report: `docs/rc-live-verification-2026-09-28.md`. Permanent minimal evidence: `docs/evidence/rc-live-verification-2026-09-28.json` (hashes, counts, booleans, geometry and bounded failure locations; no full source/gate HTML or advertising query strings). Raw local runs: `/tmp/mpkr-rc-live-Eql8g6/results.json`, `/tmp/mpkr-rc-restore-followup-GENVDq/results.json`, `/tmp/mpkr-native-notice-GIJq0O/results.json`. Map screenshot: `/tmp/mpkr-rc-live-Eql8g6/area-map-scrolled.png`. These live-content screenshots are local verification evidence, not cleared public demo/store assets.

## 2026-09-28 14:51–14:53 KST source/document synchronization

This check ran against the current `feature/asia-scope` working tree at HEAD `27bc57526e60a47f368d462040b215c9fba8b222`, including the existing large uncommitted change set. It validates the working tree, not a clean commit or a newly frozen release candidate.

The supported page contract now includes the contribution families used by Area `Add To Page` and `Improve This Page`: supported `/add`, `/edit`, `/suggest`, `/share`, `/improvement` and model `/updates` paths. Fixed contribution-form labels, helper text, buttons and placeholders are localized. Area-page improvement forms inserted later by AJAX are handled by the direct localizer's existing observer. User-authored field values, native submit values, form metadata and implicit option submission values remain unchanged.

Verification result:

- `npm run check`: production and test TypeScript checks passed; **52/52 files and 490/490 tests passed**.
- `npm run build`: Chrome MV3 passed; 296.38 kB WXT summary, content script 285.92 kB.
- `npm run build:firefox`: Firefox MV2 passed; 296.52 kB WXT summary, content script 285.92 kB.
- Both content scripts have SHA-256 `b4ee302460f300be7e964459320c6082e0db5f59ab890f5e846bc8274c15554d`.
- `git diff --check` passed.
- The two expected happy-dom iframe-load warnings in generic Area tests remain test-environment diagnostics; both tests passed.

The authenticated Codex in-app browser session was not programmatically inspectable through the tools available to this task. Therefore this synchronization does not claim that every login-only menu variant or a real contribution submission was exercised. The source, README, translation-runtime specification and Notion status deliberately distinguish implemented path/form support from that remaining live verification.

## 2026-09-29 번역 실패 3곳 수정·검증

Chrome 내장 모델의 실제 출력을 확인해 긴 보호 표식의 누락과 숫자 삽입을 재현했다. 요청별 복원 목록은 유지하면서 모델에 보내는 표식만 `ZXQ0QXZ` 형태로 줄이고 정책 버전을 `mpkr-policy-4`로 올렸다. 대소문자 외의 ID 변형, 누락·중복·알 수 없는 ID는 계속 거부한다. 원문과의 표식 충돌, ID 1/10 구분 및 요청 간 캐시·복원 값 분리도 검사했다. 구조 복원·controller의 실패 시 원문 보존 규칙은 변경하지 않았다.

전체 검사에서 함께 발견한 고정 UI 보호 과잉은 Route Finder 카드 메타정보, 프로필 탐색 탭 및 댓글 보기 링크의 구체적 문맥만 예외 처리했다. 일반 루트명·사용자명 보호와 URL·폼 값은 유지한다. 테스트의 오래된 UI 클래스·고정 노드 비용을 현재 renderer에 맞추고 실패 후 관찰자가 다음 테스트에 남지 않게 정리했다. 번역 관련 4파일 106개, 추가 UI·경계·성능 관련 9파일 50개 표적 검사가 통과했다.

소스·테스트 TypeScript 검사와 Chrome MV3·Firefox MV2 빌드 및 출력 번들 smoke 검사가 통과했다. 두 content script의 SHA-256은 `8c10e772e5c3bd732805bc5b288538eca61be580decfcd41e3d5fa7392570722`다. 각 빌드는 기존 `.output/`에 있으며 별도 패키지·ZIP·데모·보고서는 만들지 않았다.

실제 Chrome 154.0.8037.57의 격리 프로필에 위 Chrome 산출물을 확장으로 로드했다. 공식 영어→한국어 모델을 사용했고 10개 파일 해시가 실행 전후 동일했다. Whitney Gilman Ridge Route의 기존 실패 3곳 모두 번역됐다: Protection 231자와 원래 줄바꿈 2개, 사진 설명 2곳 각각 27자와 난이도 `5.7` 보존. Route 14개·South Korea Area 11개 번역 블록에 내용이 표시됐고 보호 실패 안내·노출 표식은 0개였다.

두 페이지에서 실제 버튼 클릭으로 원문 보기·숨기기를 확인했다. OFF 후 조사한 Route 17개·Area 9개 원문의 텍스트·노드 동일성·자식 순서가 복원됐고, 빈 `style` 속성만 정규화하면 HTML도 같았다. 번역 블록·원문 토글은 제거됐으며 Route 통계 iframe은 1→0이었다. 전체 페이지 완역률·언어 품질이나 로그인 쓰기 검증으로 확대하지 않는다.

임시 근거: `/tmp/mpkr-native-repro-zm7hqzsg/extension-live-followup-8c10e772.json`, SHA-256 `43818ae06444b5527492bc86effb56e6823e365804997f85bc2525e629e6bcb3`. 이 절에 결과를 남겨 임시 파일의 지속 보관을 요구하지 않는다. 사이트 `ap-vendor-full.js`의 `ready` TypeError 4건이 관찰됐고 확장 코드 stack은 없었으나, GET/HEAD/OPTIONS 외 요청 30건을 차단한 환경이므로 원인을 단정하지 않는다. 사용자 프로필·로그인·게시물 제출은 사용하지 않았고 검사 브라우저는 종료했다.

동시에 진행된 다른 MP 작업이 드롭다운 계약·fixture를 변경했다. 위 산출물 검증을 그 후속 기여 폼·드롭다운 변경까지 통과한 것으로 사용하지 않는다. 해당 작업 담당에게 변경 완료 후 최종 통합 빌드·검사 필요사항을 전달했다. 이 기록은 기존 번역 실패 3곳의 해결이며 공개 배포 HOLD, 사용자 담당 onX/MP 문의 및 Store 제출 직전 감사의 상태를 변경하지 않는다.

최종 전체 검사 관측은 09:23:04 KST 시작, 301.86초, 56파일 중 54파일·553개 중 551개 통과였다. 남은 2개는 250행 가시성 사례의 5초 시간초과와 실행 중 변경된 드롭다운의 `Wrong Map Location?` 검사다. 가시성 파일은 같은 5초 제한·단일 worker 재검증에서 5/5 통과했고 해당 사례는 3.392초였다. 후속 드롭다운 검사는 해당 병렬 작업의 통합 검증에 남긴다. 전체 553/553 통과로 기록하지 않는다. 이번 변경의 `git diff --check`는 통과했다.


## 2026-09-29 설악산 Description 번역 실패 복구

설악산 Area `/area/115392007/seoraksan-national-park-sokcho`의 설명은 하나의 `<p>` 안에 줄바꿈 4개가 들어 있는 981자 본문이다. 실제 Chrome 154 영어→한국어 모델에서 전체 입력의 줄바꿈 보호 표식 누락·변형을 재현했다. 빈 줄만 분리한 재현 입력도 실패했다.

기존 번역이 보호 토큰 검증에서 실패한 경우에만, 루트 레벨의 단일 줄바꿈까지 경계로 나누어 한 번 복구한다. 모든 구간과 최종 구조를 검증한 뒤 원래 줄바꿈으로 결합하고 원래 요청 캐시 키에 저장한다. 중첩 링크·강조·목록은 자르지 않으며 구간 하나라도 실패하면 전체 원문을 유지한다.

관련 4파일 59개 테스트, production/test 타입 검사, Chrome·Firefox 빌드 및 각 출력 번들 smoke를 통과했다. 두 content script SHA-256은 `8d6f575b0aea4f76a20fbaaab5884dfc8104f9fd7c055b80aaf1463e5d6d2a79`다. 이번 빌드에는 별도 요청된 원문 보기·재번역 버튼의 텍스트 디자인 복원도 포함됐다.

격리된 Linux Chrome에 이 빌드를 실제 확장으로 로드하고 내장 번역 모델로 확인했다. 설명 전체 번역, 줄바꿈 4개·이메일 보존, 설명 실패 안내 0개, 원문 보기·숨기기 및 OFF 후 검사한 원본 7개 노드의 동일성·내용 복원을 확인했다. 실제 버튼의 배경은 투명, 테두리·내부 여백은 0px, 텍스트는 밑줄이었다. 검사 도중 산출물 해시는 바뀌지 않았다. [검증 기록](../design/review/2026-09-29/seoraksan/verification.json), [실제 적용 화면](../design/review/2026-09-29/seoraksan/description-translated.png).

이 결과는 번역 실패 복구 검증이며 지명·문장 표현 등 모델 출력의 번역 품질 전체를 승인한 것은 아니다. 사용자 Chrome 프로필은 사용하지 않았다. 사이트 `ap-vendor-full.js`의 `undefined.ready` 예외 2건이 기록됐고, GET/HEAD/OPTIONS 외 요청을 차단한 검사 환경이므로 원인을 단정하지 않는다.
