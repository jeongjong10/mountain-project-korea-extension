# Fixture sanitization completion record

Completed locally: 2026-09-28. Scope approved by the owner: replace identity-bearing and authored fixture content with fictional regression data while retaining useful Mountain Project interoperability contracts. This record covers fixture work only; the parallel demo and map work have separate records.

## Result

Eleven fixture files and ten test files were updated. Rendered personal identities, profile/activity identifiers, copied comments, forum text, Tick notes and photo captions in the identified samples were replaced with fictional labels and independently written text. The eight-paragraph High Exposure sample was replaced by an invented **Fixture Skyline** description. An additional long-comment fixture and real identities inside contact/parser/Tick tests were included after the broader scan found them.

Some filenames and exported constant names retain their historical names to preserve imports. Their headers now distinguish synthetic content from source-informed DOM structure; those names do not identify an author of the replacement prose. The `900000...` values are locally selected synthetic test identifiers, not verified Mountain Project records.

No product source, map-specific test, Git history, remote branch, repository visibility or email was changed by this work. The existing worktree was preserved, including the prior migration from tracked `src/` tests to the current untracked `test/` tree. These replacements are not yet a published cleanup.

## Fixture decisions and retained coverage

| Fixture | Completed treatment | Regression meaning retained |
| --- | --- | --- |
| `test/localization/fixtures/chan-kim-community.html` | Fictional profile, counts, dates, route/area/comment/forum identifiers, comment and forum subject/body. | Profile tabs, dynamic forum sections, localized dates/counts/actions, original prose and permalink preservation. |
| `test/localization/fixtures/chan-kim-contributions.html` | Fictional user/contribution destinations, dates/counts, photo caption and improvement ID. | Desktop/mobile route rows, area/photo sections, table headings, action node and data-ID preservation. |
| `test/fixtures/mountain-project/chouinard-b-route.ts` | Fictional contributor/admin/commenter, activity/photo IDs, dates and all narrative/caption samples. External icon `src` references removed; stylesheet test node uses empty `data:text/css,`. | Route/category collection, grade/coordinate/name protection, comment expansion, inline actions, forms, original toggles, stats layout and node restoration. Factual Chouinard route destinations and route metadata remain deliberate interoperability examples. |
| `test/fixtures/mountain-project/swan-slab-gully-stats.ts` | Fictional rating/star/To-Do/Tick users, record IDs, dates and note. External icon `src` references removed. | Fixed stats UI, private-row label, grade/date/user exclusion from translation, chart/button nodes, Tick text-node restoration and dynamic rows. Factual route destination retained. |
| `test/fixtures/mountain-project/bryan-hylenski-comment.ts` | Entirely new three-paragraph fictional training-room text, fictional author/record/date and example.com diagram link. | Three provider requests, four `<br>` elements, protected linked destination/text, whole-comment failure, retry and source visibility. |
| `test/fixtures/mountain-project/high-exposure-description.ts` | Eight new paragraphs about an imaginary route; four sample links, pitch labels and grades retained as test concepts. | Eight translated records and rendered paragraphs; exactly four glossary-integrity failures, four paragraph-local fallbacks and twelve provider calls. Expectations were preserved. |
| `test/fixtures/mountain-project/asia-area.html` | Description/access/extra-section/comment prose rewritten independently; fictional photo reference. | Area landmarks, additional sections, responsive layout and sidebar/map URL contracts. Factual Asia/country/route destinations retained. |
| `test/fixtures/mountain-project/sun-shade.ts` | Fictional descriptive text and omission of two external icon `src` references. | Optional Area/Route contexts, direction/time formatting, canvas/SVG nodes, dynamic insertion, restored controls and unchanged map destination. |
| `test/fixtures/mountain-project/south-korea-route-finder.ts` | External pagination icon `src` references removed; provenance/scope header clarified. | One factual route in desktop/mobile views plus the purposeful `Rock`/`Area` proper-name case, pagination, filters and form values. Further row deletion would remove useful distinct cases. |
| `test/fixtures/mountain-project/pigeon-route-stats.ts` | Header explicitly identifies already-generated fictional people/values and sample statistics. | Generated repeated rows and differing column counts needed by progressive stats/layout tests; factual route destination retained. |
| `test/ui/fixtures/region-directory.html` | Independently assembled representative markup: 19 links reduced to 7, synthetic counts; 10,637 → 2,527 bytes. | Nested state/continent rows and intentional desktop/mobile duplication, exact node/markup restoration, tab navigation and original click handlers. Factual destination links retained. |

