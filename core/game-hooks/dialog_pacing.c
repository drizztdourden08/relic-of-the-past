/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── Dialog pacing ───
// The text engine advances one step per frame: one glyph, one tick of a [Wait] timer, one slice of a
// [Scroll]. A speed multiplier is therefore "run that step more than once a frame". The engine's own
// step is handed over by RenderText (messaging.c), so nothing in the vendored pump changes: a [Speed 03]
// line at 2x still pays its 3-frame delay per glyph, in 1.5 frames of wall time.
//
// Three requests share the loop. The base multiplier from the settings slider. A hold multiplier while
// A is held. And a one-shot "fill": a B press while the box is still typing latches instant until the
// engine parks on a key wait, and that press is masked so it fills the box without also advancing it.
//
// A fourth request changes what a step IS. The game's default [Speed 00] writes a whole line in one
// step, so no multiplier below 1x can slow it; the typewriter request makes such a line one glyph per
// step (GameHook_DialogTypewriter, read at the letter case of RenderText_Draw_MessageCharacters), so
// the multiplier becomes a typing rate: 1x is one glyph a frame, 0.5x one every other frame.
//
// Every value here is host-side state, never WRAM, so a save state carries none of it and the snapshot
// size is untouched. Gated on kFeatures3_DialogControls: off means one step, a whole line per step, and
// the joypad untouched.

// Multipliers in 1/4 units: 4 = 1.0x, 6 = 1.5x, 16 = 4x. 0 = instant.
static uint8 g_base_q4 = 4;
static uint8 g_hold_q4 = 8;
static bool g_hold_on;
static bool g_fill_on;
static bool g_fill_latched;
static bool g_typewriter;
// True while GameHook_DialogRender is stepping a message frame by frame, the only place typing one glyph
// per step makes sense. The game-over menu enters through the same hook but writes its lines with five
// steps inside that one call, so it needs whole lines.
static bool g_in_paced_run;

// kMessaging_Text[2], RenderText_PostDeathSaveOptions: the game-over menu's one-frame writer.
enum { kMessagingModule_PostDeath = 2 };
// Fractional step credit carried between frames, in 1/4 steps.
static uint16 g_credit;

// Steps a frame at "instant". Enough to clear the longest [Wait 0F] (500 frames) in two frames while
// keeping one frame's work bounded; the loop stops earlier at any key wait or when the box closes.
enum { kInstantStepsPerFrame = 240 };

// A/B/X/Y in the two filtered joypad bytes (zelda_rtl.h): A and X live in the L byte's top bits, B and
// Y in the H byte's. The engine advances a key wait on any of the four.
enum { kJoypadFaceMask = 0xC0 };
enum { kJoypadA_L = 0x80, kJoypadB_H = 0x80 };

// The pump's state index while it types (kText_Render[3], RenderText_Draw_MessageCharacters).
enum { kTextRenderState_Characters = 3 };

static bool PacingOn(void) {
  return (enhanced_features3 & kFeatures3_DialogControls) != 0;
}

static bool AtKeyWait(void) {
  return DialogMirror_IsKeyWaitCommand(DialogMirror_LastCommand());
}

// A B press while the pump is typing (not parked on a key wait) becomes a fill. The press is taken out
// of both filtered bytes so the same frame's key wait, if the fill reaches one, still waits for a new
// press: one press writes the box, the next one advances it.
static void LatchFillOnB(void) {
  if (!g_fill_on || g_fill_latched) return;
  if (text_render_state != kTextRenderState_Characters) return;
  if (!(filtered_joypad_H & kJoypadB_H)) return;
  if (AtKeyWait()) return;
  g_fill_latched = true;
  filtered_joypad_H &= ~kJoypadFaceMask;
  filtered_joypad_L &= ~kJoypadFaceMask;
}

static int StepsThisFrame(void) {
  if (!PacingOn()) return 1;
  LatchFillOnB();
  int q4 = g_base_q4;
  if (g_hold_on && (joypad1L_last & kJoypadA_L) && q4 != 0 && g_hold_q4 > q4) q4 = g_hold_q4;
  if (g_fill_latched || q4 == 0) return kInstantStepsPerFrame;
  g_credit += q4;
  int steps = g_credit >> 2;
  g_credit &= 3;
  return steps;
}

static bool BoxClosed(uint8 module_at_entry) {
  return main_module_index != module_at_entry || (messaging_module == 0 && submodule_index == 0);
}

void GameHook_DialogRender(void (*step)(void)) {
  DialogPresence_MarkRendered();
  g_in_paced_run = messaging_module != kMessagingModule_PostDeath;
  int steps = StepsThisFrame();
  uint8 module = main_module_index;
  // A zero-credit frame under a slow fraction still runs nothing, matching the engine's own idea of
  // "this frame is a wait frame"; the credit carries to the next one.
  while (steps-- > 0) {
    step();
    if (BoxClosed(module) || AtKeyWait()) break;
  }
  g_in_paced_run = false;
  if (g_fill_latched && (AtKeyWait() || BoxClosed(module))) g_fill_latched = false;
}

// Whether a [Speed 00] line types one glyph per step instead of all at once. A fill in progress keeps
// the whole-line behaviour, since it wants the box written now.
bool GameHook_DialogTypewriter(void) {
  return PacingOn() && g_typewriter && g_in_paced_run && !g_fill_latched;
}

EMSCRIPTEN_KEEPALIVE
void WasmSetDialogPacing(int base_q4, int hold_q4, int hold_on, int fill_on, int typewriter) {
  g_base_q4 = (uint8)base_q4;
  g_hold_q4 = (uint8)hold_q4;
  g_hold_on = hold_on != 0;
  g_fill_on = fill_on != 0;
  g_typewriter = typewriter != 0;
  g_fill_latched = false;
  g_credit = 0;
}
