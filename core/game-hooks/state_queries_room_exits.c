/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── Room Exit-to-Overworld Door Positions ───
// Up to 8 exit doors per room. Each entry: [tileCol(1), tileRow(1), direction(1)]
// direction: 0=N, 1=S, 2=W, 3=E
// Sources: dung_exit_door_addresses (ExitToOw type) + regular entrance doors (types 6/10/14).

static uint8 g_exit_doors_buf[2 + 8 * 3];

EMSCRIPTEN_KEEPALIVE
int WasmGetRoomExitDoors(void) {
  if (!NavQueryGate()) {
    memset(g_exit_doors_buf, 0, sizeof(g_exit_doors_buf));
    return (int)g_exit_doors_buf;
  }
  memset(g_exit_doors_buf, 0, sizeof(g_exit_doors_buf));

  if (!player_is_indoors) {
    return (int)g_exit_doors_buf;
  }

  uint8 count = 0;

  // Source 1: Explicit ExitToOw doors (from room door list type 18)
  uint8 num_exits = (uint8)(dung_exit_door_count >> 1);
  if (num_exits > 4) num_exits = 4;
  for (uint8 i = 0; i < num_exits && count < 8; i++) {
    uint16 addr = dung_exit_door_addresses[i];
    if (addr == 0) continue;
    uint16 word_offs = (addr & 0x1FFF) / 2;
    uint8 row = (uint8)(word_offs / 64);
    uint8 col = (uint8)(word_offs % 64);
    uint8 local_row = row % 32;
    uint8 dir;
    if (local_row <= 10) dir = 0;
    else if (local_row >= 22) dir = 1;
    else if (col <= 10) dir = 2;
    else dir = 3;

    int o = 2 + count * 3;
    g_exit_doors_buf[o + 0] = col;
    g_exit_doors_buf[o + 1] = row;
    g_exit_doors_buf[o + 2] = dir;
    count++;
  }

  // Source 2: Entrance-type doors in the regular door array (types 6, 10, 12, 14, 16)
  // These act as exit triggers (get attr 0x8E).
  uint8 num_doors = (uint8)(dung_cur_door_idx >> 1);
  if (num_doors > 16) num_doors = 16;
  for (uint8 i = 0; i < num_doors && count < 8; i++) {
    uint8 type = (uint8)(door_type_and_slot[i] & 0xFE);  // mask odd-variant bit
    if (type != 6 && type != 10 && type != 12 && type != 14 && type != 16) continue;
    uint8 dir = (uint8)(dung_door_direction[i] & 3);
    uint16 addr = dung_door_tilemap_address[i] & 0x1FFF;
    uint8 row = (uint8)(addr / 128);
    uint8 col = (uint8)((addr % 128) / 2);

    int o = 2 + count * 3;
    g_exit_doors_buf[o + 0] = col;
    g_exit_doors_buf[o + 1] = row;
    g_exit_doors_buf[o + 2] = dir;
    count++;
  }

  g_exit_doors_buf[0] = count;
  g_exit_doors_buf[1] = 0;
  return (int)g_exit_doors_buf;
}

// ─── Room Inter-Room Stair Info (destinations + positions from attr table) ───
// Max 4 inter-room stairs per room.
// Each entry: [destRoom(1), tileRow(1), tileCol(1), flags(1)]
// flags: bit 2 = direction (0 up, 4 down, matches attr bit 2), bit 0 = the attr
// PAGE the stair tile was found on (0 = BG2/upper, 1 = BG1/lower) — taking the
// stair deposits the player on that layer, which decides the destination flood's
// start layer (the sewers' Behind-Sanctuary alcove is a BG1 arrival).
// Stair index tiles have attr = 0x30..0x37 where bits 0-1 = stair index, bit 2 = direction.

static uint8 g_room_stairs_buf[2 + 4 * 4];

int WasmBuildRoomAttrGrid(int room_id);  // state_queries_grids.c

