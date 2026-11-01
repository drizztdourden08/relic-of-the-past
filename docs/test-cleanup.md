# Test clean-up

Every test file was judged against the test standard (`docs/test-standard.md`): each kept case carries
one KEEP rule and one tag (critical, standard or e2e), and each wiped case names its WIPE rule.

| | before | after |
|---|---|---|
| test files | 273 | 230 |
| cases (`it`/`test` sites) | about 1781 | 1402 |
| tag sites critical / standard / e2e | 0 / 0 / 0 | 921 / 280 / 19 |

A tag sits on a top-level `describe` or on each case, so tag sites count fewer than cases.

| part | files | cases | critical / standard / e2e |
|---|---|---|---|
| apps/desktop/tests/hud | 69 to 49 | 577 to 419 | 326 / 93 / 0 |
| randomizer (app and package) | 60 to 60 | 354 to 342 | 223 / 111 / 8 |
| apps/desktop/tests/game | 47 to 45 | 315 to 264 | 204 / 59 / 1 |
| e2e specs, packages, tooling | 39 to 20 | about 150 to 82 | 64 / 11 / 7 |
| simulation, data inspector, the rest of apps/desktop | 58 to 56 | 385 to 295 | 104 / 6 / 3 |

Web apps (website, sanctuary, store, sanctuary-api, store-api, kill-switch) and hub-* packages: 0 test files before, 0 after.

## How the suite runs now

- Playwright rejects a `tags` key, so the kept specs carry Playwright's own `{ tag: '@e2e' }`.
- Per-test timeout overrides are gone; the shared preset (`defineStandardsVitest`) sets the limit per tag.
- The seven `node:test` files in `tooling/gba-alttp-re` were wiped: no gate ran them and they cannot carry a tag.
- `pnpm test` runs `standards test` (related tests of the changed files only); `pnpm lint` runs
  `standards lint` on the changed files, `pnpm lint:all` on everything.

### Part hud: apps/desktop/tests/hud

| | before | after |
|---|---|---|
| files (test files; all tracked files incl. helpers) | 69 (124) | 49 (79) |
| cases | 577 | 419 |
| critical / standard / e2e | 0/0/0 | 326/93/0 |

Tags are on the top-level `describe` (one tag per describe, nested describes untagged). Critical files with a jsdom directive (hud-countdown-node, hud-inspector-geometry/offset-and-placement) kept the directive; their critical cases are pure logic. No per-test timeouts or `60_000` beforeAll were present in the kept files (the Chromium rigs that carried them were deleted).

