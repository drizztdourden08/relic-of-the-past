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
#include "src/dungeon.h"
#include "src/gba_alttp.h"

#include "game_constants.h"
#include "game_hooks_internal.h"
#include "host_gates.h"
#include "num_util.h"
#include "emscripten_internal.h"

// Backdrop-black flag pairs with g_ppu_render_flags; only the API touches it.
static bool g_force_backdrop_black = false;

// Developer harness entry point. Normal gameplay reaches this through the
// Pyramid hole and never calls this export.
EMSCRIPTEN_KEEPALIVE
int WasmDebugEnterGbaPalace(void) {
  if (!GbaAlttp_IsAvailable())
    return 0;
  which_entrance = kGbaAlttpEntrance;
  sram_progress_indicator = 3;
  if (link_health_capacity == 0)
    link_health_capacity = link_health_current = 0x18;
  Module_PreDungeon();
  main_module_index = 7;
  submodule_index = 0;
  subsubmodule_index = 0;
  flag_is_link_immobilized = 0;
  flag_block_link_menu = 0;
  link_auxiliary_state = 0;
  link_incapacitated_timer = 0;
  link_player_handler_state = 0;
  printf("[GBA ALttP] Debug entrance room=%04x active=%d\n",
         dungeon_room_index, GbaAlttp_IsPalaceActive());
  return GbaAlttp_IsPalaceRoom(dungeon_room_index) && dungeon_room_index == 0x88;
}

EMSCRIPTEN_KEEPALIVE
int WasmDebugGetLinkX(void) { return link_x_coord; }

EMSCRIPTEN_KEEPALIVE
int WasmDebugGetLinkY(void) { return link_y_coord; }

EMSCRIPTEN_KEEPALIVE
int WasmDebugGetDungeonRoom(void) { return dungeon_room_index; }

EMSCRIPTEN_KEEPALIVE
int WasmDebugGetOverworldScreen(void) { return overworld_screen_index; }

EMSCRIPTEN_KEEPALIVE
int WasmDebugGetOverworldMap16Cell(int index) {
  return (unsigned)index < 4096 ? dung_bg2[index] : -1;
}

EMSCRIPTEN_KEEPALIVE
int WasmDebugGetOverworldBaseX(void) { return overworld_offset_base_x; }

EMSCRIPTEN_KEEPALIVE
int WasmDebugGetOverworldBaseY(void) { return overworld_offset_base_y; }

EMSCRIPTEN_KEEPALIVE
int WasmDebugGetRuntimeState(int index) {
  switch (index) {
  case 0: return player_is_indoors;
  case 1: return dungeon_room_index;
  case 2: return link_x_coord;
  case 3: return link_y_coord;
  case 4: return BG2HOFS_copy2;
  case 5: return BG2VOFS_copy2;
  case 6: return camera_x_coord_scroll_low;
  case 7: return camera_y_coord_scroll_low;
  case 8: return room_bounds_x.a0;
  case 9: return room_bounds_x.a1;
  case 10: return room_bounds_y.a0;
  case 11: return room_bounds_y.a1;
  case 12: return link_quadrant_x;
  case 13: return link_quadrant_y;
  case 14: return quadrant_fullsize_x;
  case 15: return quadrant_fullsize_y;
  case 16: return is_standing_in_doorway;
  case 17: return link_direction_facing;
  case 18: return link_tile_below;
  case 19: return ow_entrance_value;
  case 20: return main_module_index;
  case 21: return submodule_index;
  case 22: return GbaAlttp_IsPalaceActive();
  case 23: return composite_of_layout_and_quadrant;
  case 24: return dung_hdr_collision;
  case 25: return link_is_on_lower_level;
  case 26: return link_is_on_lower_level_mirror;
  case 27: return oam_priority_value;
  default: return -1;
  }
}

EMSCRIPTEN_KEEPALIVE
int WasmDebugGetDungeonAttr(int index) {
  return (unsigned)index < 0x2000 ? dung_bg2_attr_table[index] : -1;
}

EMSCRIPTEN_KEEPALIVE
int WasmDebugGetInputMode(void) { return g_js_input_mode; }

EMSCRIPTEN_KEEPALIVE
void WasmDebugResetGbaPalace(void) { GbaAlttp_EndPalace(); }

EMSCRIPTEN_KEEPALIVE
void WasmDebugShiftOverworld(int dx, int dy) {
  if (player_is_indoors)
    return;
  link_x_coord += dx;
  link_y_coord += dy;
  BG1HOFS_copy += dx;
  BG1HOFS_copy2 += dx;
  BG2HOFS_copy += dx;
  BG2HOFS_copy2 += dx;
  BG1VOFS_copy += dy;
  BG1VOFS_copy2 += dy;
  BG2VOFS_copy += dy;
  BG2VOFS_copy2 += dy;
  camera_x_coord_scroll_low += dx;
  camera_x_coord_scroll_hi += dx;
  camera_y_coord_scroll_low += dy;
  camera_y_coord_scroll_hi += dy;
}

// ---------------------------------------------------------------------------
// Live settings — callable from JS while game is running
// ---------------------------------------------------------------------------