// Scan both pages of the attr table for stair index tiles and pair each with
// its header travel destination. The attr table + header must already describe
// the room being queried (live play, or right after WasmBuildRoomAttrGrid).
// Page 0 = upper layer (offset 0), Page 1 = lower layer (offset 0x1000).
static int SimScanRoomStairs(void) {
  uint8 found[4] = {0, 0, 0, 0};
  uint8 count = 0;

  for (int page = 0; page < 2 && count < 4; page++) {
    int base = page * 0x1000;
    for (int pos = 0; pos < 0x1000 && count < 4; pos++) {
      uint8 attr = dung_bg2_attr_table[base + pos];
      if ((attr & 0xF8) != 0x30) continue;

      uint8 stair_idx = attr & 3;
      if (found[stair_idx]) continue;  // already found this stair
      found[stair_idx] = 1;

      uint8 dest = dung_hdr_travel_destinations[stair_idx + 1];
      uint8 row = (uint8)(pos / 64);
      uint8 col = (uint8)(pos % 64);

      int o = 2 + count * 4;
      g_room_stairs_buf[o + 0] = dest;
      g_room_stairs_buf[o + 1] = row;
      g_room_stairs_buf[o + 2] = col;
      g_room_stairs_buf[o + 3] = (uint8)((attr & 4) | page);
      count++;
    }
  }

  g_room_stairs_buf[0] = count;
  g_room_stairs_buf[1] = 0;
  return (int)g_room_stairs_buf;
}

EMSCRIPTEN_KEEPALIVE
int WasmGetRoomStairInfo(void) {
  if (!NavQueryGate()) {
    memset(g_room_stairs_buf, 0, sizeof(g_room_stairs_buf));
    return (int)g_room_stairs_buf;
  }
  memset(g_room_stairs_buf, 0, sizeof(g_room_stairs_buf));

  if (!player_is_indoors) {
    return (int)g_room_stairs_buf;
  }

  return SimScanRoomStairs();
}

// Room-addressable variant: rebuild the target room's attr table + header
// (WasmBuildRoomAttrGrid loads both), then run the same stair scan — so the
// simulator can discover a remote room's staircases without the player being there.
EMSCRIPTEN_KEEPALIVE
int WasmGetRoomStairInfoFor(int room_id) {
  if (!NavQueryGate()) {
    memset(g_room_stairs_buf, 0, sizeof(g_room_stairs_buf));
    return (int)g_room_stairs_buf;
  }
  memset(g_room_stairs_buf, 0, sizeof(g_room_stairs_buf));
  WasmBuildRoomAttrGrid(room_id);
  return (int)g_room_stairs_buf;
}

// ─── Room Travel Destinations (from room header) ───
// Returns the 5 travel destination bytes for the current room.
// [0] = pit/block destination, [1..4] = stair destinations for stair indices 0-3.
// Format: [dest0, dest1, dest2, dest3, dest4]
static uint8 g_travel_dest_buf[5];

EMSCRIPTEN_KEEPALIVE
int WasmGetRoomTravelDestinations(void) {
  if (!NavQueryGate()) {
    memset(g_travel_dest_buf, 0, sizeof(g_travel_dest_buf));
    return (int)g_travel_dest_buf;
  }
  for (int i = 0; i < 5; i++) {
    g_travel_dest_buf[i] = player_is_indoors ? dung_hdr_travel_destinations[i] : 0;
  }
  return (int)g_travel_dest_buf;
}

// Room-addressable variant: load the target room's header, then return its
// 5 travel destination bytes ([0] pit/warp, [1..4] stair/teleport slots —
// warp-room doors teleport to [3] (west) / [4] (east), dungeon.c:2067).
EMSCRIPTEN_KEEPALIVE
int WasmGetRoomTravelDestinationsFor(int room_id) {
  if (!NavQueryGate()) {
    memset(g_travel_dest_buf, 0, sizeof(g_travel_dest_buf));
    return (int)g_travel_dest_buf;
  }
  memset(g_travel_dest_buf, 0, sizeof(g_travel_dest_buf));
  if (room_id < 0 || room_id >= 0x128) return (int)g_travel_dest_buf;
  WasmBuildRoomAttrGrid(room_id);
  return (int)g_travel_dest_buf;
}

// ─── Room Staircase Type (gate variable for layer changes) ───
// Returns the current value of kind_of_in_room_staircase (g_ram+0x44A).
// 0 = intra-room stairs (layer changes allowed + room index shift)
// 1 = layer stairs (layer changes allowed)
// 2 = pseudo/water stairs or none (layer changes BLOCKED)
// Returns -1 if outdoors.

EMSCRIPTEN_KEEPALIVE
int WasmGetStaircaseType(void) {
  if (!NavQueryGate()) return 0;
  if (!player_is_indoors) return -1;
  return *(uint16*)(g_ram + 0x44A);
}

