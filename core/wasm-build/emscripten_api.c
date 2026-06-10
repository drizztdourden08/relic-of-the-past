/* @layer core-wasm-build @kind native */
// JS-facing live settings, volume, game-command, and clean-frame Wasm exports.
// Split out of emscripten_main.c; shares engine state via emscripten_internal.h.

#include <stdint.h>
#include <SDL.h>
#include <emscripten.h>

#include "snes/ppu.h"
#include "snes/dsp.h"

#include "src/types.h"
#include "src/variables.h"
#include "src/zelda_rtl.h"
#include "src/config.h"
#include "src/features.h"
#include "src/hud.h"
#include "src/spc_player.h"

#include "game_constants.h"
#include "num_util.h"
#include "emscripten_internal.h"

// Backdrop-black flag pairs with g_ppu_render_flags; only the API touches it.
static bool g_force_backdrop_black = false;

// ---------------------------------------------------------------------------
// Live settings — callable from JS while game is running
// ---------------------------------------------------------------------------
EMSCRIPTEN_KEEPALIVE
void WasmSetFeatures(uint32_t features) {
  g_wanted_zelda_features = features;
}

EMSCRIPTEN_KEEPALIVE
uint32_t WasmGetFeatures(void) {
  return g_wanted_zelda_features;
}

EMSCRIPTEN_KEEPALIVE
void WasmSetPpuRenderFlags(int flags) {
  // Preserve BlackBG2 flag (managed separately by WasmSetForceBackdropBlack)
  g_ppu_render_flags = flags | (g_force_backdrop_black ? kPpuRenderFlags_BlackBG2 : 0);
}

EMSCRIPTEN_KEEPALIVE
void WasmSetHudHidden(int hidden) {
  uint8 old_mask = g_hud_hide_mask;
  g_hud_hide_mask = hidden ? HUD_HIDE_ALL : 0;
  // When transitioning from hidden → visible, force a HUD refresh
  if (old_mask && !g_hud_hide_mask) {
    flag_update_hud_in_nmi++;
  }
}

EMSCRIPTEN_KEEPALIVE
void WasmSetPauseHidden(int hidden) {
  g_pause_hide_mask = hidden ? PAUSE_HIDE_ALL : 0;
  // Immediately filter existing VRAM if pause menu is currently active.
  // Handles save-state loads where NMI already uploaded tiles before mask was set.
  if (g_pause_hide_mask && main_module_index == MODULE_MENU) {
    uint16 *vram = &g_zenv.vram[104 << 8]; // kNmiVramAddrs[0x22]=104
    for (int i = 0; i < 0x400; i++) {
      if (vram[i] != 0x207f)
        vram[i] = 0x207f;
    }
  }
}

EMSCRIPTEN_KEEPALIVE
int WasmGetPpuRenderFlags(void) {
  return g_ppu_render_flags;
}

// Returns the in-game menu state:
// 0 = gameplay, 1 = menu opening, 2 = menu open, 3 = menu closing
EMSCRIPTEN_KEEPALIVE
int WasmGetMenuState(void) {
  if (main_module_index != MODULE_MENU || submodule_index != 1)
    return 0;
  // Inside Hud_Module_Run: overworld_map_state drives the sub-phase
  uint8 phase = overworld_map_state;
  if (phase <= 2) return 1; // clearing/init/scrolling down
  if (phase == 6) return 3; // scrolling back up
  return 2;                 // browsing (states 3-5, 7-12)
}

EMSCRIPTEN_KEEPALIVE
int WasmGetFps(void) {
  return g_curr_fps;
}

EMSCRIPTEN_KEEPALIVE
void WasmSetDisplayPerf(int enable) {
  g_config.display_perf_title = enable;
}

// ---------------------------------------------------------------------------
// Volume — masters the SDL audio mixer + per-channel DSP volumes
// ---------------------------------------------------------------------------
EMSCRIPTEN_KEEPALIVE
void WasmSetAppMasterVolume(int volume) {
  // volume: 0-128 scale, where 128 == SDL_MIX_MAXVOLUME.
  g_sdl_audio_mixer_volume = clampi(volume, 0, SDL_MIX_MAXVOLUME);
}

EMSCRIPTEN_KEEPALIVE
void WasmSetMusicVolume(int volume) {
  uint8_t v = (uint8_t)clampi(volume, 0, 128);
  if (g_zenv.player && g_zenv.player->dsp)
    dsp_setMusicVolume(g_zenv.player->dsp, v);
  else
    g_pending_music_volume = v;
}

EMSCRIPTEN_KEEPALIVE
void WasmSetSfxVolume(int volume) {
  uint8_t v = (uint8_t)clampi(volume, 0, 128);
  if (g_zenv.player && g_zenv.player->dsp)
    dsp_setSfxVolume(g_zenv.player->dsp, v);
  else
    g_pending_sfx_volume = v;
}

// ---------------------------------------------------------------------------
// Game commands — callable from JavaScript for pause, reset, cheats
// ---------------------------------------------------------------------------
EMSCRIPTEN_KEEPALIVE
void WasmSetPaused(int paused) {
  g_paused = paused ? 1 : 0;
}

EMSCRIPTEN_KEEPALIVE
int WasmGetPaused(void) {
  return g_paused;
}

EMSCRIPTEN_KEEPALIVE
void WasmTogglePause(void) {
  g_paused = !g_paused;
}

EMSCRIPTEN_KEEPALIVE
void WasmReset(int warm) {
  ZeldaReset(warm ? true : false);
}

EMSCRIPTEN_KEEPALIVE
void WasmCheat(int cmd) {
  PatchCommand((char)cmd);
}

EMSCRIPTEN_KEEPALIVE
void WasmSetForceBackdropBlack(int enable) {
  g_force_backdrop_black = enable != 0;
  if (g_force_backdrop_black)
    g_ppu_render_flags |= kPpuRenderFlags_BlackBG2;
  else
    g_ppu_render_flags &= ~kPpuRenderFlags_BlackBG2;
}

// ---------------------------------------------------------------------------
// Clean frame buffer (no HUD) for edge glow shader
// ---------------------------------------------------------------------------
// Max buffer: 852 * 480 * 4 = 1,635,840 bytes (RGBA at 2x scale for 426x240)
#define CLEAN_FRAME_MAX_SIZE (856 * 484 * 4)
static uint8 g_clean_frame_buf[CLEAN_FRAME_MAX_SIZE];
static int g_clean_frame_width = 0;
static int g_clean_frame_height = 0;

EMSCRIPTEN_KEEPALIVE
int WasmRenderCleanFrame(void) {
  int render_scale = PpuGetCurrentRenderScale(g_zenv.ppu, g_ppu_render_flags);
  int w = g_snes_width * render_scale;
  int h = g_snes_height * render_scale;
  int pitch = w * 4;

  if (w * h * 4 > CLEAN_FRAME_MAX_SIZE) return 0;

  g_clean_frame_width = w;
  g_clean_frame_height = h;

  // Render with NoBG3 + NoSprites flags (suppresses HUD and character sprites)
  ZeldaDrawPpuFrame(g_clean_frame_buf, pitch, g_ppu_render_flags | kPpuRenderFlags_NoBG3 | kPpuRenderFlags_NoSprites);

  return (int)g_clean_frame_buf;
}

EMSCRIPTEN_KEEPALIVE
int WasmGetCleanFrameWidth(void) { return g_clean_frame_width; }

EMSCRIPTEN_KEEPALIVE
int WasmGetCleanFrameHeight(void) { return g_clean_frame_height; }
