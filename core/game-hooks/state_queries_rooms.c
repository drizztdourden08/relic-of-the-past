/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── Room Layout Info (for intra-room screen boundaries) ───

static uint8 g_room_layout_buf[8];

EMSCRIPTEN_KEEPALIVE
int WasmGetRoomLayoutInfo(void) {
  // Returns: [layout(1), quadrant_fullsize_x(1), quadrant_fullsize_y(1),
  //           link_quadrant_x(1), link_quadrant_y(1), pad(3)]
  // layout byte = dung_layout_and_starting_quadrant (bits 7..2 = layout, bits 1..0 = start quadrant)
  if (!player_is_indoors) {
    memset(g_room_layout_buf, 0, sizeof(g_room_layout_buf));
    return (int)g_room_layout_buf;
  }
  g_room_layout_buf[0] = (uint8)(dung_layout_and_starting_quadrant >> 2); // layout index 0-7
  g_room_layout_buf[1] = quadrant_fullsize_x;  // 0=normal, 2=merged (blastwall destroyed)
  g_room_layout_buf[2] = quadrant_fullsize_y;  // 0=normal, 2=merged
  g_room_layout_buf[3] = link_quadrant_x;      // 0 or 1
  g_room_layout_buf[4] = link_quadrant_y;      // 0 or 2
  g_room_layout_buf[5] = 0;
  g_room_layout_buf[6] = 0;
  g_room_layout_buf[7] = 0;
  return (int)g_room_layout_buf;
}

// ─── Dungeon Map Position (room's position in the 5x5 dungeon map grid) ───

// Floor count table per palace (palace index 0–13):
// Low nibble = number of basement floors, bits 4-7 = number of above-ground floors
static const uint16 kDungFloorInfo[14] = {0x21, 0x23, 0x20, 0x21, 0x70, 0x12, 0x11, 0x212, 2, 0x217, 0x160, 0x12, 0x113, 0x171};

// Room substitution table for map display (some rooms alias to others)
static const uint16 kDungMapRoomSubst_From[3] = {137, 167, 79};
static const uint16 kDungMapRoomSubst_To[3] = {169, 119, 190};

static uint8 g_dungmap_pos_buf[12];

EMSCRIPTEN_KEEPALIVE
int WasmGetDungeonMapPosition(void) {
  // Returns: [mapCol(1), mapRow(1), floorIndex(1), numAboveFloors(1), numBasementFloors(1), found(1),
  //           effWidth(1), effHeight(1), originCol(1), originRow(1), pad(2)]
  // mapCol/mapRow: top-left position of the room in the 5x5 dungeon map grid
  // effWidth/effHeight: how many cells this room occupies (bounding box) in the map grid
  // originCol/originRow: same as mapCol/mapRow (top-left of the bounding box)
  memset(g_dungmap_pos_buf, 0, sizeof(g_dungmap_pos_buf));

  if (!player_is_indoors) {
    return (int)g_dungmap_pos_buf;
  }

  uint8 palace = (uint8)(cur_palace_index_x2 >> 1);
  if (palace >= 14) {
    // Cave/House (0xFF palace) - no dungeon map
    return (int)g_dungmap_pos_buf;
  }

  uint16 floorInfo = kDungFloorInfo[palace];
  uint8 numBasement = (uint8)(floorInfo & 0xF);
  uint8 numAbove = (uint8)((floorInfo >> 4) & 0xF);
  uint8 floorIdx = (uint8)(numBasement + dung_cur_floor); // index into layout array

  // Get room, applying substitutions
  uint16 room = dungeon_room_index;
  for (int i = 0; i < 3; i++) {
    if (room == kDungMapRoomSubst_From[i])
      room = kDungMapRoomSubst_To[i];
  }

  // Scan the floor layout (5x5 grid) for ALL cells occupied by this room
  const uint8 *layout = GetDungmapFloorLayout();
  const uint8 *floorGrid = &layout[floorIdx * 25];
  uint8 found = 0;
  uint8 minCol = 4, maxCol = 0, minRow = 4, maxRow = 0;
  for (int i = 0; i < 25; i++) {
    if (floorGrid[i] == (uint8)room) {
      uint8 c = (uint8)(i % 5);
      uint8 r = (uint8)(i / 5);
      if (!found || c < minCol) minCol = c;
      if (!found || c > maxCol) maxCol = c;
      if (!found || r < minRow) minRow = r;
      if (!found || r > maxRow) maxRow = r;
      found = 1;
    }
  }

  if (found) {
    g_dungmap_pos_buf[0] = minCol;
    g_dungmap_pos_buf[1] = minRow;
    g_dungmap_pos_buf[6] = (uint8)(maxCol - minCol + 1); // effective width
    g_dungmap_pos_buf[7] = (uint8)(maxRow - minRow + 1); // effective height
    g_dungmap_pos_buf[8] = minCol; // origin col (same as mapCol)
    g_dungmap_pos_buf[9] = minRow; // origin row (same as mapRow)
  }

  g_dungmap_pos_buf[2] = dung_cur_floor;
  g_dungmap_pos_buf[3] = numAbove;
  g_dungmap_pos_buf[4] = numBasement;
  g_dungmap_pos_buf[5] = found;
  g_dungmap_pos_buf[10] = 0;
  g_dungmap_pos_buf[11] = 0;
  return (int)g_dungmap_pos_buf;
}

