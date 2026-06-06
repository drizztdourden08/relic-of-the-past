# Relic of the Past — Project Guide

A desktop port of *The Legend of Zelda: A Link to the Past*, built by wrapping a
decompiled C reimplementation of the game in WebAssembly and driving it from a
React UI inside Electron.

## Architecture — three layers

```
┌──────────────────────────C layer  (core/)──────────────────────────┐
│ core/zelda3/      Upstream ALttP decompilation (C).                │
│                   Vendored - edit only to add hook call-sites.     │
│ core/game-hooks/  OUR layer: C<->JS glue.                          │
│                   All Wasm* and GameHook_* live here.              │
│ core/wasm-build/  Emscripten entry (emscripten_main.c)             │
│                   + build.bat / Makefile.                          │
└────────────────────────────────────────────────────────────────────┘
          │
          │  Emscripten -> zelda3.{js,wasm,data}  (-> public/wasm/)
          ▼
┌─────────────────Bridge  (lib/game/wasm-bridge.ts)──────────────────┐
│ singleton module ref (~65 exported fns)                            │
│ TS -> C:  mod.ccall('Wasm...', ...)                                │
│ C -> TS:  EM_ASM -> window.__onItemReceived(...)                   │
└────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌───────────────────────────────TS app───────────────────────────────┐
│ apps/desktop/src/       React 19 renderer (UI, HUD, widgets)       │
│ apps/desktop/electron/  Main + preload: IPC, HID, ROMs,            │
│                         MSU, profiles, saves, protocols            │
│ shared/                 asset-extraction, game logic, nav          │
└────────────────────────────────────────────────────────────────────┘
```

