/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── Title mirror ───
// The intro's own clock, frozen once per frame for the host to draw the title screen against:
// which submodule and step the sequence is in, the poly thread's angles and distance, the sword's
// height and its sparkle counters, the flash and fade countdowns, and where the three triangle
// sprites are. Read at the end of Module00_Intro, after the frame's logic ran, into hook statics
// only, so the save-state snapshot is untouched. The poly bitmap and its palette are handed over as
// views into WRAM, since the NMI copies that block to VRAM as it stands.

typedef struct TitleFrame {
  uint8 module, submodule, subsub;
  uint8 step, step_timer, frame_ctr;
  uint8 inidisp;
  uint8 angle_a, angle_b, distance;
  int16 sword_y;
  uint8 sparkle_phase, sparkle_index, sparkle_run;
  uint8 flash_left, fade;
  int16 piece_x[3], piece_y[3];
  uint8 story_state;
} TitleFrame;

static TitleFrame g_title;

// The sword's counters live in low WRAM under names local to ending.c; the same bytes, read here.
enum { kSwordY = 0xc8, kSwordSparkleIndex = 0xcb, kSwordSparklePhase = 0xcc, kSwordSparkleRun = 0xcd };
enum { kPolyBitmap = 0xe800, kPolyPaletteRow = 0xd0 };

void GameHook_TitleNoteFrame(void) {
  g_title.module = main_module_index;
  g_title.submodule = submodule_index;
  g_title.subsub = subsubmodule_index;
  g_title.step = intro_step_index;
  g_title.step_timer = intro_step_timer;
  g_title.frame_ctr = intro_frame_ctr;
  g_title.inidisp = INIDISP_copy;
  g_title.angle_a = poly_a;
  g_title.angle_b = poly_b;
  g_title.distance = poly_config1;
  g_title.sword_y = (int16)WORD(g_ram[kSwordY]);
  g_title.sparkle_phase = g_ram[kSwordSparklePhase] >> 1;
  g_title.sparkle_index = g_ram[kSwordSparkleIndex];
  g_title.sparkle_run = g_ram[kSwordSparkleRun];
  g_title.flash_left = intro_times_pal_flash;
  g_title.fade = (uint8)palette_filter_countdown;
  for (int k = 0; k < 3; k++) {
    g_title.piece_x[k] = (int16)(intro_x_lo[k] | intro_x_hi[k] << 8);
    g_title.piece_y[k] = (int16)(intro_y_lo[k] | intro_y_hi[k] << 8);
  }
  g_title.story_state = attract_state;
}

// The attract module runs after the intro and never calls the note above, so its module and state
// are refreshed here for the frames where it still shows the title.
void GameHook_TitleNoteAttractFrame(void) {
  g_title.module = main_module_index;
  g_title.story_state = attract_state;
  g_title.inidisp = INIDISP_copy;
  g_title.frame_ctr = intro_frame_ctr;
}

EMSCRIPTEN_KEEPALIVE
const uint8 *WasmGetTitleFrame(void) {
  if (!RenderQueryGate()) return NULL;
  return (const uint8 *)&g_title;
}

EMSCRIPTEN_KEEPALIVE
const uint8 *WasmGetTitlePoly(void) {
  if (!RenderQueryGate()) return NULL;
  return g_ram + kPolyBitmap;
}

EMSCRIPTEN_KEEPALIVE
const uint8 *WasmGetTitlePalette(void) {
  if (!RenderQueryGate()) return NULL;
  return (const uint8 *)(main_palette_buffer + kPolyPaletteRow);
}