| file (under apps/desktop/tests/hud/) | verdict | rule | note |
|---|---|---|---|
| hud-appearance-controls/ (2 tests + 3 helpers) | deleted | W3 | Chromium measurement of widths |
| hud-grid-editor-metrics/ (2 tests + 7 helpers) | deleted | W3 | Chromium cell/echo metrics |
| hud-grid-strip/ (flat-sections, toolbar-row) | deleted | W3 | Chromium rail geometry |
| hud-inspector-geometry-width/ (1 test + 3 helpers) | deleted | W3 | widths |
| hud-inspector-layout-widths/ (2 tests + 3 helpers) | deleted | W3 | widths |
| layout-bands.harness/ + hud-layout-bands.keep.test.ts | deleted | W3 | Chromium rail measurement |
| hud-drag-indicators, hud-inspector-collapsed-fields, hud-inspector-content-width, hud-inspector-property-rows, hud-inspector-value-input-width | deleted | W3 / W1 | widths, class names, source-shaped asserts |
| hud-layout-section-one | deleted | W3 | markup byte-comparison |
| hud-grid-settings/sections-and-toolbar | deleted | W3 | markup of sections and toolbar |
| hud-keyboard-move/cell-picker-occupied | deleted | W3 | DOM states |
| hud-layout-section-controls/alignment-tiles | deleted | W3 / W5 | static markup and option-table constants |
| hud-layout-section-controls/screen-engine-and-overlay | deleted | W1 / W3 | readFileSync of source plus overlay markup |
| hud-layout-section-controls/tracks-and-toolbar | kept 7 of 7 (critical) | K1 | track edits, toolbar presets, validator round trip |
| hud-container-gap | kept 3 describes (critical) | K1 | |
| hud-countdown-node | kept (critical) | K1 | removed the static-markup assertions from the live-path test (W3) |
| hud-data-compile-expr, hud-data-resolve-value, hud-data-validate-value | kept (critical) | K1 | parser, clamp, validator |
| hud-data-variables | kept 2 of 3 describes (critical) | K1 | dropped "table matches the plan name for name" (W5, constant) |
| hud-engine-switch, hud-grid-track-edits | kept (critical) | K1 | |
| hud-layout-bindable, hud-layout-documents | kept (critical) | K1 / K2 | built-in layouts load through the one reader |
| hud-layout-engine, hud-layout-grid | kept (critical) | K1 | |
| hud-motion-controls, hud-motion/sampling, hud-motion/validation | kept (critical) | K1 | keyframe, easing, sampling, validators |
| hud-node-style, hud-presets, hud-screen-grid, hud-screen-root, hud-visibility | kept (critical) | K1 | |
| hud-object-catalogue/budget-text-and-button, repeat-and-switch | kept (critical) | K1 | |
| hud-stage-cells | kept 5 of 6 (critical) | K1 | dropped "one door to the solve" (W1, reads src files) |
| hud-drop-intent | kept 4 describes (critical) | K1 / K4 | dropped "single ownership" describe: 2 source-reading tests (W1) and a Tessera escape-stack test (W5); jsdom and react imports removed |
| hud-drag-ghost/ghost-model | kept (critical) | K1 | |
| hud-grid-editor (rig helpers) | kept | | removed `EDITOR` and `legendCaps` no kept test used |
| hud-inspector-value-input/formula-menu | kept 7 of 9 (critical) | K1 | dropped "&& unreachable" and "no dead end" (negative lists, W4) |
| hud-inspector-value-input/text-rule-and-errors | kept (critical) | K1 | |
| hud-keyboard-move/step-model | kept 7 of 8 (critical) | K1 | dropped duplicate sentence test (W4) |
| hud-inspector-geometry/offset-and-placement | kept 4 of 9 (3 critical, 1 standard) | K1 / S1 | dropped 2 source readers (W1), `order` source check (W1), 3 label/scrim DOM tests (W3) |
| hud-appearance-escape | kept 4 of 4 (standard) | S1 | |
| hud-cell-picker | kept 7 of 10 (standard) | S1 | dropped toolbar/header DOM, sibling state marks, title text (W3) |
| hud-drag-gesture | kept (standard) | S1 | |
| hud-drag-ghost/ghost-card-and-outline | kept 1 of 6 (standard) | S1 | dropped card text/class tests (W3), refusal and slop DOM tests (W3/W4); kept outline drag to `onDrop`; removed ghost text asserts |
| hud-drag-timers/autoscroll, spring-load | kept (standard) | S1 | fake timers, deterministic |
| hud-editor-step | kept 3 of 5 (standard) | S1 | dropped call-site audit and StepNumberInput grep (W1) |
| hud-grid-editor/one-table | kept 5 of 6 (standard) | S1 | dropped keys-as-caps DOM (W3) |
| hud-grid-editor/selection-writes-nothing | kept 1 of 3 (standard) | S1 / K5 | dropped two source/CSS readers (W1) |
| hud-grid-editor/shortcuts-and-escape | kept (standard) | S1 | |
| hud-grid-settings/engine-tiles-and-guide | kept 2 of 3 (standard) | S1 | dropped swatch/hex-box DOM (W3); deleted unused grid-settings.constants.ts |
| hud-grid-settings/tracks-and-gap | kept (standard) | S1 | |
| hud-inspector-content/references | kept 3 of 3 (standard) | S1 | removed icon `src` and input-count assertions (W3) |
| hud-inspector-content/slot-number | kept 2 of 3 (standard) | S1 | dropped disclaimer-retired source check (W1) |
| hud-inspector-content/text-and-cases | kept (standard) | S1 | |
| hud-inspector-geometry/limits-box-and-screen | kept 8 of 9 (standard) | S1 | dropped scrim/inert DOM test (W3) |
| hud-keyboard-move/outline-keys | kept 8 of 9 (standard) | S1 | dropped right-click menu label print (W3) |
| hud-motion-preview | kept 6 of 6 (standard) | S1 | |
| hud-stage-select-only | kept 2 of 5 (standard) | S1 | dropped two source readers (W1) and ring/badge DOM test (W3); removed class-presence asserts |

Deleted critical-looking tests (one line each, why):

- hud-data-variables "table matches the plan, name for name": asserts a constant list (W5).
- hud-inspector-value-input/formula-menu "&& unreachable" and "no dead end": negative substring checks over a catalogue (W4).
- hud-keyboard-move/step-model "reads as a sentence": same string already pinned by the neighbouring test (W4).
- hud-drop-intent "leaves moveNode one caller", "routes the outline through applyDrop": read source files (W1); "drag above popover": tests the Tessera escape stack (W5).
- hud-stage-cells "no stage drawing calls gridCellRects": reads source files (W1).
- hud-inspector-geometry/offset-and-placement "only writer of margin keys", "routes its one writer": read source files (W1).
- hud-editor-step call-site audit: reads every ValueField call site off disk (W1).

Helpers removed:

- files-in.ts, editor-theme-sheets.constants.ts (no importer left).
- hud-grid-settings/grid-settings.constants.ts (no importer).
- `EDITOR` export from hud-grid-editor/grid-editor.constants.ts, hud-inspector-content/content-fixtures.constants.ts, hud-inspector-geometry/geometry.constants.ts; `FLEX_PARENT` from geometry.constants.ts; `ED` and `GUIDE` from hud-layout-section-controls/section-controls.constants.ts; `legendCaps` from hud-grid-editor/install-grid-rig.ts.
- Every helper file belonging to the deleted Chromium rigs (appearance-cases, measure-*, metrics-*, geometry-cases, layout-cases, layout-bands.harness/*, etc.).
- All remaining helpers verified imported by at least one kept test; no dangling relative imports.

Notes for the lead:

- Deletions were done with `git rm` (staged, not committed) on explicit tracked paths.
- tests/COVERAGE.md rows (lines 33-41, 56-58 of the registry) still cite the deleted hud-grid-strip, hud-layout-bands, hud-layout-section-one, hud-inspector-*-width, hud-grid-editor-metrics, hud-inspector-collapsed-fields and hud-inspector-property-rows tests; outside my folder, so not edited.
- apps/desktop/tests/repo-root.ts is no longer imported from the hud folder (other folders still use it).

### Part randomizer: apps/desktop/tests/randomizer/, packages/randomizer/tests/

| | before | after |
|---|---|---|
| files | 60 | 60 |
| cases (it/test call sites; loops and it.each count 1) | 354 | 342 |
| critical / standard / e2e | 0/0/0 | 223/111/8 |

Tags sit on the enclosing top-level describe (or the top-level it). Every case has exactly one tag. Per-test timeouts removed everywhere (pond-generation x4, progressive-tier-generation, progressive-tier-probe, rule-node-parity, apworld-oracle, pond-core-probe/install-pond-rig.ts).

| file | verdict | rule | note |
|---|---|---|---|
| ap-connection-edit | kept 7 of 7 (critical) | K1/K3 | |
| ap-death-link-toasts | kept 6 of 6 (critical) | K1 | |
| ap-deathlink | kept 5 of 5 (critical) | K2 | |
| ap-ids | kept 8 of 9 (critical) | K2/K3 | 1 case W5 (death_link option constant) |
| ap-network-status/presence, status | kept 12 of 12 (critical) | K1 | |
| ap-online-connect | kept 7 of 7 (critical) | K1/K3 | |
| ap-online-core | kept 6 of 6 (1 critical, 5 standard) | K2/S2 | 2 cases read core/game-hooks/foreign_item.c (W1-looking); kept as C/TS contract, flagged |
| ap-online-display/in-game | kept 7 of 7 (standard) | K2 | builds the icon file from real art |
| ap-online-display/session-display | kept 6 of 7 (critical) | K1 | 1 case W5 (itemKeyName constant) |
| ap-online-notices/* | kept 10 of 10 (critical) | K1 | |
| ap-online-recovery/* | kept 12 of 12 (critical) | K3 | |
| ap-protocol | kept 13 of 13 (critical) | K2 | |
| ap-quiet-receipts | kept 8 of 8 (critical) | K1 | |
| ap-receipt-arrivals/detail-page | kept 6 of 7 (critical) | K1 | 1 case W4 (duplicate single-page check) |
| ap-receipt-arrivals/ring-and-delivery | kept 5 of 5 (critical) | K1 | |
| ap-receipt-burst | kept 1 of 1 (critical) | K1 | |
| ap-report-coverage | kept 2 of 2 (standard) | S2 | generates placements |
| ap-session-parity/solo-room-parity | kept 1 of 1 (standard) | S2/E3-lite | generates placements |
| capacity-pond-rule/* | kept 15 of 15 (critical) | K1 | |
| dialogue-charset | kept 12 of 12 (critical) | K1/K2 | |
| hook-save-bytes | kept 2 of 3 (standard) | K2 | reads core/game-hooks/save_bytes.h to keep the TS mirror honest (flagged); 1 case W4 |
| location-names-closed | kept 3 of 3 (standard) | S2 | builds worlds |
| option-wiring | kept 6 of 6 (critical) | K2 | |
| pond-core-probe/* (4 files) | kept 12 of 12 (standard) | S2 | headless wasm core, skip when wasm/fixture/blob missing |
| pond-generation/* (4 files) | kept 16 of 16 (standard) | S2 | full generation per case |
| pond-model/demand-ramp, item-demand, rupees-and-plan | kept 16 of 16 (critical) | K1 | |
| pond-model/receipt-lines | kept 4 of 5 (critical) | K1 | 1 case W10 (award wording regexes) |
| pond-model/snapshot-adapter | kept 7 of 8 (critical) | K1/K3 | 1 case W4/W5 (baseline equals default constant) |
| pool-listing-sprites | kept 5 of 5 (critical) | K2 | |
| potion-price-rule/bottle-price-rule | kept 3 of 4 (critical) | K1 | 1 case W5 (every cauldron price > 0) |
| potion-price-rule/per-cauldron, price-list-mask | kept 12 of 12 (critical) | K1 | |
| progressive-tick-consequences | kept 5 of 6 (critical) | K1 | 1 case W10 (sentence punctuation/prose) |
| progressive-tier-generation | kept 7 of 7 (standard) | S2 | 30 seeds per rolled case; may exceed 30 s (flag) |
| progressive-tier-probe | kept 6 of 6 (standard) | K1/S2 | headless wasm core |
| receipt-highlight | kept 15 of 16 (critical) | K1/K2 | 1 case W1+W5 (default colours + reads dialog_highlight.c) |
| rule-node-parity | kept 3 of 4 (e2e) | E3 | pinned digests vs closure-only engine, 5000 states; 1 case W5 (helper name list) |
| shop-slots-panel | kept 14 of 14 (critical) | K1 | |
| world-from-records/* (2 files) | kept 17 of 17 (standard) | S4 | dataset-guarded, build the vanilla world |
| apworld/apworld-oracle | kept 5 of 5 (e2e) | E3 | real ArchipelagoGenerate.exe, plus exported-tree shape checks (600 s class) |
| apworld/player-file | kept 2 of 3 (critical) | K2 | 1 case W5 (tests the client-kit library's emitYaml) |
| key-drop-size | kept 3 of 3 (standard) | K5-ish/S2 | generates a placement |
| plan-covers-placement | kept 2 of 2 (standard) | S2 | generates placements per option set |
| lobby/lobby-join-scenarios, lobby-failure-scenarios | kept 27 of 28 (standard) | K2 | loopback fake lobby server (real socket on localhost); 1 case W5 (catalog length > 40) |
| lobby/lobby-harness | kept 1 of 1 (standard) | W5 but needed | file is imported as a module by the two scenario files; its lone sanity case kept so the file is not an empty suite |

Deleted critical-looking tests (one line each, why):

- ap-ids "death_link option is a real choice": asserts one option row constant (W5).
- session-display "itemKeyName names it": asserts a constant and a name already asserted by the following cases (W5).
- detail-page "keeps an item with no detail line on one page": same behaviour as the server-item case two cases above (W4).
- hook-save-bytes "parses every name the mirror restates": subsumed by "matches the TS mirror byte for byte" (W4).
- receipt-lines "award lines differ only in what they say about what is left": regex on prose wording (W10).
- snapshot-adapter "shipped baseline is the fresh-profile pond": one constant equals another (W4/W5).
- bottle-price-rule "names a refill price for every cauldron content": every table price > 0 (W5).
- progressive-tick-consequences "gives every line a term and a finished sentence": prose punctuation (W10).
- receipt-highlight "highlight colours are the app gold and green": constants plus a read of the C source (W1/W5).
- rule-node-parity "keeps the primitive helper list short and fixed": a constant list (W5).
- player-file "never writes the bare word random": tests the client-kit library; the first case already asserts the yaml has no bare random (W5).
- lobby-failure-scenarios "knows every scenario": catalog length and `toBeDefined` (W5/W8).

Helpers removed: none deleted as files. Dead exports/imports removed: startJoin in lobby-harness, unused imports in ap-ids, session-display, receipt-highlight, bottle-price-rule, rule-node-parity, player-file, lobby-failure-scenarios, lobby-harness.

Unsure, for the lead:

- Source-reading kept as contract (W1 risk): ap-online-core x2 (foreign_item.c) and hook-save-bytes (save_bytes.h). No other test catches a C/TS drift.
- lobby tests open a real loopback socket (fake server on localhost), tagged standard though the standard says no network; e2e is the alternative.
- progressive-tier-generation rolls 30 seeds per case and apworld-oracle shape cases may be slow; standard may time out at 30 s. Lowering SEEDS or moving to e2e is the fix.
- lobby-harness.keep.test.ts is a helper module living in a .keep.test.ts file (imported by sibling test files, which therefore also run its one case); not renamed per the brief.

### Part game: apps/desktop/tests/game

Counts are `it` call sites (an `it.each` or a loop counts once). Nothing was run, as the brief requires, so every critical/standard split is by reading, not by timing.

| | Before | After |
|---|---|---|
| Files | 47 | 45 |
| Cases | 315 | 264 |
| Critical | 0 | 204 |
| Standard | 0 | 59 |
| E2E | 0 | 1 |

### Per file

| File | Verdict | Rule | Note |
|---|---|---|---|
| aspect-ratio | keep 9 | K1/K3 | Pure parsing and clamping. Critical. |
| overworld-area | keep 6 | K1 | Critical. |
| overworld-sprites-resolve | keep 2 | K5 | Critical. |
| ui-bridge-parser | keep 2 | K1 | Critical. |
| one-rules-path | keep 7 | K3 | Region-to-screen block (3) critical. Settings-to-record-rows block (4) standard because it builds a whole placement. |
| data/check-content-tags | delete file (4) | W5 | Pinned data. |
| data/connection-pairing | keep 3, wipe 3 | S1 | Dropped "every toConnectionId resolves" (W4, dataset-integrity covers it) and 2 `it.todo` (W8). Standard, whole-dataset sweep. |
| data/dataset-integrity | keep 12, wipe 2 | S1 | Dropped the prefix-spelling duplicate (W4) and the exemption-list pin (W5). Standard, whole-dataset sweeps. |
| data/dataset-record-writers/* | keep 13 | K3 | Writers against a temp folder. Critical. |
| data/enumeration-writer | keep 6 | K3 / S2 | 3 refusals critical. 3 success paths standard because they run `regenerateTypes`, which uses `execFile`. |
| data/generated-mirrors | keep 1, wipe 1 | E2 | Spawns `generate-from-records.mjs --check`, so e2e. Dropped "lists a file that exists" (W1) and the per-test timeout. |
| data/item-group-writer | keep 4 | K3 | Temp-folder writer. Critical. |
| data/record-file-targets | keep 13, wipe 7 | K3 / S1 | 11 pure path-mapping cases critical. The 2 `it.each` that check `existsSync` of real files are standard. Dropped "has real records" (W8), 4 "names the file" cases (W4, tree-layout covers them) and 2 "covers every category/kind" (W2/W5). |
| data/reference-index | keep 5, wipe 2 | K3 | Dropped "second independent check" (W4) and "nothing references Swords" (W5, pins data). Critical. |
| data/regions | keep 4, wipe 8 | S1 | Dropped count and pinned-list tests (W5) and screen/world/location duplicates (W4). Standard. |
| data/rom-facts/connections | keep 5 | S3 | Reads the real ROM. Standard. |
| data/rom-facts/dungeons-and-chests | keep 5, wipe 1 | S3 | Dropped "keeps every area-head event" (W1, read source text). Standard. |
| data/rom-facts/entrances | keep 7, wipe 1 | S3 | Dropped "documented table sizes" (W5). Standard. |
| data/tag-migration | keep 2, wipe 4 | S1 | 4 duplicates removed (W4/W10). Standard. |
| data/tag-records | keep 10, wipe 2 | K3 | Dropped "reaches the facade" (W5) and "invents nothing" (W4). Critical. |
| data/tag-writer-convention | keep 6 | K3 | Critical. |
| data/tree-layout | keep 3, wipe 8 | S1 | Dropped tree-structure, source-reading and file-listing cases (W1). Standard because it reads the real record folder. |
| navigation/cliff-preprocessing | keep 2 | K1 | Critical. |
| navigation/connection-audit-resolve | keep 4, wipe 1 | K1 | "entrance" duplicated "exit" (W4). Critical. |
| navigation/connection-issues | keep 4 | K1 | Critical. |
| navigation/connection-nav-from-flood | keep 8, wipe 1 | K1 | Dropped "round-trip const is well-typed" (W2, a type-only check). Critical. |
| navigation/constrain-void-tiles | keep 3 | K1 | Critical. |
| navigation/dual-layer-ledge | keep 3 | K5 | Critical. |
| navigation/palace-index-dungeon-name | keep 4 | K1 | Critical. |
| navigation/screen-detection-palace | keep 5, wipe 1 | K1 | The throne-room case duplicated the jail-cell case (W4). Critical. |
| recommendations/actor-combat | keep 5 | K1 | Critical. |
| recommendations/actor-spawns | keep 5 | K1 | Critical. |
| recommendations/check-presence | keep 10 | K1 | Critical. |
| recommendations/connection-add-parity | keep 6 | S1 | Keeps the vacuity guard on the real dataset. Standard. |
| recommendations/connection-remove-parity | keep 5, wipe 1 | K1 | Dropped "still finds something on the real dataset" (W8). Critical, in-memory fixtures. |
| recommendations/connection-strategy-parity | keep 7 | S1 | Keeps the vacuity guard. Standard. |
| recommendations/diff | keep 17 | K1 | Critical. |
| recommendations/dungeon-rooms | keep 4 | K1 | Critical. |
| recommendations/item-grants | keep 12 | K1 | Critical. |
| recommendations/reconcile | keep 15 | K1 | Critical. |
| recommendations/registry-store | keep 5, wipe 3 | K1 | Dropped the barrel-install case (W5), the file-name case (W5) and "record not code string" (W4). Removed the duplicate bare imports. Critical. |
| recommendations/screen-strategy-parity/* | keep 15 | K1 | Critical. |
| recommendations/shared-detectors-barrel | delete file (1) | W5 | Barrel test. |

Deleted critical-looking tests (one line each, why):

- check-content-tags (4): pinned the content of tagged checks, which is dataset data (W5).
- shared-detectors-barrel (1): checked that a barrel re-exports its detectors (W5).
- reference-index "returns empty for Swords": would fail whenever a rule gains a Swords requirement, with no behaviour behind it (W5).
- registry-store "installs a detector for both kinds": pinned the barrel's detector ids (W5).
- connection-nav-from-flood "round-trip const is well-typed": asserts a literal against itself, and `tsc` already covers the type (W2).
- regions "pinned region lists and counts": pinned data (W5).

Helpers removed:

- `data/rom-facts/rom-facts.constants.ts`: removed the unused `CORE` and `SPECIAL_SCREENS` constants and the `REPO_ROOT` import.
- In tree-layout and record-file-targets: the local helpers `holdsCheck`, `holdsEvent` and `EVENT_CHECK_ID_BASE`, plus the tree-walking helpers, left with their tests.
- No helper file was deleted. A grep shows every remaining file in `record-references/`, `rom-fixture/`, `rom-facts/`, `dataset-record-writers/`, `screen-strategy-parity/` and `navigation/grid-access.ts` is still imported.

Unsure:

- I could not time anything. The dataset-sweep files (dataset-integrity, regions, tree-layout, tag-migration, connection-pairing, the two parity files) are tagged standard on the guess that they exceed 1 s.
- The `describeDataset` and `describeRom` wrappers are skipped when the dataset or ROM is absent. Tags sit on each `it`, not on the wrapper, because I don't know whether `local/test-has-one-tag` follows the wrapper.
- `rom-facts/*` read the real US ROM, so they are standard. If the ROM is large and slow to load, e2e may fit better.

### Part e2e-packages-tooling: apps/desktop/tests/e2e + snapshot.spec, packages/{input-mapping,features,asset-extraction}, tooling/{gba-alttp-re,generate-enum-types}

| | before | after |
|---|---|---|
| files | 39 | 20 |
| cases | not counted exactly (hud-layout specs not enumerated; about 150) | 82 |
| critical / standard / e2e | 0/0/0 | 64 / 11 / 7 (6 playwright + 1 vitest ROM case) |

Counts: e2e specs 14 files -> 6; kept spec cases: flood-parity 1, ledge-baseline 1, state-intro-bed 1, state-secret-passage 1, state-tag-room 1, state-throne-room 1 (= 6 e2e, `{ tag: '@e2e' }`) plus 1 vitest e2e (gba-alttp-supplement integration) plus asset-extraction/features standard cases.

| file | verdict | rule | note |
|---|---|---|---|
| apps/desktop/tests/e2e/flood-parity.keep.spec.ts | kept 1 (e2e) | E3 | widget vs --dump-nav parity; setTimeout override removed |
| apps/desktop/tests/e2e/ledge-baseline.keep.spec.ts | kept 1 (e2e) | E3 / K5 | per-direction ledge regressions |
| apps/desktop/tests/e2e/state-intro-bed.keep.spec.ts | kept 1 (e2e) | E1 | plays the opening, real journey |
| apps/desktop/tests/e2e/state-secret-passage.keep.spec.ts | kept 1 (e2e) | K5 | NPC blocks flood + duplicate item substitution (distinct rule) |
| apps/desktop/tests/e2e/state-tag-room.keep.spec.ts | kept 1 (e2e) | K5 | room-tag decode (distinct rule) |
| apps/desktop/tests/e2e/state-throne-room.keep.spec.ts | kept 1 (e2e) | K5 | follower gate (distinct rule) |
| apps/desktop/tests/e2e/hud-layout-options-flex.keep.spec.ts | deleted | W3 | layout panel rects/engines |
| apps/desktop/tests/e2e/hud-layout-options-grid.keep.spec.ts | deleted | W3 | same |
| apps/desktop/tests/e2e/hud-style-drives-scheme.keep.spec.ts | deleted | W3 | settings-panel markup, screenshots, sleeps; the derived-scheme rule is kept in packages/features hud-style-scheme |
| apps/desktop/tests/e2e/state-big-screen.keep.spec.ts | deleted | W4 | baseline count in another state |
| apps/desktop/tests/e2e/state-links-house.keep.spec.ts | deleted | W4 | same |
| apps/desktop/tests/e2e/state-sanctuary-grounds.keep.spec.ts | deleted | W4 | same (flood-parity already covers this state) |
| apps/desktop/tests/e2e/state-jail-cell.keep.spec.ts | deleted | W4 | count baseline; flood-parity covers the state |
| apps/desktop/tests/snapshot.spec.ts | deleted | W3/W7/W8 | screenshot tool, sleep, no behaviour assertion |
| packages/input-mapping/tests/device-gate.keep.test.ts | kept 5 (critical) | K1, K4 | |
| packages/input-mapping/tests/haptic-gates.keep.test.ts | kept 9 of 11 (critical) | K1, K2; 2 cases W4 | deleted sword hit enemy, sword clink (same shape as sword swing) |
| packages/input-mapping/tests/pause-disconnect.keep.test.ts | kept 10 (critical) | K1 | |
| packages/input-mapping/tests/primary-modifier.keep.test.ts | kept 4 (critical) | K1 | |
| packages/input-mapping/tests/slot-list.keep.test.ts | kept 6 (critical) | K1, K3 | |
| packages/input-mapping/tests/slot-prefill-order.keep.test.ts | kept 2 (critical) | K1 | |
| packages/input-mapping/tests/vibration-shaping.keep.test.ts | deleted | W5 | tests @drizztdourden08/brock-input functions |
| packages/features/tests/all-off-vanilla.keep.test.ts | kept 4 (critical) | K2 | |
| packages/features/tests/bundle-flags-parity.keep.test.ts | kept 8 of 10 (standard) | K2 | reads core/zelda3 headers (real files), so standard; 2 word-3 cases W4 (powers of two, collisions duplicate the bug-fix describe) |
| packages/features/tests/hud-style-scheme.keep.test.ts | kept 5 (critical) | K1, K2 | |
| packages/features/tests/resolve-features.keep.test.ts | kept 8 (critical) | K1 | |
| packages/features/tests/vanilla-safe-lock.keep.test.ts | kept 4 (critical) | K4 | |
| packages/asset-extraction/tests/alttp-asset-set.keep.test.ts | kept 2 of 3 (standard) | K2, K3 | needs test-roms (skips without); full-compile case W4 (its base-equality assertion is repeated in the other two) |
| packages/asset-extraction/tests/dialogue-text-roundtrip.keep.test.ts | kept 3 (critical) | K1, K3 | |
| packages/asset-extraction/tests/gba-alttp-supplement.keep.test.ts | kept 3 of 4 (2 critical, 1 e2e) | K1; E3 | ROM integration case tagged e2e, 1_800_000 timeout removed; SRAM sword-power case deleted (W8, asserts only typeof) |
| tooling/gba-alttp-re/test/*.test.mjs (7 files, 17 cases) | deleted | W8 / untaggable | node:test files run by no gate (no vitest include, no script), cannot carry a vitest tag; RE scratch helpers whose production logic lives in packages/asset-extraction |
| tooling/generate-enum-types/tests/enumeration-generated-types.keep.test.ts | kept 1 of 8 (standard) | K2 | generated file in sync with generator; reads a real repo file so standard; the rest W4 (repeat the sync check) or W5 (seed constants) |
| tooling/generate-enum-types/tests/generate-enum-types-root.keep.test.ts | kept 2 (critical) | K4 | temp-dir only |

Deleted critical-looking tests (one line each, why):

- gba-alttp-re parsers (room header, layers, secrets, sprites, LZ77, background graphics, address maps): real K1 logic, but node:test files that no gate runs and that cannot carry a tag; deleted as unreachable. Flagged for the lead: re-port to vitest under a package if the owner wants them back.
- vibration-shaping: pins brock-input library curves (W5).
- hud-style-drives-scheme / hud-layout-options-*: UI panel layout and press behaviour (W3).

Helpers removed: apps/desktop/tests/e2e/hud-layout-options/ (16 files), apps/desktop/tests/e2e/hud-style/ (2 files). Kept: isolated-app, state-harness, state-readers (still imported by the kept specs).
Also edited: apps/desktop/tests/e2e/README.md (rows + counts), tests/COVERAGE.md (ProfileHub, SaveStateOverlay, section 58 row removed, input-mapping file count, Modern control scheme row, progress tiers row), tooling/gba-alttp-re/README.md (removed the node --test paragraph).

Unsure / for the lead:

- Kept 4 baseline state specs as K5 on distinct nav rules (blocked NPC, tag decode, follower gate, intro play). If the owner wants a lower e2e cap, throne-room/tag-room/secret-passage are the next to go, unless packages/navigation unit tests already cover those rules.
- The e2e specs had test.setTimeout of 300 to 600 s which I removed; the e2e preset is 120 s and state-intro-bed / flood-parity (16 s waits per state, 120 s dump poll) may exceed it.
- `ProfileSeed` / `StoredSlotSeed` exports in e2e/isolated-app may now be unused (knip).
- bundle-flags-parity is tagged standard (reads core/zelda3 files); critical forbids real files outside a temp folder.

### Part desktop-other: simulation/, data-inspector/, storage/, widgets/, story-events/, settings/, regression/, stores/, electron/, assets/

Folder apps/desktop/tests/. Nothing committed, nothing run (read/grep only). A case is one it/test call site (it.each = one). Tags are counted per tag site (a describe or a case carrying one tag).

| | Before | After |
|---|---|---|
| Test files | 58 | 56 |
| Cases | 385 | 295 |
| critical tag sites | 0 | 104 |
| standard tag sites | 0 | 6 |
| e2e tag sites | 0 | 3 |

Verified on the final tree: no `timeout`, `setTimeout`, numeric timeout argument or `Date.now` left in the batch; every describe or case carries exactly one tag; no unused imports in any batch file; no helper file left without an importer.

### Per-file verdicts

Rules: KEEP rules K1 (logic), K2 (contract), K3 (data safety), K4 (refusal), K5 (regression). Deleted cases: W3 markup/render, W4 duplicate of another case, W5 constant/registry/getter/type, W6 only a mock call, W8 no real assertion.

| file | verdict | rule | note |
|---|---|---|---|
| assets/public-asset | KEEP, 2->1 | K1 | critical; second case repeated the first (W4) |
| data-inspector/accept-all-certain | KEEP, 7->4 | K1/K3 | critical; 3 overlapping-write cases were W4 of the kept ordering case |
| data-inspector/accept-recommendation | KEEP, 11->8 | K1/K3 | critical; 3 W4 variants dropped |
| data-inspector/collection-sources | KEEP, 11->6 | K2 | rewritten to 2 critical describeDataset blocks; registry/shape cases W5 |
| data-inspector/comparison-view-sync | KEEP, 10->5 | K1 | critical; rendering/tab cases W3 |
| data-inspector/data-inspector-render | KEEP, 12->2 | K1 | standard (loads real collection through module graph); 10 render/markup cases W3 |
| data-inspector/module-init-order | KEEP, 5->4 | K5 | standard (dynamic imports of the cycle); 90 s style timeout removed; "always worked" case W4 |
| data-inspector/open-recommendation | KEEP, 8->5 | K1 | critical; W6/W4 cases dropped |
| data-inspector/proposal-draft | KEEP, 8->8 | K1 | critical x3 |
| data-inspector/recommendation-cache | KEEP, 7->5 | K1 | critical; real-timer wait replaced by a microtask settle (W7) |
| data-inspector/recommendation-rows | KEEP, 13->9 | K1 | critical; column-list and fold-glyph cases W3/W5 |
| data-inspector/recommendations-shell | WIPE file, 8->0 | W3 | render-only shell tests |
| data-inspector/record-creators | KEEP, 6->5 | K4 | critical; one W6 mock-refusal case dropped |
| data-inspector/record-links | KEEP, 14->12 | K1 | critical; 2 W4 |
| data-inspector/required-fields | KEEP, 7->7 | K1 | critical |
| data-inspector/tag-collection | KEEP, 7->3 | K1 | standard (builds real schema); registry/shape cases W5 |
| data-inspector/tag-consistency | KEEP, 4->3 | K3 | critical |
| electron/recommendation-files | KEEP, 8->6 | K3 | critical (temp dir only); a sleep-based ordering check replaced by a gate promise (W7) |
| regression/run-compare | KEEP | K5 | e2e on the describe (reads the real corpus) |
| regression/run-snapshot | KEEP | K5 | e2e; 900000 ms timeout override removed |
| settings/experimental-features | KEEP | K1 | critical |
| settings/msul-ini | KEEP | K1 | critical |
| simulation/active-states | KEEP, 9->7 | K1 | critical; 2 name-list cases W5 |
| simulation/annotation-coverage | WIPE file, 5->0 | W5 | registry/glyph completeness, the compiler already holds the union |
| simulation/annotation-reachability | KEEP | K1 | critical |
| simulation/cross-world-gating | KEEP | K1 | standard (whole dataset graph) |
| simulation/discover/chest-reachability | KEEP, 6->4 | K1 | critical |
| simulation/discover/npc-matching | KEEP | K1 | critical |
| simulation/discover/overworld-screens | KEEP, 4->3 | K1 | critical |
| simulation/dungeon-ledger/group-and-ledger | KEEP | K1 | critical |
| simulation/dungeon-ledger/ledger-lifecycle | KEEP | K1 | critical; unused BOMB_PICKUP removed |
| simulation/duplicate-alternates | KEEP, 6->5 | K1 | critical |
| simulation/enemy-reach/room-rules | KEEP | K1 | critical |
| simulation/enemy-reach/weapon-reach | KEEP | K1 | critical |
| simulation/engine-loop/item-gated-world | KEEP, 5->4 | K1 | standard (multi-module loop) |
| simulation/engine-review-fixes/discovery-and-keys | KEEP | K5 | critical |
| simulation/engine-review-fixes/routing | KEEP | K5 | 3 describes critical, backtrack describe standard |
| simulation/exit-distance | KEEP, 9->7 | K1 | critical |
| simulation/explorer | KEEP, 11->10 | K1 | critical; unused const removed |
| simulation/flag-snapshot | KEEP, 6->5 | K1 | critical |
| simulation/npc-check-naming | KEEP, 6->5 | K1 | critical |
| simulation/overworld-sprite-trigger | KEEP, 4->2 | K1 | critical; unused import removed |
| simulation/player-state-rules | KEEP, 14->13 | K1 | critical |
| simulation/presence | KEEP | K1 | critical |
| simulation/recorder | KEEP | K1 | critical |
| simulation/run-trail | KEEP | K1 | critical |
| simulation/screen-panel | KEEP, 5->4 | K1 | critical |
| storage/domains | KEEP | K3 | critical (in-memory file store) |
| storage/profiles | KEEP | K3 | critical |
| storage/roms | KEEP, 5->4 | K3 | critical |
| storage/saves | KEEP | K3 | critical |
| storage/sprite-set-freshness | KEEP, 8->7 | K3 | critical; file-name list case W5, unused imports trimmed |
| storage/ui-views | KEEP, 10->8 | K3 | critical (existing fake timers); 2 W6/W4 cases dropped |
| stores/data-view-store | KEEP, 12->2 | K1 | critical; 10 getter/setter/mock-opener cases W5/W6 |
| story-events/t1-parity | KEEP | K5 | e2e (two real wasm cores, E3); 120 s beforeAll timeout removed; skips when the baseline core is absent |
| story-events/t6-tracker | KEEP | K1 | critical x3 |
| widgets/live-data-inspector-records | KEEP | K1 | critical x7 |
| widgets/screen-record-draft | KEEP | K1 | critical x4 |

Deleted critical-looking tests (one line each, why): accept-all-certain "would lose one of the two if the same writes overlapped", "applies them strictly one at a time" and "writes the certain ones..." (W4, same ordering behavior as the kept case); accept-recommendation "replaces the record for an update", "writes the amended proposal...", "reports the ALLOCATED id..." (W4 of the kept accept path); record-creators "surfaces the main process's own refusal" (W6, asserts a mock's rejection passes through); tag-consistency "rejects a namespace edit that leaves name out of step" (W4, covered by the other consistency cases); electron/recommendation-files "would lose a verdict without the queue" (W4 of the kept queue cases) and "files each kind under the engine's own relative path" (W5 path constant); storage/roms "getInfo returns size + 16-char hash" (W5 getter); storage/ui-views "does not write immediately" and "never throws when the write fails" (W6/W8); stores/data-view-store 10 default/getter/opener cases (W5/W6); simulation/active-states "names the princess..." and "names the other tagalongs..." (W5 label lists); simulation/exit-distance "never reports the sentinel" and "ignores ledges pointing outside the grid" (W4 of the kept distance cases); simulation/flag-snapshot "cloneSnapshot is a deep copy" (W4/W9); simulation/duplicate-alternates "reports whether a swap happened" (W4); simulation/npc-check-naming "is not fooled by the check display name" (W4); simulation/overworld-sprite-trigger two dispatch cases (W9 private planner); simulation/discover/chest-reachability two tile-position cases (W4); simulation/engine-loop "re-floods from the current position..." (W4); simulation/explorer "treats the bomb pickup as traversal-affecting" (W5 constant); simulation/player-state-rules "reports deep water and wall grabbing" (W4); simulation/screen-panel "labels the known door/water/hole mechanics" (W5 label table); simulation/annotation-coverage all 5 cases (W5, file removed).

Helpers removed: none. Every helper in the batch (simulation/*/fixtures, regression/corpus, regression/expected-changes.data, storage/mem-file-store, story-events/core-harness, dataset-guard, required, repo-root) still has an importer among the kept tests (core-harness also feeds randomizer/pond-core-probe in another part).

### Flags for the lead (not edited)

- tests/COVERAGE.md: rows naming removed or reshaped files updated in the same change.
- docs/architecture/code-notes/apps-desktop-tests.md: sections for removed files dropped in the same change.
- run-snapshot and run-compare are tagged e2e and their old 900000 ms timeout override was removed; they may exceed the e2e 120 s limit when run.
- Tag form `(ready ? describe : describe.skip)(name, { tags }, fn)` in t1-parity uses an alias (`describeCore`); confirm the lint rule recognises it.
- Dataset-heavy tests (record-links, recommendation-rows, t6-tracker) were tagged critical on the assumption the dataset is already in memory; promote to standard if a timing run shows over 1 s.