The seven factual region rows in `test/ui/fixtures/south-korea-area-list.html` were retained: they exercise distinct grouping/sorting cases, including the extra area outside the main region groups. `south-korea-area-priority.html` already uses controlled route/prose examples and fixed UI wording; no blanket rewrite was needed. Purpose-built `date-ui.ts` and `translation-quality-corpus.ts` were retained. Keeping these selectors, factual names and destinations does not assert rights clearance for all site-derived material.

All inventoried fixture image `src` references to site assets were removed while the relevant image nodes and accessibility attributes remain. This is a scoped fixture result: navigation links and intentional resource-handling examples elsewhere in tests remain, and no image/font binaries were downloaded.

## Exact test files updated

- `test/localization/direct-page-localizer.live-user-pages.test.ts`
- `test/localization/route-page-live-dom.test.ts`
- `test/localization/route-stats-live-dom.test.ts`
- `test/localization/page-translation-controller.test.ts`
- `test/localization/format-preservation.test.ts`
- `test/localization/translation-quality-integration.test.ts`
- `test/localization/direct-page-localizer.user-pages.test.ts`
- `test/localization/sun-shade-localization.test.ts`
- `test/sites/mountain-project/contract/routes.test.ts`
- `test/ui/route-stats-presentation.test.ts`

Contact tests retain recipient preservation, entered values, checkbox state, action/method, dynamic errors and restoration with a fictional recipient. URL parser tests keep supported/unsupported/trailing-slash cases using fictional profiles. Dynamic Tick tests retain author/date exclusion and the identity of the original note text node.

## Verification

Focused tests ran using the repository's Node binary and Vitest 3.2.7 with `TMPDIR=/tmp`:

1. Initial affected run: 16 files, 169 tests. Four assertions failed: one stale translated-date expectation and one synthetic-description glossary count, plus two cascading failures after the date assertion left its localizer active. The fixture and stale date expectation were corrected; no product code or fallback-count expectation was changed.
2. Final affected rerun: **6 files, 91 tests passed** — route page, translation quality, contact/user pages, sun/shade, URL contracts and stats presentation.
3. Together with the unaffected successes from the first run, **18 affected files / 175 unique tests passed at their latest focused execution**. The successful first-run files also cover long-comment format/retry, profile subpages, Tick localization, route finder/list, region directory, generic Area behavior, area sections/parser, embedded stats layout and application settings restoration.

The initial generic Area tests printed happy-dom's expected “iframe page loading is disabled” diagnostics and passed; this was not a real remote-frame test. Full-suite/build/package verification is intentionally left to the coordinating verifier to avoid duplicate runs.

A targeted text scan of `test/` found none of the identified real displayed names, original user IDs or copied excerpt markers after replacement. A separate resource scan of the three fixture directories found no remaining `src=`, `/dist/` stylesheet reference or CSS `url(...)`. Legacy filenames/import constants remain as noted above. These scans establish the specified local cleanup, not an exhaustive provenance audit of every sentence in the repository.

## Already-public history remains separate

The earlier [asset inventory](asset-and-attribution-review.md#what-is-already-public) verified nine original fixture blobs at public commit [`27bc57526e60a47f368d462040b215c9fba8b222`](https://github.com/jeongjong10/mountain-project-korea-extension/tree/27bc57526e60a47f368d462040b215c9fba8b222), under their previous `src/` paths. Its byte-match observations describe the state **before** these replacements. Seven of those local counterparts were changed here; the two factual Area fixtures were reviewed and retained.

This local work does not remove that commit, older history, forks, caches or third-party copies. An ordinary future cleanup commit can publish the replacement tree while preserving prior commits. No history rewrite, force-push or visibility change was performed or implied. High Exposure, Asia and the current preview/test paths were absent from the inspected remote tree; that bounded observation does not establish absence from every other publication or historical revision.
