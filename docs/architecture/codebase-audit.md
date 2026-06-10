<!-- @layer docs @kind doc -->
# Codebase Audit & Health

A point-in-time, whole-project review of how the pieces fit together, plus the
**registry of intentional "looks-unused-but-isn't" surfaces** that automated
dead-code sweeps must not re-flag. Companion to [Architecture → Overview](overview.md)
(zones + invariants); this page is the *health* and *audit-trail* view.

> Last full audit: **2026-06-09**. Re-run the lenses below (boundaries, dead code,
> patterns, communication map) whenever a cross-cutting refactor lands, and update
> the registry + remediation log here.

## Health snapshot

| Lens | Status |
|------|--------|
| Dependency invariants (8/8, see [overview](overview.md)) | ✅ all hold — zero cross-zone import violations |
| Analyzer gate (`npm run analyze`) | ✅ 0 gating errors, 0 untagged files |
| Cross-layer communication | ✅ sound & typed (4 channels, below) |
| Design patterns / abstractions | ✅ clean — no god-modules; DRY gaps closed |
| Dead code | ✅ refactor leftovers removed; intentional surfaces registered below |

## Cross-layer communication map

Four channels carry everything. Each is documented in depth on its own page; this
is the one-screen mental model.

```text
 C / WASM core  (core/zelda3 vendored · core/game-hooks = our glue)
   Wasm* exports (EMSCRIPTEN_KEEPALIVE)            GameHook_* / EM_ASM
        |  (1) WASM bridge                              |  C->JS
        v                                               v
 apps/desktop/src/lib/game/  — wasm-bridge.ts singleton + bridge/* facades
   - getModule()/setModule() hold the one module ref (Facade)
   - bridge/wasm-call.ts = shared guard + ccall + HEAPU8-decode primitive
   - ui-bridge.ts rAF loop -> useGameUIStore ; tracker/haptic register window.__on*
        |  (3) writes Zustand stores                    |  imports @shared/game (4)
        v                                               v
 Renderer apps/.../src   <----(2) typed IPC---->  Electron main apps/.../electron
   window.api (preload)     shared/ipc/ join maps     register*Handlers() per domain
   stores/ (Zustand)        invoke / send / event     20 domains in IPC_HANDLERS[]
        \________ both import @shared/game (pure leaf) ________/
```

1. **C ↔ TS (WASM bridge)** — the only TS that talks to the module. A two-tier
   Facade: ~79 `Wasm*` exports funnel through `bridge/wasm-call.ts` primitives.
   C→JS is event-driven (`EM_ASM → window.__on*`, 2 hooks) plus rAF/`setInterval`
   polling of `HEAPU8`. See [The WASM Bridge](wasm-bridge.md) and the
   [Game Hooks Reference](../hooks/overview.md).
2. **Electron ↔ Renderer (IPC)** — `shared/ipc/` is the single source of truth;
   `window.api`'s type is *derived* from the join maps so signatures are never
   written twice. Each domain exports a `register<Domain>Handlers()`. See
   [Electron & IPC](electron-ipc.md).
3. **Renderer state (Zustand)** — stores in `apps/desktop/src/stores/`, fed by both
   the bridge (game-ui, delivery) and IPC/renderer logic (hud-settings, shadow-editor).
4. **Shared domain** — `shared/game/` is the pure leaf consumed by both sides.

## Design-pattern inventory

| Pattern | Where | Notes |
|---------|-------|-------|
| Facade | `lib/game/wasm-bridge.ts` + `bridge/*` | The single guarded surface over `Wasm*`; no raw `ccall` escapes it. |
| Registry | `electron/main.ts` `IPC_HANDLERS[]` | Add a domain = add one `register*()` entry. |
| Typed command dispatch | `electron/lib/ipc/handle.ts` | Channels constrained to the `@shared/ipc` contract (DIP at the boundary). |
| Strategy | `shared/game/navigation/strategies/` | `LayerStrategy` (single vs dual-layer) over a shared BFS engine. |
| Template Method | `electron/saves/manifest-store.ts`, `electron/lib/import-source.ts` | `createManifestStore` (normal+auto saves); `resolveSourceFiles` (msu+languages). |
| Observer | Zustand stores; `subscribeGameState`; `window.__on*` | State + C→JS events. |

