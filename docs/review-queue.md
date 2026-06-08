<!-- @layer docs @kind doc -->
# Review queue — items needing your decision (do NOT change rules without approval)

Logged during the P4 grind. None of these change the ruleset; they're parked here
until you decide. Tackle at the end.

## ✅ P5 UPDATE — all splittable files are now done

Every behavior-risky file that was parked for a "careful pass" has been split
(verbatim extraction, one offender per commit, all local, `tsc=21` + `analyze:ci`
green per file): the 7 stateful forms (ScreenEditorDialog, HomeTab, NavReviewPanel,
GameLayer, ProfileHub, ShadowEditorPanel, ControlsSettings), `useNavigation`, the
core-nav trio (single-screen, orchestrator, dual-layer), and the two stateful classes
(input-manager, hid-reader). **None are runtime-tested**, so each has a manual-test
entry in `docs/p5-test-checklist.md` — please walk that before pushing.

**Only 5 files remain over the line cap**, and all need a decision you must make:

- **3 CSS files** — `TrackerView.css` (662), `InputCalibration.css` (575),
  `DataManager.css` (372). Need stylelint rule choices before any reflow.
- **2 C files** — `state_queries.c` (686), `emscripten_main.c` (465). Splitting them
  requires `build.bat`/`Makefile` source-list sync + a **WASM rebuild** to verify
  (tsc/eslint can't validate C). I can split + sync, but you must run/confirm the build.

The rule-decision items below (exhaustive-deps / markdownlint / stylelint) are still
untouched and still need your call.

## Potential rule / process decisions

- **`react-hooks/exhaustive-deps` (70 warnings).** Auto-"fixing" these is unsafe —
  adding deps can cause render loops or change effect timing (behavior risk, no
  runtime tests to catch it). Options to decide: (a) fix case-by-case with manual
  verification, (b) keep as `warn` (current), (c) downgrade specific intentional
  ones with inline justification. **Not touched.**
- **`markdownlint` (761 warnings, warn-only).** Mostly mechanical (blank lines
  around headings/lists). Decide: batch-fix, or keep warn-only for docs.
- **`stylelint` (372 CSS errors).** Many are auto-fixable (`stylelint --fix`); some
  may be intentional (e.g. specificity, vendor prefixes). Plan: auto-fix the safe
  ones, list anything that changes rendering here before applying.

## Needs special handling (not a rule change, but a heads-up)

- **Our C splits need a WASM rebuild.** `core/game-hooks/state_queries.c` (686) and
  `core/wasm-build/emscripten_main.c` (465) exceed the 200 cap. Splitting them means
  updating `build.bat` + `Makefile` source lists and **rebuilding WASM** (Emscripten,
  `build-wasm` skill) to verify — `tsc`/eslint can't validate C. Will split + sync
  build files, then flag here for you to run/confirm the rebuild.

## Autonomous-ordering note (not a rule change)

The big stateful React forms — `ScreenEditorDialog` (638), `HomeTab` (435),
`NavReviewPanel` (335), `GameLayer` (326), `ProfileHub` (302), `ShadowEditorPanel`
(285), `ControlsSettings` (280), … — have **no runtime tests**, so an unattended
decomposition can only be verified by `tsc` (types/wiring), not behavior. To keep
the loop's "every iteration ends green" contract safe, I'm sequencing **logic +
simple files first** (fully tsc-verifiable) and saving these forms for last, where
each gets a careful dedicated pass. Not skipped — just ordered for safety.

## High-risk core-navigation logic (careful pass, not unattended)

`single-screen.ts` (536) — the dual-layer flood-fill BFS (335-line function) needs
extracting **deque/bodyReached-mutating inner blocks** (ledge & stair cross-layer
transitions) to get under cap. It's core, actively-developed pathfinding with **no
runtime tests**, so a slip breaks navigation silently. Same caution for
`orchestrator.ts` (366) and `strategies/dual-layer.ts` (271). I'll do these in a
focused pass (ideally with a nav smoke-check), not in the unattended loop.

`apps/desktop/src/widgets/navigation/useNavigation.ts` (579) — the renderer-side
orchestrator hook. ~537 of its lines are a single `handleRun` callback that builds
blockers, collects entrance/stair/spawn data, runs the multi-screen flood-fill
propagation loop, annotates layer-toggle edges, and writes 8+ pieces of state. The
inner blocks close over many locals and mutate shared arrays (`allEntrances`,
`pendingSeeds`, `analyzed`), so getting under cap requires parameterizing them into
pure helpers — not a verbatim extraction. Same no-runtime-test silent-break risk as
the core BFS it drives. Do this in the same focused nav pass with a flood-fill
smoke-check (`--auto-state` + `--dump-nav`), not unattended.

## Invasive class/stateful refactors (careful pass)

`input-manager.ts` (391) is a stateful **class** (the live renderer input engine,
no runtime tests). Splitting it cleanly means moving listener-wiring / device-refresh
out as free functions that touch many `private` fields — an encapsulation change,
not a verbatim extraction. Deferred to a careful pass (ideally with input testing). Same for
`apps/desktop/electron/input/hid-reader.ts` (244) — a stateful `HidInputReader`
class (node-hid devices + worker threads) whose methods all close over `this`.

## Files split (P4 progress log)

**P4 doable-grind COMPLETE (32 commits, all local).** Every oversized file that
could be split by behavior-preserving verbatim extraction — verified `tsc=21`
(baseline) + `analyze:ci` green, one offender per commit — has been done. The
only files still over the line cap are the parked items listed above, which need
your decisions (rule changes, a WASM rebuild, or careful behavior-risk passes).

Split this run (logic/data/setup → then hooks → then components):
ShadowEditorOverlay (820), controls.ts (256), tile-attrs (252), ui-bridge (232),
gizmos (230), tags (224), haptics (213), receipt-decoder (211), overworld-extractor (206),
astar-2x2 (210), edge-glow/renderer (234) + shaders (201), shadow-casting/renderer (220),
session-builder (205), live-settings (204), preload (206), shadow-editor-store (263);
useDumpNav (280), useCalibrationActions (255), useProfileManagement (239),
useEnhancedSaveSlot (215), useHidCalibration (204); TileInspector (379),
ConnectionEditorDialog (265), App (246), TitleBar (238), DatasetWidget (234),
WebHidCard (231), AudioSettings (228), GameplaySettings (208), HudSettings (202),
ConnectionsPanel (206).

### Remaining over-cap files = the parked items above (18)

- **Stateful React forms (7):** ScreenEditorDialog (638), HomeTab (435),
  NavReviewPanel (335), GameLayer (326), ProfileHub (302), ShadowEditorPanel (285),
  ControlsSettings (280) — no runtime tests; need careful behavior-verified passes.
- **Renderer nav hook (1):** useNavigation (579) — 537-line closure-captured
  `handleRun`; needs parameterized helpers + a flood-fill smoke check.
- **Core-nav BFS (3):** single-screen (536), orchestrator (366), dual-layer (271).
- **Stateful classes (2):** input-manager (391), hid-reader (244).
- **Our C (2):** state_queries.c (686), emscripten_main.c (465) — split needs
  build.bat/Makefile source-list sync + a WASM rebuild to verify.
- **CSS (3):** TrackerView.css (662), InputCalibration.css (575), DataManager.css (372)
  — stylelint rule choices to confirm before reflow.
