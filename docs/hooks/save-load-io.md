<!-- @layer docs @kind doc -->
# Save / Load / I-O

Engine bring-up, per-frame input injection, and save-state / SRAM persistence.

**Source:** `core/wasm-build/emscripten_io.c`
**Bridge:** `lib/game/save-states.ts`, `lib/game/sram-sync.ts`, `lib/game/auto-save.ts`, `lib/game/wasm-bridge.ts`

---

## Initialization & input

| Function | Signature | Effect |
|----------|-----------|--------|
| `WasmInitHeadless` | `int(void)` | Loads `zelda3_assets.dat` and initializes the core without SDL (no render or audio). For Node scripts that only build grids; call after `Module` loads with `noInitialRun`. Returns `1`. |
| `WasmSetInput` | `void(int mask)` | Sets the SNES controller bitmask for the next frame and switches to JS input mode. The renderer calls this each frame. |
| `WasmSetInputMode` | `void(int jsMode)` | `1` = take input from `WasmSetInput`; `0` = native keyboard (and clears the held mask). |

The SNES button bitmask (`mask`) packs the standard buttons (B, Y, Select, Start, D-pad, A, X, L, R);
see how `lib/input/` composes it before calling `WasmSetInput`.

## Save states & SRAM

| Function | Signature | Effect |
|----------|-----------|--------|
| `WasmSaveState` | `void(int slot)` | `SaveLoadSlot(Save, slot)` — snapshot full machine state to an in-memory slot. The Electron layer persists slot blobs + screenshots to disk. |
| `WasmLoadState` | `void(int slot)` | Restore a slot. |
| `WasmSaveSram` | `void(void)` | `ZeldaWriteSram` — flush the persistent battery save. |
| `WasmLoadSram` | `void(void)` | `ZeldaReadSram` — load the persistent battery save. |

> Save states (full machine snapshots) are distinct from SRAM (the in-game battery save). See
> [Save States](../user-guide/save-states.md) for how the app wires slots, screenshots, and auto-save
> on top of these primitives.
