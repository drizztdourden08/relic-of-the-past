/* @layer core-game-hooks @kind native */
// The online room this file belongs to: a 32-bit hash of the multiworld room's seed name. The
// host writes it the first time the file takes an item from a room, and refuses to deliver when
// a later room's hash differs, so one file never mixes two rooms' received lists. The core only
// stores it, in the hook-owned save bytes (save_bytes.h SRM_AP_ROOM_HASH), so it travels with
// the battery save and with a save state the same way the received index does.
//
// Pure storage with no gate: the game never reads these bytes, so a write changes nothing the
// game computes, and the bytes read as zero (no room yet) on any file the host never touched.
#include "game_hooks_internal.h"
#include "save_bytes.h"

EMSCRIPTEN_KEEPALIVE
uint32 WasmGetApRoomHash(void) {
  const uint8 *p = g_ram + SRM_AP_ROOM_HASH;
  return (uint32)p[0] | ((uint32)p[1] << 8) | ((uint32)p[2] << 16) | ((uint32)p[3] << 24);
}

EMSCRIPTEN_KEEPALIVE
void WasmSetApRoomHash(uint32 hash) {
  uint8 *p = g_ram + SRM_AP_ROOM_HASH;
  p[0] = (uint8)hash;
  p[1] = (uint8)(hash >> 8);
  p[2] = (uint8)(hash >> 16);
  p[3] = (uint8)(hash >> 24);
}