## Remediation log

### 2026-06-09 — post-refactor consistency pass

- **Dead code removed** — superseded `shared/game/navigation/hub/` (7 files,
  replaced by `strategies/`+`bfs-engine`); the `NavReviewPanel` UI island (6 files);
  `ProfileHub/sub-components/GraphicsSettings.tsx` (superseded by the data-driven
  `SettingsView`); 5 unused command wrappers in `bridge/commands.ts`; the
  `@deprecated useConnectionOverlayStore` alias; and the unused singletons
  `invalidateCache`, `initAllNintendoControllers`, `requiresRestart`,
  `getVisibleOverworldScreenIndices` (+ their barrel re-exports).
- **Electron store/IPC unified** — new `saves/manifest-store.ts`
  (`createManifestStore`, Template Method) backs both `normal-store` and
  `auto-store` (~100 lines of duplication gone); the input stores now use the
  shared `getUserDataPath` (dropped private `userDataPath`/`init*Store` plumbing and
  a hardcoded `'Data'` literal ×3); new `lib/result.ts` (`fail`/`errMessage`) and
  `toBase64OrNull` (`lib/buffer.ts`) dedupe the import-result envelope and screenshot
  encoding; `input/ipc-handlers.ts` normalized to the one-liner `handle()` form.
- **Bridge consistency** — `setInput` now routes through the `voidCall` primitive
  (was the one hand-rolled guard); `window.__zelda3Module` documented as a
  write-only devtools handle (the canonical ref is `currentModule`).
- **C hook** — `player.c`'s inline extra-armor arithmetic extracted into
  `GameHook_ApplyExtraArmor` (`core/game-hooks/cheats.c`); vendored zelda3 now just
  calls the hook. **Requires a [WASM rebuild](../contributing/building-wasm.md) to
  take effect** + a gameplay test of the extra-armor cheat.
- **Conventions** — `core/zelda3/` declared out-of-scope in `CLAUDE.md` (our
  `GameHook_*` logic excepted); HUD declared a CSS-rule exception (it reproduces the
  SNES HUD) in `eslint.config.mjs` + `.stylelintrc.json`.

## Intentional unused surfaces — do NOT flag as dead

These have **no renderer `ccall`/import on purpose**. A dead-code sweep will list
them as "no caller" — that is expected. Check this registry before removing anything
that matches.

### Headless / `--command` startup WASM exports

Invoked via the headless/automation path (Node scripts like
`scripts/analyze-navigation.ts`, and the `--auto-state` / `--screenshot` /
`--dump-layers` / `--dump-nav` startup commands handled in
`core/wasm-build/emscripten_main.c`), **not** the interactive renderer bridge.

| Export | Documented in |
|--------|---------------|
| `WasmInitHeadless`, `WasmSetInputMode`, `WasmLoadSram` | [Save / Load / I-O](../hooks/save-load-io.md) |
| `WasmGetFeatures`, `WasmGetPpuRenderFlags` | [Rendering & Settings](../hooks/rendering-settings.md) |
| `WasmGetRoomCollisionTypeForRoom` | [State Queries — Rooms](../hooks/state-queries-rooms.md) |

> Remove these only if the headless/automation path itself is dropped — it isn't.

### Forward-looking integration scaffolding (WIP)

| Surface | Purpose |
|---------|---------|
| `lib/game/delivery-api.ts` (`deliverItem`/`deliverCheck`/`deliverNpcCheck`/`deliverCustom`) | Randomizer / networking item delivery (see [Planned Improvements](../project/known-limitations.md)). |
| `shared/game/navigation/flood-fill` → `floodFillWorld` | Multi-screen reachability building block, not yet wired into the live overlay. |
| `shared/game/navigation/session` → `buildFloodFillSession` | Session assembly for the in-progress navigation system (see [Navigation Architecture](navigation.md)). |

## Pending follow-ups

- **Rebuild the WASM core** so the `GameHook_ApplyExtraArmor` extraction takes
  effect; verify the extra-armor cheat in-game.
- The inline-style / `<box as=…>` lint burn-down is tracked separately (the four UI
  tiers; see [Design System](../contributing/design-system.md)).