// ─── Gate words ───
// A gate bit is one bit of one 32-bit word. Words 0-5 are recorded WRAM (features.h) and so are part of
// save states and replays; the host-gate words are plain globals for gates the game core cannot observe.
// Indices are frozen — see the note on kGateWordCount.
EMSCRIPTEN_KEEPALIVE
void WasmSetGateWord(int index, uint32_t value) {
  if ((unsigned)index < (unsigned)kGateWordCount)
    g_wanted_gate_words[index] = value;
}

// Returns what was last REQUESTED for this word, before any masking (e.g. Vanilla Safe) is applied —
// useSimRun.ts's readWantedFeatures() relies on seeing this immediately, before the request has even
// latched into WRAM on the next SyncGateWords(). Callers that need to know what the core will actually
// honour (e.g. "is this cheat allowed to fire right now") want WasmGetEffectiveGateWord instead.
EMSCRIPTEN_KEEPALIVE
uint32_t WasmGetGateWord(int index) {
  return (unsigned)index < (unsigned)kGateWordCount ? g_wanted_gate_words[index] : 0;
}

// The value actually landed in WRAM as of the last SyncGateWords() — i.e. after the Vanilla Safe mask,
// unlike WasmGetGateWord which can disagree with this the instant a bit gets stripped before it ever
// reaches WRAM. Reads 0 before the very first simulated frame, since WRAM starts zeroed and nothing has
// synced into it yet: the honest answer for "what is in effect" is nothing.
EMSCRIPTEN_KEEPALIVE
uint32_t WasmGetEffectiveGateWord(int index) {
  return ZeldaGetEffectiveGateWord(index);
}

EMSCRIPTEN_KEEPALIVE
void WasmSetHostGateWord(int index, uint32_t value) {
  HostGates_SetWord(index, value);
}

EMSCRIPTEN_KEEPALIVE
uint32_t WasmGetHostGateWord(int index) {
  return HostGates_GetWord(index);
}

// The three original per-word entry points, kept as adapters onto the same array so every existing
// caller keeps working unchanged. Prefer WasmSetGateWord for anything new.
EMSCRIPTEN_KEEPALIVE
void WasmSetFeatures(uint32_t features) {
  WasmSetGateWord(0, features);
}

EMSCRIPTEN_KEEPALIVE
uint32_t WasmGetFeatures(void) {
  return WasmGetGateWord(0);
}

EMSCRIPTEN_KEEPALIVE
void WasmSetFeatures1(uint32_t features) {
  WasmSetGateWord(1, features);
}

EMSCRIPTEN_KEEPALIVE
uint32_t WasmGetFeatures1(void) {
  return WasmGetGateWord(1);
}

EMSCRIPTEN_KEEPALIVE
void WasmSetFeatures2(uint32_t features) {
  WasmSetGateWord(2, features);
}

EMSCRIPTEN_KEEPALIVE
uint32_t WasmGetFeatures2(void) {
  return WasmGetGateWord(2);
}

EMSCRIPTEN_KEEPALIVE
void WasmSetPpuRenderFlags(int flags) {
  // Preserve BlackBG2 flag (managed separately by WasmSetForceBackdropBlack)
  g_ppu_render_flags = flags | (g_force_backdrop_black ? kPpuRenderFlags_BlackBG2 : 0);
}

// Hiding the native HUD/pause menu requires kFeatures3_HudOverride. Both exports only record the
// REQUEST here; hud_override.c reconciles it against the gate every frame. Resolving the gate at this
// call instead was the doubled-HUD bug: the request lands before SyncGateWords() has latched the gate
// word into WRAM, so it was refused once and never retried, leaving the native HUD drawn underneath
// the enhanced overlay.
EMSCRIPTEN_KEEPALIVE
void WasmSetHudHidden(int hidden) {
  HudOverride_SetWantedHudHidden(hidden != 0);
}

// See WasmSetHudHidden above — same gate, same deferred reconcile.
EMSCRIPTEN_KEEPALIVE
void WasmSetPauseHidden(int hidden) {
  HudOverride_SetWantedPauseHidden(hidden != 0);
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

// Swap the frame loop between the display's vertical blank and the fixed timer. Live-safe: the
// profile pushes the current choice at startup and again whenever the setting changes.
EMSCRIPTEN_KEEPALIVE
void WasmSetVsync(int enable) {
  SetVsyncMode(enable != 0);
}

EMSCRIPTEN_KEEPALIVE
int WasmGetVsync(void) {
  return g_vsync ? 1 : 0;
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

// Legacy single-letter cheat command (health/magic fill, ammo/rupee fill, key grant, ignore-collision
// toggle) — forwards straight to vendored PatchCommand, which writes through StateRecoderMultiPatch and
// so lands in the replay log. No renderer caller exists (the TS cheat surface goes through the typed
// WasmCheatSet*/WasmCheatGive* exports in cheats.c instead), but the symbol stays reachable from the
// console or any future embedder, so it needs the same permission any other mutating cheat export
// requires rather than acting on every request unconditionally.
EMSCRIPTEN_KEEPALIVE
void WasmCheat(int cmd) {
  if (!CheatGate(kFeatures3_CheatStats)) return;
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
