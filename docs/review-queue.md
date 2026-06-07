<!-- @layer docs @kind doc -->
# Review queue — items needing your decision (do NOT change rules without approval)

Logged during the P4 grind. None of these change the ruleset; they're parked here
until you decide. Tackle at the end.

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

## Files split (P4 progress log)
<!-- appended as each file lands -->
