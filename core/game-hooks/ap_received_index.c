/* @layer core-game-hooks @kind native */
// The online received index: how many entries of the multiworld server's received-items list
// this file has already taken. The host decides what the number means and when it moves; the
// core only stores it, in the hook-owned save bytes (save_bytes.h SRM_AP_RECEIVED_INDEX), so it
// is carried by the battery save and by a save state the same way the event ledger is.
//
// Pure storage with no gate: the game never reads these bytes, so a write changes nothing the
// game computes, and the bytes read as zero on any file the host never touched.
#include "game_hooks_internal.h"
#include "save_bytes.h"

EMSCRIPTEN_KEEPALIVE
uint16 WasmGetApReceivedIndex(void) {
  const uint8 *p = g_ram + SRM_AP_RECEIVED_INDEX;
  return (uint16)(p[0] | (p[1] << 8));
}

EMSCRIPTEN_KEEPALIVE
void WasmSetApReceivedIndex(uint16 n) {
  uint8 *p = g_ram + SRM_AP_RECEIVED_INDEX;
  p[0] = (uint8)n;
  p[1] = (uint8)(n >> 8);
}
