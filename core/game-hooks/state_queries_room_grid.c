/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── Indoor Room Collision Grid (room-addressable) ───
// Rebuilds any dungeon room's 64×64 collision attr grid from ROM data, for rooms the
// player is not standing in. The room the player DOES occupy must be read live instead
// (WasmGetIndoorAttrTable): its tables carry runtime state no rebuild can reproduce.

// Whole-WRAM backup for the rebuild, plus private copies of everything it produces.
static uint8 g_nav_room_ram_backup[sizeof(g_ram)];
static uint8 g_nav_room_grid[0x2000];
// [count][pad] then per entry: [posLo, posHi, row, col]
static uint8 g_toggle_floor_debug[2 + 16 * 4];

/**
 * Snapshot the toggle-floor positions the rebuild just produced.
 *
 * Must run before WRAM is restored: dung_toggle_floor_pos belongs to the room that was
 * just drawn, and the restore puts the live room's values back.
 */
void SimCaptureRoomHeaderState(void);  // state_queries_room_exits.c

static void CaptureToggleFloorPositions(void) {
  uint8 count = (uint8)(dung_num_toggle_floor >> 1);
  if (count > 16) count = 16;
  g_toggle_floor_debug[0] = count;
  g_toggle_floor_debug[1] = 0;
  for (uint8 i = 0; i < count; i++) {
    uint16 pos = dung_toggle_floor_pos[i];
    PutU16(g_toggle_floor_debug, 2 + i * 4, pos);
    g_toggle_floor_debug[2 + i * 4 + 2] = (uint8)(pos / 64);  // row
    g_toggle_floor_debug[2 + i * 4 + 3] = (uint8)(pos % 64);  // col
  }
}

EMSCRIPTEN_KEEPALIVE
int WasmBuildRoomAttrGrid(int room_id) {
  // Building a room is a WRITE, not a read: Dungeon_LoadRoom and the attribute loaders
  // draw into the very tilemap and collision tables the running game walks on, and they
  // reach much further than the room being drawn: room header fields, object and torch
  // lists, the session-wide pushed-block record, the draw cursors. Anything they leave
  // behind is a live-state bug: re-stamped door attrs strand the player inside a doorway,
  // and a re-stamped object list puts a lifted pot's collision back over the switch under
  // it. Enumerating those fields by hand is a losing game, so snapshot all of WRAM and
  // put it back. Every global here is a view into g_ram, so one memcpy covers the lot.
  memcpy(g_nav_room_ram_backup, g_ram, sizeof(g_ram));

  // Set target room
  dungeon_room_index = (uint16)room_id;

  // Clear the tilemap. dung_bg1 IS dung_bg2 + 0x1000 entries (the same way
  // dung_bg1_attr_table is dung_bg2_attr_table + 0x1000), so this one clear covers both
  // layers; a second clear through dung_bg1 would run 0x2000 bytes past the end.
  memset(dung_bg2, 0, 0x2000 * 2);

  // Clear attr tables (0x1000 upper + 0x1000 lower)
  memset(dung_bg2_attr_table, 0, 0x2000);

  // Initialize dung_torch_data with 0xFF so the torch search loop terminates
  // immediately (it loops until it finds 0xFFFF terminator)
  memset(&dung_torch_data[0], 0xFF, 0x120);

  // Initialize movable_block_datas room fields to 0xFFFF (no matches)
  for (int i = 0; i < 0x18C / 4; i++) {
    movable_block_datas[i].room = 0xFFFF;
  }

  // Build the room tilemap (draws tiles into dung_bg2/bg1)
  Dungeon_LoadRoom();

  // Load BASE tile attributes (entries 0x000-0x13F, 0x1C0-0x1FF)
  Init_LoadDefaultTileAttr();

  // Load custom tile attributes for this room's theme (entries 0x140-0x1BF)
  Dungeon_LoadCustomTileAttr();

  // Build collision attribute table from tilemap
  dung_draw_width_indicator = 0;
  dung_draw_height_indicator = 0;
  overworld_map_state = 0;
  Dungeon_LoadBasicAttribute_full(0x1000);

  // Apply object and door collision overrides
  Dungeon_LoadObjectAttribute();
  Dungeon_LoadDoorAttribute();

  // Mirrors Dungeon_LoadAttributeTable: with the barrier switched, the two barrier
  // colours swap which one is solid. Without this a rebuilt room reports the wrong
  // side passable.
  if (orange_blue_barrier_state)
    Dungeon_FlipCrystalPegAttribute();

  // Shutter doors: the game opens them at RUNTIME via the room's kill tag
  // (Dungeon_OpenShutterDoors), which this headless rebuild never runs, and a
  // shutter's far-side draw slot (k >= 8) checks its RAW slot bit, which SRAM
  // can never carry. Mirror the runtime rule here: when a shutter's door-list
  // slot (k & 7) reads open, force its draw slot open and restamp its attrs,
  // so BOTH trigger strips of an opened shutter become walkable transits.
  {
    uint16 open_bits = dung_door_opened_incl_adjacent;
    for (int k = 0; k < 16; k++) {
      if (!dung_door_tilemap_address[k]) continue;
      uint8 t = (uint8)(door_type_and_slot[k] & 0xfe);
      int is_shutter = (t == 0x18 || t == 0x32 || t == 0x36 || t == 0x38 || t == 0x44);
      if (!is_shutter || !(open_bits & kUpperBitmasks[k & 7])) continue;
      dung_door_opened_incl_adjacent |= kUpperBitmasks[k];
      Dungeon_LoadSingleDoorAttribute(k);
    }
    dung_door_opened_incl_adjacent = open_bits;
  }

  // Take everything out before the restore, and return the copy. Returning
  // dung_bg2_attr_table would hand back memory we are about to overwrite, and would alias
  // the live-room reader (WasmGetIndoorAttrTable) that points at the same address.
  CaptureToggleFloorPositions();
  SimCaptureRoomHeaderState();
  memcpy(g_nav_room_grid, dung_bg2_attr_table, sizeof(g_nav_room_grid));
  memcpy(g_ram, g_nav_room_ram_backup, sizeof(g_ram));

  // Caller reads 64×64 from ptr, +0x1000 for the lower layer.
  return (int)g_nav_room_grid;
}

// Debug: the toggle-floor positions captured by the last WasmBuildRoomAttrGrid.
EMSCRIPTEN_KEEPALIVE
int WasmGetToggleFloorPositions(void) {
  return (int)g_toggle_floor_debug;
}
