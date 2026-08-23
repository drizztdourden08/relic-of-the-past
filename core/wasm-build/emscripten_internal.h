/* @layer core-wasm-build @kind native */
// Shared state across the WASM entry harness translation units.
// emscripten_main.c owns the canonical definitions of these globals (unless
// noted otherwise); emscripten_sdl.c and emscripten_api.c reference them via
// the extern declarations here. Splitting the former monolithic
// emscripten_main.c keeps each TU under the size cap without changing behavior.
#ifndef EMSCRIPTEN_INTERNAL_H
#define EMSCRIPTEN_INTERNAL_H

#include <stdbool.h>
#include <SDL.h>
#include "src/types.h"
#include "src/util.h"  // struct RendererFuncs

// ── Display / PPU (defined in emscripten_main.c) ──
extern int g_snes_width, g_snes_height;
extern int g_ppu_render_flags;

// ── Input (defined in emscripten_main.c) ──
extern int g_input1_state;
extern uint8 g_paused;
extern bool g_js_input_mode;

// ── FPS (defined in emscripten_main.c) ──
extern int g_curr_fps;

// ── Frame pacing (defined in emscripten_pacing.c) ──
// Nominal NTSC frame time. The game step is gated on this so a display-synced loop
// advances at the right speed no matter what the refresh rate is.
#define FRAME_INTERVAL_MS (1000.0 / 60.0988)
// True while the loop is display-synced (rAF); false for the timer schedule.
extern bool g_vsync;
// Milliseconds of game time owed. Only consulted in vsync mode.
extern double g_frame_accumulator;
extern double g_last_frame_time;
void SetVsyncMode(bool enable);
int StepsOwedThisTick(void);

// ── Audio (defined in emscripten_main.c) ──
extern uint8 *g_audiobuffer, *g_audiobuffer_cur, *g_audiobuffer_end;
extern int g_frames_per_block;
extern uint8 g_audio_channels;
extern int g_sdl_audio_mixer_volume;

// ── Deferred sub-volumes (defined in emscripten_main.c) ──
extern int g_pending_music_volume;
extern int g_pending_sfx_volume;
extern int g_pending_ambient_volume;
void FlushPendingVolumes(void);

// ── SDL renderer/input handlers (defined in emscripten_sdl.c) ──
extern const struct RendererFuncs kSdlRendererFuncs;
void SDLCALL AudioCallback(void *userdata, Uint8 *stream, int len);
void HandleInput(int keyCode, bool pressed);
void HandleCommand(int keyCode);

// ── Bring-up / assets (defined in emscripten_io.c) ──
void WasmZeldaInitialize(void);
void LoadAssets(void);

#endif // EMSCRIPTEN_INTERNAL_H