The **WASM bridge is the trickiest part of the codebase**: any new function that
crosses the C↔TS boundary touches **three places at once** — the C impl in
`core/game-hooks/*.c` (with `EMSCRIPTEN_KEEPALIVE`), the `EXPORTED_FUNCTIONS` list
in **both** `build.bat` and `Makefile`, and the `ccall` site in
`apps/desktop/src/lib/game/`. C→JS events go the other way via `EM_ASM` →
`window.__on*`. Full procedure: the `add-wasm-function` skill. Rebuild after any C
change: the `build-wasm` skill (C edits don't take effect until rebuilt).

## Directory map

| Path | What lives here |
|------|-----------------|
| `core/zelda3/` | Upstream C decompilation + SNES emulation. Treat as vendored. |
| `core/game-hooks/` | Our C hook layer — `Wasm*` exports, `GameHook_*` callbacks, cheats, state queries, haptics. |
| `core/wasm-build/` | Emscripten build (`build.bat`, `Makefile`, `emscripten_main.c`). |
| `apps/desktop/src/` | React renderer. `lib/game/` is the JS side of the bridge; `stores/` are Zustand stores; `hud/`, `widgets/`, `components/`. |
| `apps/desktop/electron/` | Electron main process + preload (Node-side: input, ROM loading, profiles, saves). |
| `shared/` | Code shared between renderer & electron. `asset-extraction/` (ROM→.dat pipeline), `game/` (logic, navigation, checks, seeds), `types/`. |
| `tests/` | `vitest` unit tests (`*.test.ts`) + `playwright` specs (`*.spec.ts`, screenshots). |
| `scripts/` | Build helpers + `analyze-navigation.ts`. |
| `docs/` | Project documentation. |

Path aliases: `@shared/*` → `shared/`, `@app/*` → `apps/desktop/src/`.

## Build & run

> ⚠️ **The WASM build is a SEPARATE MANUAL STEP — it is NOT part of `npm` scripts.**
> The TS app loads a prebuilt `apps/desktop/public/wasm/zelda3.{js,wasm,data}`.
> You only rebuild WASM when you change C code in `core/`.

| Task | Command | Notes |
|------|---------|-------|
| Run the app (dev) | `npm run dev` | electron-vite dev server + Electron. |
| Build the app | `npm run build` | electron-vite production build. |
| Lint + typecheck | `npm run lint` | `tsc --noEmit && eslint .` |
| **Build WASM** | see `build-wasm` skill | Needs Emscripten SDK at `E:\GameProjects\emsdk`. Run `core/wasm-build/build.bat`. |
| Unit tests | `npx vitest run tests/<file>` | Run only the relevant file, not the whole suite. |
| E2E / screenshots | `npx playwright test` | |

The app needs a user-provided ROM/assets (`assets/*.sfc`, `assets/assets.dat`) —
these are gitignored and never committed. Same for `test-roms/` and `saves/`.

## Conventions

- **Coding standards are strict, documented, and enforced:** @docs/coding-standards.md
  — arrow functions only, exports grouped at end, **≤200 lines/file**,
  one-thing-per-file, deep logical folders, `import type`. Enforced by
  `eslint.config.mjs` + a PostToolUse lint hook that flags violations on every
  edit. Run the `coding-standards` skill's checkup after every change.
- **Clean code — `refactoring-guru` skill.** Be an expert: recognize code smells,
  apply the right refactoring, choose/explain design patterns, uphold SOLID. Spot
  smells and pattern opportunities as you touch code and suggest/perform refactors.
  Cite refactoring.guru pages when explaining.
- **Plan format: @docs/plan-format.md.** Every implementation plan is concise and
  shows: design pattern(s) + why, a **CRUD filetree** (A/M/D/R markers), the
  **data model in real TS code**, key code blocks, and a **flow/preview diagram
  generated with the asciiflow MCP server** (pasted inline). Show, don't narrate.
- **Architecture: @docs/architecture.md.** The zone map + **dependency invariants**
  + a placement guide. **Analyze every feature before building** — decompose, place
  each piece in the right zone, verify boundaries, then plan. Use the `architecture` skill.
- **Design system: @docs/design-system.md.** Tokens (`design-system/`) are the single
  source of truth (no raw hex / magic px). Four component tiers live in
  `components/{primitives,composites,compounds,views}/` — primitive/composite/compound
  are bare & presentational; **view** is the only tier with logic/data. Use the
  `design-system` skill.
- **Testing: @docs/testing-capabilities.md.** Prefer built-in automation flags
  (`--auto-state`, `--screenshot`, `--dump-layers`, `--dump-nav`) over Playwright.
  Playwright is **ephemeral** — throwaway specs in `tests/scratch/`, deleted after
  use. Files marked "NEVER MODIFIED BY THE AI" are protected — **modify only with
  the user's explicit permission** (stop and ask). Use the `test-app` skill.
- Skills: `architecture`, `refactoring-guru`, `coding-standards`, `design-system`,
  `electron`, `test-app`, `build-wasm`, `add-wasm-function`, `interpret-game-screenshot`.
- `core/` (C) is **excluded** from `tsconfig` — don't expect TS tooling there.
- Don't edit upstream `core/zelda3/` files except to insert a `GameHook_*` call
  at a game event; new logic belongs in `core/game-hooks/`.
- Keep `build.bat` and `Makefile` `EXPORTED_FUNCTIONS` lists in sync (they have
  drifted before — `build.bat` is the canonical build used for the app).

## Reading game screenshots (overlays, pathfinding, sprites)

The user frequently shares screenshots of the running game to explain bugs — and
low-res pixel art at scale is easy to misread (something wrong gets read as fine).

- Use the `interpret-game-screenshot` skill and @docs/pixel-art-and-rendering.md.
- Reason in **tiles** (8px base, 16px collision, 512px screen), not vague position.
- When judging whether a sprite is right/placed correctly, **fetch the real
  extracted sprite** from `%AppData%\relic-of-the-past\sprites\<rom-stem>\*.png`
  and compare — don't eyeball.
- **STANDING RULE — flag missing sprites.** Only HUD/item/menu sprites are
  extracted; Link, enemies, NPCs, and overworld/dungeon tiles are **not**. If
  reading a screenshot reliably needs a sprite that isn't extracted, **stop and
  raise a flag** naming the exact sprite so the user can extract it. Do this
  **iteratively, one at a time, as needed** — never request a bulk extraction.

## Asset extraction (`shared/asset-extraction/`)

Pure-TS port of the Python tools in `core/zelda3/assets/`. Reads a user ROM
(`.sfc`) → produces the `zelda3_assets.dat` blob the game core loads.
Flow: `rom/` (load + SNES↔linear addressing) → `compression/` (LZ, BRR) →
`graphics/` (2/3/4bpp tile decode, palettes) → `compile-*.ts` (per-domain
extractors) → `asset-builder.ts` (serializes the `.dat`). Public barrel: `index.ts`.

- One `compile-*.ts` per asset domain — match that granularity when adding extractors.
- ROM addresses are SNES addresses — convert with `snesToLinear` before indexing a
  linear buffer; never hardcode linear offsets.
- Validate against `ZELDA3_SHA1` / `ZELDA3_SHA1_US` so the wrong ROM fails loudly.
- Tests in `tests/asset-extraction/` (`npx vitest run tests/asset-extraction/<file>`).

## Key files to know

- `apps/desktop/src/lib/game/wasm-bridge.ts` — the bridge singleton + most `ccall`s.
- `core/game-hooks/state_queries.c` — pattern for returning data to JS via pointers + `HEAPU8`.
- `core/game-hooks/game_hooks.h` — declared hook surface.
- `core/wasm-build/build.bat` — the build everyone actually runs.
- `NAVIGATION-ARCHITECTURE.md` — design of the pathfinding/minimap system (active area of work).
