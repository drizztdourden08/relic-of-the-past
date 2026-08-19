/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── HUD/Pause Override ───
// kFeatures3_HudOverride gates hiding the native HUD and pause menu, so Vanilla Safe can always bring
// them back. The enhanced overlay works by hiding the native HUD and drawing its own, so a refused hide
// is not a neutral outcome: both draw at once and the player sees a doubled HUD.
//
// The request and the gate therefore cannot be resolved at call time. WasmSetHudHidden runs when the
// renderer pushes settings, while the gate lives in a WRAM word SyncGateWords() only latches once per
// frame — so at boot the request arrives first, gets refused, and nothing ever asks again. That is the
// doubled HUD. The request is kept here as host-side WANTED state and reconciled against the gate every
// frame instead (HudOverride_Sync, alongside SyncCheatWram), which is order-independent by construction
// and also repaints correctly when the gate opens or closes mid-session.

static bool g_wanted_hud_hidden;
static bool g_wanted_pause_hidden;

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
  if (hud != g_hud_hide_mask) {
    g_hud_hide_mask = hud;
    flag_update_hud_in_nmi++;
  }

  uint8 pause = (g_wanted_pause_hidden && allowed) ? PAUSE_HIDE_ALL : 0;
  bool newly_hidden = pause && !g_pause_hide_mask;
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
  // to "not hidden" on its own — no second copy of that logic to drift from this one.
  HudOverride_Sync();
}
