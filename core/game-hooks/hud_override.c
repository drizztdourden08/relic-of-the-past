/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── HUD/Pause Override ───
// kFeatures3_HudOverride gates hiding the native HUD and pause menu, so Vanilla Safe can always bring
// them back. The enhanced overlay works by hiding the native HUD and drawing its own, so a refused hide
// is not a neutral outcome: both draw at once and the player sees a doubled HUD.
//
// The request and the gate therefore cannot be resolved at call time. WasmSetHudHidden runs when the
// renderer pushes settings, while the gate lives in a WRAM word SyncGateWords() only latches once per
// frame. At boot the request therefore arrives first, gets refused, and nothing ever asks again. That is the
// doubled HUD. The request is kept here as host-side WANTED state and reconciled against the gate every
// frame instead (HudOverride_Sync, alongside SyncCheatWram), which is order-independent by construction
// and also repaints correctly when the gate opens or closes mid-session.

static bool g_wanted_hud_hidden;
static bool g_wanted_pause_hidden;

// Per-category masks for a headless harness. The renderer only ever asks for all-or-nothing, so
// the per-category tables in nmi.c are otherwise unreachable and untestable from a probe. -1 means
// "not overriding" and the reconcile below runs exactly as it always has; the setter is gated on
// the REQUESTED developer-tools bit like WasmDevRunFrame, so with the bit clear these stay -1 and
// nothing here changes. The renderer never calls it.
static int g_dev_hud_mask = -1;
static int g_dev_pause_mask = -1;

EMSCRIPTEN_KEEPALIVE
int WasmDevSetHudHideMasks(int hud, int pause) {
  if (!(g_wanted_gate_words[0] & kFeatures0_DeveloperTools)) return 0;
  g_dev_hud_mask = hud;
  g_dev_pause_mask = pause;
  HudOverride_Sync();
  return 1;
}

bool HudOverride_Allowed(void) {
  return (enhanced_features3 & kFeatures3_HudOverride) != 0;
}

// Blank the pause tiles already sitting in VRAM. Only meaningful while the menu is on screen: NMI has
// uploaded them, so filtering future uploads alone would leave the current frame visible.
static void BlankLivePauseTiles(void) {
  if (main_module_index != MODULE_MENU) return;
  uint16 *vram = &g_zenv.vram[104 << 8]; // kNmiVramAddrs[0x22]=104
  for (int i = 0; i < 0x400; i++) {
    if (vram[i] != 0x207f)
      vram[i] = 0x207f;
  }
}

void HudOverride_Sync(void) {
  bool allowed = HudOverride_Allowed();

  // g_hud_hide_mask only filters the HUD tile copy during the next NMI (nmi.c), so a change in either
  // direction needs the copy forced to actually repaint what the mask stopped or resumed filtering.
  uint8 hud = (g_wanted_hud_hidden && allowed) ? HUD_HIDE_ALL : 0;
  if (g_dev_hud_mask >= 0) hud = (uint8)g_dev_hud_mask;
  if (hud != g_hud_hide_mask) {
    g_hud_hide_mask = hud;
    flag_update_hud_in_nmi++;
  }

  uint8 pause = (g_wanted_pause_hidden && allowed) ? PAUSE_HIDE_ALL : 0;
  if (g_dev_pause_mask >= 0) pause = (uint8)g_dev_pause_mask;
  // A partial mask under test must leave the untargeted tiles alone, so the wholesale blank only
  // applies to the renderer's own all-or-nothing request.
  bool newly_hidden = pause && !g_pause_hide_mask && g_dev_pause_mask < 0;
  g_pause_hide_mask = pause;
  if (newly_hidden) BlankLivePauseTiles();
}

void HudOverride_SetWantedHudHidden(bool on) {
  g_wanted_hud_hidden = on;
  HudOverride_Sync();
}

void HudOverride_SetWantedPauseHidden(bool on) {
  g_wanted_pause_hidden = on;
  HudOverride_Sync();
}

void HudOverride_Restore(void) {
  // Reached from GateWordSideEffects once the bit already reads clear, so the shared reconcile resolves
  // to "not hidden" on its own, with no second copy of that logic to drift from this one.
  HudOverride_Sync();
}