// ─── Room Walk Boundaries (palace toggle doors + open edges) ───
// Up to 4 inter-room walk-through connections per room.
// Each entry: [destRoom(2), tileRow(1), tileCol(1)]
// These are passages where walking through transitions to the adjacent room
// (typically palace context switches like Castle→Sewer).

static uint8 g_walk_bounds_buf[2 + 4 * 4];

// Scan the toggle-palace positions loaded for `room` (live play, or right
// after WasmBuildRoomAttrGrid loaded that room's objects).
static int SimScanWalkBoundaries(uint16 room) {
  uint8 count = 0;
  uint8 num_toggles = (uint8)(dung_num_toggle_palace >> 1);
  if (num_toggles > 4) num_toggles = 4;

  for (uint8 i = 0; i < num_toggles && count < 4; i++) {
    uint16 pos = dung_toggle_palace_pos[i];
    if (pos == 0) continue;

    uint8 row = (uint8)(pos / 64);
    uint8 col = (uint8)(pos % 64);

    // Determine destination room from edge position
    uint16 dest;
    if (row <= 8) dest = room - 16;         // north → room above
    else if (row >= 56) dest = room + 16;   // south → room below
    else if (col <= 8) dest = room - 1;     // west → room left
    else dest = room + 1;                    // east → room right

    int o = 2 + count * 4;
    PutU16(g_walk_bounds_buf, o, dest);
    g_walk_bounds_buf[o + 2] = row;
    g_walk_bounds_buf[o + 3] = col;
    count++;
  }

  g_walk_bounds_buf[0] = count;
  g_walk_bounds_buf[1] = 0;
  return (int)g_walk_bounds_buf;
}

EMSCRIPTEN_KEEPALIVE
int WasmGetRoomWalkBoundaries(void) {
  if (!NavQueryGate()) {
    memset(g_walk_bounds_buf, 0, sizeof(g_walk_bounds_buf));
    return (int)g_walk_bounds_buf;
  }
  memset(g_walk_bounds_buf, 0, sizeof(g_walk_bounds_buf));
  if (!player_is_indoors) return (int)g_walk_bounds_buf;
  return SimScanWalkBoundaries(dungeon_room_index);
}

// Room-addressable room-header TAG bytes ([tag1, tag2]) — the room's scripted
// effects (kill-enemies-to-open-door, switch doors, moving walls, …).
static uint8 g_room_tags_buf[2];

EMSCRIPTEN_KEEPALIVE
int WasmGetRoomTagsFor(int room_id) {
  if (!NavQueryGate()) {
    g_room_tags_buf[0] = g_room_tags_buf[1] = 0;
    return (int)g_room_tags_buf;
  }
  g_room_tags_buf[0] = g_room_tags_buf[1] = 0;
  if (room_id < 0 || room_id >= 0x128) return (int)g_room_tags_buf;
  WasmBuildRoomAttrGrid(room_id);
  return (int)g_room_tags_buf;
}

// Room-addressable variant: rebuild the target room (loads its toggle-palace
// walk-through positions), then run the same scan — remote rooms included.
EMSCRIPTEN_KEEPALIVE
int WasmGetRoomWalkBoundariesFor(int room_id) {
  if (!NavQueryGate()) {
    memset(g_walk_bounds_buf, 0, sizeof(g_walk_bounds_buf));
    return (int)g_walk_bounds_buf;
  }
  memset(g_walk_bounds_buf, 0, sizeof(g_walk_bounds_buf));
  if (room_id < 0 || room_id >= 0x128) return (int)g_walk_bounds_buf;
  WasmBuildRoomAttrGrid(room_id);
  return (int)g_walk_bounds_buf;
}

// Everything a room-addressable query needs that lives in WRAM rather than in the
// returned grid: the stair list, the header's travel destinations, the room tags
// and the walk-through boundaries. WasmBuildRoomAttrGrid puts all of WRAM back
// before it returns, so these have to be taken while the requested room is still
// rendered — read afterwards they describe whichever room the game is physically
// standing in, which for a headless run is wherever the save happened to start.
void SimCaptureRoomHeaderState(void) {
  SimScanRoomStairs();
  for (int i = 0; i < 5; i++) g_travel_dest_buf[i] = dung_hdr_travel_destinations[i];
  g_room_tags_buf[0] = dung_hdr_tag[0];
  g_room_tags_buf[1] = dung_hdr_tag[1];
  SimScanWalkBoundaries(dungeon_room_index);
}
