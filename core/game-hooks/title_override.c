/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── Title override ───
// The host draws the title screen itself and asks for the native one to be kept off the picture.
// kFeatures2_TitleOverride gates the hide, so Vanilla Safe brings the native title back. The request
// is kept as wanted state and tested against the gate at every frame draw, the same shape as the HUD
// override: the request arrives before the gate word reaches WRAM, so it cannot be resolved when made.
//
// The hide is render-only. The PPU copies TM, TS and the fixed colour from their WRAM shadows every
// NMI (nmi.c), so masking the copies the PPU holds for one frame draw hides that frame and nothing
// else: TM_copy, TS_copy and COLDATA_copy stay what the game wrote, and the next frame reads them
// back untouched. The intro keeps running, so the poly thread, the sound cues and the music start
// stay on their frames for the host to follow.

static bool g_wanted_title_hidden;

// Module 20 keeps drawing the title through its own fade before the story starts (Attract_Fade), so
// the hide holds while the attract state is still the title's.
static bool TitleOnScreen(void) {
  if (main_module_index == MODULE_INTRO) return true;
  return main_module_index == MODULE_ATTRACT && attract_state == 0;
}

bool TitleOverride_Hidden(void) {
  return g_wanted_title_hidden && (enhanced_features2 & kFeatures2_TitleOverride) != 0 && TitleOnScreen();
}

void GameHook_TitleMaskLayers(Ppu *ppu) {
  if (!TitleOverride_Hidden()) return;
  ppu->screenEnabled[0] = 0;
  ppu->screenEnabled[1] = 0;
  ppu->fixedColorR = ppu->fixedColorG = ppu->fixedColorB = 0;
  ppu->edgeTileLayers = 0;
}

EMSCRIPTEN_KEEPALIVE
void WasmSetTitleHidden(int hidden) {
  g_wanted_title_hidden = hidden != 0;
}

// Whether the hide is in force this frame, so the host can tell a frame it must cover from one the
// core still draws itself (the gate closed, or the module moved on).
EMSCRIPTEN_KEEPALIVE
int WasmGetTitleHidden(void) {
  return TitleOverride_Hidden() ? 1 : 0;
}
