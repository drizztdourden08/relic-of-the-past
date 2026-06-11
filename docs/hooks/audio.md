<!-- @layer docs @kind doc -->
# Audio

Three volume setters, all on a 0–128 scale that maps to `SDL_MIX_MAXVOLUME`. The music and SFX setters
target the live DSP channels; if the SPC player isn't up yet, the value is stashed and applied on init.

**Source:** `core/wasm-build/emscripten_api.c` · **Bridge:** `lib/game/live-settings.ts`

| Function | Signature | Effect |
|----------|-----------|--------|
| `WasmSetAppMasterVolume` | `void(int volume)` | Master SDL mixer volume (0 = mute, 128 = full). |
| `WasmSetMusicVolume` | `void(int volume)` | Music DSP channel volume (`dsp_setMusicVolume`); pending if player not ready. |
| `WasmSetSfxVolume` | `void(int volume)` | SFX DSP channel volume (`dsp_setSfxVolume`); pending if player not ready. |

> Volume values are clamped to `[0, 128]`. See [Audio & MSU-1](../user-guide/audio-msu.md) for the
> user-facing controls these back. Note that MSU-1 music streaming is handled in the Electron/JS
> layer, separate from the SPC DSP volume above.
