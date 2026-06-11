<!-- @layer docs @kind doc -->
# Rendering & Settings

Live display toggles, feature flags, FPS, and the HUD-less "clean frame" used by the edge-glow
shader. All live in `emscripten_api.c`; setters are callable while the game runs.

**Source:** `core/wasm-build/emscripten_api.c` · **Bridge:** `lib/game/live-settings.ts`, `lib/game/bridge/render.ts`, `lib/game/bridge/ui-state.ts`, `lib/game/fps.ts`

---

## Feature & PPU flags

| Function | Signature | Effect |
|----------|-----------|--------|
| `WasmSetFeatures` | `void(uint32_t features)` | Sets `g_wanted_zelda_features`, the enhancement bitmask covering widescreen, sprite limits, and similar flags. |
| `WasmGetFeatures` | `uint32_t(void)` | Current feature bitmask. |
| `WasmSetPpuRenderFlags` | `void(int flags)` | Sets PPU render flags; preserves the separately-managed `BlackBG2` bit. |
| `WasmGetPpuRenderFlags` | `int(void)` | Current PPU render flags. |

## HUD & menu

| Function | Signature | Effect |
|----------|-----------|--------|
| `WasmSetHudHidden` | `void(int hidden)` | Hides/shows the native HUD (`HUD_HIDE_ALL`); forces a HUD refresh on show. Used when the React HUD overlay takes over. |
| `WasmSetPauseHidden` | `void(int hidden)` | Hides/shows the native pause menu; immediately blanks pause VRAM if the menu is already up. |
| `WasmGetMenuState` | `int(void)` | In-game menu phase: `0` gameplay, `1` opening, `2` open/browsing, `3` closing. |

## Performance

| Function | Signature | Effect |
|----------|-----------|--------|
| `WasmGetFps` | `int(void)` | Current measured FPS (`g_curr_fps`). |
| `WasmSetDisplayPerf` | `void(int enable)` | Toggle FPS readout in the window title. |

## Clean frame (edge-glow source)

A HUD-less, sprite-less render of the current frame, used by the [edge-glow](../user-guide/visual-enhancements.md)
post-processing. Render first, then read the width, height, and RGBA buffer.

| Function | Signature | Returns |
|----------|-----------|---------|
| `WasmRenderCleanFrame` | `int(void)` | Renders with `NoBG3 + NoSprites` into a static RGBA buffer; returns its `HEAPU8` pointer (or `0` if the frame exceeds the max buffer). |
| `WasmGetCleanFrameWidth` | `int(void)` | Width in px of the last clean frame. |
| `WasmGetCleanFrameHeight` | `int(void)` | Height in px of the last clean frame. |

Buffer is sized for up to 856×484 RGBA (`render_scale`-dependent). Read it the same frame you render it.
