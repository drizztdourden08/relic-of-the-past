/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── Replacement Tile State (attrs 0x70-0x7F: pot / peg / block / bombable floor) ───
// The high nibble of a BG2 attribute names this family; the low nibble (0-15) is a
// room-local slot index into dung_replacement_tile_state[], which carries the tile's
// real identity: pot (0x1010), hammer peg (0x4040), large block (0x2020), or a
// bombable floor tile. See Dungeon_CheckForAndIDLiftableTile, dungeon.c:5439-5454
// (masks (attr & 0xf0) != 0x70, indexes dung_replacement_tile_state[attr & 0xf]) and
// the push/floor handling around dungeon.c:5568-5577.
// Buffer layout: 16 x uint16, little-endian, one per slot (index = attr & 0xf).

static uint8 g_replacement_tile_state_buf[16 * 2];

EMSCRIPTEN_KEEPALIVE
int WasmGetReplacementTileState(void) {
  memset(g_replacement_tile_state_buf, 0, sizeof(g_replacement_tile_state_buf));
  if (!player_is_indoors) return (int)g_replacement_tile_state_buf;

  for (int i = 0; i < 16; i++) {
    PutU16(g_replacement_tile_state_buf, i * 2, dung_replacement_tile_state[i]);
  }
  return (int)g_replacement_tile_state_buf;
}

// ─── Chest Lock State (attrs 0x58-0x5D) ───
// The low offset (tile - 0x58, range 0-5) indexes dung_chest_locations[], whose high
// bit distinguishes a locked chest (>= 0x8000, needs a small key) from an openable
// one. See the TileBehavior_Chest case in tile_detect.c:410-422.
// Buffer layout: 6 x uint16, little-endian, one per slot (index = tile - 0x58).

static uint8 g_chest_locations_buf[6 * 2];

EMSCRIPTEN_KEEPALIVE
int WasmGetChestLocations(void) {
  memset(g_chest_locations_buf, 0, sizeof(g_chest_locations_buf));
  if (!player_is_indoors) return (int)g_chest_locations_buf;

  for (int i = 0; i < 6; i++) {
    PutU16(g_chest_locations_buf, i * 2, dung_chest_locations[i]);
  }
  return (int)g_chest_locations_buf;
}