// ─── Room Door Boundary Tiles (decoded door positions for flood fill) ───
// Max 16 doors per room. Each entry: [direction(1), tileCol(1), tileRow(1), doorType(1), isOpen(1)]
// direction: 0=N, 1=S, 2=W, 3=E
// For N/S doors: tileCol is the leftmost column of the 4-tile-wide opening
// For W/E doors: tileRow is the topmost row of the 4-tile-tall opening

static uint8 g_room_doors_buf[2 + 16 * 5];

EMSCRIPTEN_KEEPALIVE
int WasmGetRoomDoorBoundaryTiles(void) {
  memset(g_room_doors_buf, 0, sizeof(g_room_doors_buf));

  if (!player_is_indoors) {
    return (int)g_room_doors_buf;
  }

  // dung_cur_door_idx holds 2× the number of doors loaded for the current room.
  uint8 num_doors = (uint8)(dung_cur_door_idx >> 1);
  if (num_doors > 16) num_doors = 16;

  uint8 count = 0;
  for (uint8 i = 0; i < num_doors; i++) {
    uint8 dir = (uint8)(dung_door_direction[i] & 3);
    uint8 type = (uint8)(door_type_and_slot[i] & 0xFE);  // mask off slot bit (bit 0)

    // Decode tilemap address → row/col
    // Address is byte offset into 128-byte-wide tilemap.
    // Strip 0x2000 priority flag. Bit 12 (0x1000) indicates second page (lower/right screen).
    uint16 addr = dung_door_tilemap_address[i] & 0x1FFF;
    uint8 row = (uint8)(addr / 128);
    uint8 col = (uint8)((addr % 128) / 2);

    // Check if this door is currently open
    uint8 is_open = 0;
    if (i < 4) {
      // First 4 doors use dung_door_opened bitmask (bits 12-15)
      is_open = (dung_door_opened & (0x1000 << i)) ? 1 : 0;
    }
    // Type 0 (regular/open) and type 0x30 (regular2) are always passable
    if (type == 0 || type == 0x30) is_open = 1;

    int o = 2 + count * 5;
    g_room_doors_buf[o + 0] = dir;
    g_room_doors_buf[o + 1] = col;
    g_room_doors_buf[o + 2] = row;
    g_room_doors_buf[o + 3] = type;
    g_room_doors_buf[o + 4] = is_open;
    count++;
  }

  g_room_doors_buf[0] = count;
  g_room_doors_buf[1] = 0;
  return (int)g_room_doors_buf;
}
