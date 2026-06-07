<!-- @layer claude-config @kind doc -->
---
name: architecture
description: Guard the project's structure — decide where new code belongs and keep the architecture clean. Use at the START of any feature, new file, or non-trivial change, and when reviewing whether code sits in the right place. Decomposes a feature into pieces, places each in the correct zone/tier, verifies the dependency invariants, and produces a placement plan. Tailored to this repo's layers (C/WASM core, bridge, shared domain, Electron main, renderer tiers).
---

# Architecture guardian

Before building anything, decide **where each piece belongs** and confirm it won't
break the project's boundaries. Canonical map + invariants + placement table:
@docs/architecture.md. Don't restate it — apply it.

## Run this analysis before writing a feature (always)

1. **Decompose.** Break the feature into pieces by concern:
   UI · renderer state · pure domain logic/data · OS/IO (fs/native/window) ·
   WASM/game bridge · C-level hook. Most features touch 2–4 of these.
2. **Place each piece** via the placement table in @docs/architecture.md:
   - OS/fs/native/windows/ROM/profile/save → `electron/<domain>/` behind IPC (`electron` skill)
   - talks to the running game/WASM → `lib/game/` (new C fn → `add-wasm-function`)
   - pure game rule/algorithm/data → `shared/game/`
   - ROM/asset parsing → `shared/asset-extraction/`
   - shared type → `shared/types/`
   - UI → the right tier (`components/primitives|composites|compounds|views/` or
     `widgets/`) per @docs/design-system.md
   - renderer state → `stores/`; shared hook → `hooks/`; pure helper → `utils/`
3. **Verify the invariants** (from @docs/architecture.md) for every placement:
   - `shared/*` imports no `@app/*` and no `electron`; `shared/game/*` is pure.
   - renderer never imports `electron/*` (IPC only); electron never imports `@app/*`/React.
   - WASM reached only via `lib/game/`; bare UI tiers import no data/stores/IPC.
   - native modules in electron only.
   If a placement breaks an invariant, **the piece is in the wrong zone — re-place it.**
4. **Pattern pass** with the `refactoring-guru` skill — name the pattern(s) each piece
   uses (Strategy, Facade, Observer, Command…) or "none needed."
5. **Emit the plan** per @docs/plan-format.md: Goal · pattern(s) · **CRUD filetree**
   (showing exactly which zone each new file lands in) · **data model in TS** · key
   code · a **flow diagram crossing the zones** (e.g. View → store → window.api → IPC
   handler → fs) generated with the **asciiflow** MCP server and pasted inline. Run the
   `coding-standards` checkup as you build.

No feature work starts without this analysis + plan.

## When modifying existing code

- Check the file is **in the right zone** for what it now does. If a change would
  make, say, a `shared/game` file import `window` or a primitive subscribe to a store,
  that's a boundary break — split the new responsibility into the correct zone instead.
- Adding a cross-boundary call? Route it correctly: renderer↔main via a
  `domain:action` IPC channel; renderer↔game via `lib/game`. Never shortcut.
- Note any re-placement/split in your summary (per "refactor when touched").

## Quick boundary smell list

- A `shared/*` file importing `@app/*`, `electron`, `window`, or React → wrong zone.
- Raw `ccall`/`HEAPU8` outside `lib/game/` → move it behind the bridge Facade.
- A primitive/composite/compound importing a store / `window.api` / `lib/game` → it's
  really a View.
- Electron handler importing renderer code → invert via IPC.
- A "feature" piled into one file/folder spanning UI + logic + IO → decompose across zones.
