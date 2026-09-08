/* @layer core-game-hooks @kind native */
// The escape hatch for a player who cannot move and has no way back.
//
// Several sequences hand the release of flag_is_link_immobilized to a later step: a receipt's
// own cleanup, a cutscene's closing state, a sprite that owns the ceremony it started. When one
// of those steps never runs, nothing else in the game will ever clear the flag, and the save is
// stuck where it stands. This clears the flag and the handler state that rides with it, so a
// tester can walk out and carry on instead of abandoning the file.
//
// It fixes no single cause on purpose. It exists for the ones not found yet, which is also why
// it does not fit any of the per-category cheat bits and tests only the master switch, the same
// reasoning WasmCheatStartTrace uses. It refuses outside normal gameplay so it can never pull
// the player out of a menu, a text box or a screen transition.
#include "game_hooks_internal.h"

// Normal interactive gameplay, indoors or out. Mirrors the test cheats.c makes for the same
// question; kept here so this file owns its own guard.
static bool InGameplay(void) {
  return main_module_index == MODULE_DUNGEON || main_module_index == MODULE_OVERWORLD
      || GameHook_IsOverworldSpecialArea();
}

EMSCRIPTEN_KEEPALIVE
void WasmCheatUnblockLink(void) {
  if (!(enhanced_features3 & kFeatures3_CheatsEnabled)) return;
  if (!InGameplay()) return;
  flag_is_link_immobilized = 0;
  link_player_handler_state = 0;
  link_position_mode = 0;
  link_item_in_hand = 0;
  link_cant_change_direction = 0;
  link_force_hold_sword_up = 0;
  link_auxiliary_state = 0;
  submodule_index = 0;
  printf("[Cheat] UnblockLink: cleared immobilize/handler-state/position-mode/submodule\n");
}
