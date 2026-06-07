/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── Inventory State Query ───

static uint8 g_inventory_buf[40];

EMSCRIPTEN_KEEPALIVE
int WasmGetInventoryState(void) {
  g_inventory_buf[0]  = link_item_bow;
  g_inventory_buf[1]  = link_item_boomerang;
  g_inventory_buf[2]  = link_item_hookshot;
  g_inventory_buf[3]  = link_item_bombs;
  g_inventory_buf[4]  = link_item_mushroom;
  g_inventory_buf[5]  = link_item_fire_rod;
  g_inventory_buf[6]  = link_item_ice_rod;
  g_inventory_buf[7]  = link_item_bombos_medallion;
  g_inventory_buf[8]  = link_item_ether_medallion;
  g_inventory_buf[9]  = link_item_quake_medallion;
  g_inventory_buf[10] = link_item_torch;
  g_inventory_buf[11] = link_item_hammer;
  g_inventory_buf[12] = link_item_flute;
  g_inventory_buf[13] = link_item_bug_net;
  g_inventory_buf[14] = link_item_book_of_mudora;
  g_inventory_buf[15] = link_item_cane_somaria;
  g_inventory_buf[16] = link_item_cane_byrna;
  g_inventory_buf[17] = link_item_cape;
  g_inventory_buf[18] = link_item_mirror;
  g_inventory_buf[19] = link_item_gloves;
  g_inventory_buf[20] = link_item_boots;
  g_inventory_buf[21] = link_item_flippers;
  g_inventory_buf[22] = link_item_moon_pearl;
  g_inventory_buf[23] = link_sword_type;
  g_inventory_buf[24] = link_shield_type;
  g_inventory_buf[25] = link_armor;
  g_inventory_buf[26] = link_bottle_info[0];
  g_inventory_buf[27] = link_bottle_info[1];
  g_inventory_buf[28] = link_bottle_info[2];
  g_inventory_buf[29] = link_bottle_info[3];
  g_inventory_buf[30] = link_which_pendants;
  g_inventory_buf[31] = link_has_crystals;
  g_inventory_buf[32] = link_heart_pieces;
  g_inventory_buf[33] = link_health_capacity;
  return (int)g_inventory_buf;
}

// ─── Room Flags Query ───

EMSCRIPTEN_KEEPALIVE
int WasmGetRoomFlags(void) {
  return (int)save_dung_info;
}

// ─── Live Room Flags Query ───

static uint8 live_room_buf[4];

EMSCRIPTEN_KEEPALIVE
int WasmGetLiveRoomFlags(void) {
  uint16 room = dungeon_room_index;
  uint16 flags = dung_savegame_state_bits >> 4;
  live_room_buf[0] = room & 0xFF;
  live_room_buf[1] = (room >> 8) & 0xFF;
  live_room_buf[2] = flags & 0xFF;
  live_room_buf[3] = (flags >> 8) & 0xFF;
  return (int)live_room_buf;
}

// ─── Overworld Event Flags Query ───

EMSCRIPTEN_KEEPALIVE
int WasmGetOverworldFlags(void) {
  return (int)save_ow_event_info;
}

// ─── Progress Flags Query ───

static uint8 g_progress_buf[16];

EMSCRIPTEN_KEEPALIVE
int WasmGetProgressFlags(void) {
  g_progress_buf[0] = sram_progress_indicator;
  g_progress_buf[1] = sram_progress_flags;
  g_progress_buf[2] = sram_progress_indicator_3;
  g_progress_buf[3] = link_item_flippers;
  g_progress_buf[4] = link_item_boots;
  g_progress_buf[5] = link_item_bug_net;
  g_progress_buf[6] = link_item_mirror;
  g_progress_buf[7] = link_item_quake_medallion;
  g_progress_buf[8] = link_magic_consumption;
  g_progress_buf[9] = (uint8)(save_dung_info[0x109]);
  g_progress_buf[10] = (uint8)(save_dung_info[0x123]);
  g_progress_buf[11] = (uint8)(save_dung_info[0x11E]);
  g_progress_buf[12] = player_sleep_in_bed_state;
  return (int)g_progress_buf;
}

// ─── Viewport Info ───

static uint8 g_viewport_buf[20];

EMSCRIPTEN_KEEPALIVE
int WasmGetViewportInfo(void) {
  g_viewport_buf[0] = main_module_index;
  g_viewport_buf[1] = submodule_index;
  g_viewport_buf[2] = g_zenv.ppu->extraLeftRight;
  g_viewport_buf[3] = g_zenv.ppu->extraLeftCur;
  g_viewport_buf[4] = g_zenv.ppu->extraRightCur;
  g_viewport_buf[5] = g_zenv.ppu->extraBottomCur;
  uint16 w = (uint16)(g_config.extended_aspect_ratio * 2 + 256);
  uint16 h = g_config.extend_y ? 240 : 224;
  g_viewport_buf[6] = w & 0xFF;
  g_viewport_buf[7] = (w >> 8) & 0xFF;
  g_viewport_buf[8] = h & 0xFF;
  g_viewport_buf[9] = (h >> 8) & 0xFF;

  // locationModule: the player's physical location regardless of UI overlays.
  // Modules 14 (text/menu), 15 (spotlight close), 16 (spotlight open) are transient
  // overlays — the player hasn't moved, so report saved_module_for_menu instead.
  // Guard: if saved_module_for_menu is 0 while in module 14, this is a real menu
  // screen (file select etc), not a gameplay overlay — report the actual module.
  uint8 mod = main_module_index;
  if ((mod == 14 || mod == 15 || mod == 16) && saved_module_for_menu != 0) {
    g_viewport_buf[10] = saved_module_for_menu;
  } else {
    g_viewport_buf[10] = mod;
  }

  // locationType: 0=overworld/other, 1=house/cave, 2=dungeon
  uint8 locMod = g_viewport_buf[10];
  g_viewport_buf[11] = (locMod == 7) ? (cur_palace_index_x2 == 0xff ? 1 : 2) : 0;

  // Camera world position (BG2 scroll = top-left of viewport in world coords)
  uint16 camX = BG2HOFS_copy2;
  uint16 camY = BG2VOFS_copy2;
  g_viewport_buf[12] = camX & 0xFF;
  g_viewport_buf[13] = (camX >> 8) & 0xFF;
  g_viewport_buf[14] = camY & 0xFF;
  g_viewport_buf[15] = (camY >> 8) & 0xFF;

  // Link's world position
  uint16 lx = link_x_coord;
  uint16 ly = link_y_coord;
  g_viewport_buf[16] = lx & 0xFF;
  g_viewport_buf[17] = (lx >> 8) & 0xFF;
  g_viewport_buf[18] = ly & 0xFF;
  g_viewport_buf[19] = (ly >> 8) & 0xFF;
  return (int)g_viewport_buf;
}

// ─── Indoor Collision Attr Table ───

EMSCRIPTEN_KEEPALIVE
int WasmGetIndoorAttrTable(void) {
  // 0x0000..0x0FFF = upper layer attrs, 0x1000..0x1FFF = lower layer attrs
  return (int)dung_bg2_attr_table;
}

EMSCRIPTEN_KEEPALIVE
int WasmGetLinkIsOnLowerLevel(void) {
  return link_is_on_lower_level ? 1 : 0;
}

EMSCRIPTEN_KEEPALIVE
int WasmGetRoomCollisionType(void) {
  if (!player_is_indoors) return -1;
  return (int)dung_hdr_collision;
}

// Headless-safe: read collision type directly from ROM header for any room
EMSCRIPTEN_KEEPALIVE
int WasmGetRoomCollisionTypeForRoom(int room_id) {
  if (room_id < 0 || room_id > 0x127) return -1;
  const uint8 *hdr = GetRoomHeaderPtr(room_id);
  return (int)((hdr[0] >> 2) & 7);
}

// ─── Indoor Dynamic Blockers (Early-game Uncle) ───

static uint8 g_indoor_uncle_blockers_buf[1 + 2 * 4];

EMSCRIPTEN_KEEPALIVE
int WasmGetIndoorUncleBlockers(void) {
  // Buffer format:
  // [0] = count (0..2)
  // then per entry 4 bytes: xLo, xHi, yLo, yHi
  g_indoor_uncle_blockers_buf[0] = 0;
  if (!player_is_indoors)
    return (int)g_indoor_uncle_blockers_buf;

  uint8 count = 0;
  for (int k = 15; k >= 0 && count < 2; k--) {
    if (!sprite_state[k])
      continue;
    if (sprite_type[k] != 0x73)
      continue; // UncleAndPriest family
    if (sprite_E[k] != 0)
      continue; // only Uncle variant, not priest/mantle

    int o = 1 + count * 4;
    g_indoor_uncle_blockers_buf[o + 0] = sprite_x_lo[k];
    g_indoor_uncle_blockers_buf[o + 1] = sprite_x_hi[k];
    g_indoor_uncle_blockers_buf[o + 2] = sprite_y_lo[k];
    g_indoor_uncle_blockers_buf[o + 3] = sprite_y_hi[k];
    count++;
  }

  g_indoor_uncle_blockers_buf[0] = count;
  return (int)g_indoor_uncle_blockers_buf;
}

static uint8 g_nav_blockers_buf[1 + 16 * 4];

static bool IsOverworldGuardBlockerType(uint8 type) {
  switch (type) {
    case 0x3F: // Tutorial guard/barrier
    case 0x40: // Tutorial guard/barrier
    case 0x41: // Blue guard
    case 0x45: // Spear trooper
    case 0x46: // Blue archer
    case 0x47: // Green bush guard
    case 0x48: // Red javelin guard
    case 0x49: // Red bush guard
    case 0x4A: // Bomb guard
    case 0x4B: // Green knife guard
      return true;
    default:
      return false;
  }
}

EMSCRIPTEN_KEEPALIVE
int WasmGetNavigationBlockers(void) {
  // Buffer format:
  // [0] = count (0..16)
  // then per entry 4 bytes: xLo, xHi, yLo, yHi
  g_nav_blockers_buf[0] = 0;

  uint8 count = 0;
  for (int k = 15; k >= 0 && count < 16; k--) {
    if (!sprite_state[k])
      continue;

    bool include = false;
    const uint8 type = sprite_type[k];

    if (player_is_indoors) {
      // Uncle blocks paths in house/passage until sequence progression.
      if (type == 0x73 && sprite_E[k] == 0) {
        include = true;
      }
    } else {
      // Overworld guard/NPC bodies can physically gate routes.
      if (IsOverworldGuardBlockerType(type)) {
        include = true;
      }
    }

    if (!include)
      continue;

    int o = 1 + count * 4;
    g_nav_blockers_buf[o + 0] = sprite_x_lo[k];
    g_nav_blockers_buf[o + 1] = sprite_x_hi[k];
    g_nav_blockers_buf[o + 2] = sprite_y_lo[k];
    g_nav_blockers_buf[o + 3] = sprite_y_hi[k];
    count++;
  }

  g_nav_blockers_buf[0] = count;
  return (int)g_nav_blockers_buf;
}

static uint8 g_live_sprites_buf[1 + 16 * 10];
static uint8 g_overworld_guard_spawns_buf[1 + 16 * 4];

EMSCRIPTEN_KEEPALIVE
int WasmGetLiveSprites(void) {
  // Buffer format:
  // [0] = count (0..16)
  // per sprite (10 bytes):
  // [0] slot, [1] type, [2] state, [3] subtype, [4] subtype2, [5] sprite_E,
  // [6] xLo, [7] xHi, [8] yLo, [9] yHi
  g_live_sprites_buf[0] = 0;

  uint8 count = 0;
  for (int k = 15; k >= 0 && count < 16; k--) {
    if (!sprite_state[k])
      continue;

    int o = 1 + count * 10;
    g_live_sprites_buf[o + 0] = (uint8)k;
    g_live_sprites_buf[o + 1] = sprite_type[k];
    g_live_sprites_buf[o + 2] = sprite_state[k];
    g_live_sprites_buf[o + 3] = sprite_subtype[k];
    g_live_sprites_buf[o + 4] = sprite_subtype2[k];
    g_live_sprites_buf[o + 5] = sprite_E[k];
    g_live_sprites_buf[o + 6] = sprite_x_lo[k];
    g_live_sprites_buf[o + 7] = sprite_x_hi[k];
    g_live_sprites_buf[o + 8] = sprite_y_lo[k];
    g_live_sprites_buf[o + 9] = sprite_y_hi[k];
    count++;
  }

  g_live_sprites_buf[0] = count;
  return (int)g_live_sprites_buf;
}

// ─── Navigation Grid Exports ───
// These build 64×64 collision attr grids on demand for any screen/room.
// Used by the unified navigation engine (same code path: widget + offline).

static uint8 g_nav_overworld_grid[64 * 64];

EMSCRIPTEN_KEEPALIVE
int WasmBuildOverworldAttrGrid(int screen_idx) {
  // Use a 64-wide uint16 buffer (stride matches what DecompressAndDrawOneQuadrant expects).
  // The function writes 32×32 Map16 tile IDs with row stride 64.
  static uint16 nav_map16_buf[64 * 32];

  map16_decode_last = 0xffff;
  Overworld_DecompressAndDrawOneQuadrant(nav_map16_buf, screen_idx);

  // Convert 32×32 Map16 → 64×64 collision attrs
  const uint16 *map16ToMap8 = GetMap16toMap8Table();
  const uint8 *map8ToAttr = GetMap8toTileAttr();

  for (int row16 = 0; row16 < 32; row16++) {
    for (int col16 = 0; col16 < 32; col16++) {
      uint16 tile16 = nav_map16_buf[row16 * 64 + col16];
      int base = tile16 * 4;
      int gr = row16 * 2, gc = col16 * 2;

      uint16 m8_tl = map16ToMap8[base + 0];
      uint16 m8_tr = map16ToMap8[base + 1];
      uint16 m8_bl = map16ToMap8[base + 2];
      uint16 m8_br = map16ToMap8[base + 3];

      uint8 a_tl = map8ToAttr[m8_tl & 0x1FF];
      uint8 a_tr = map8ToAttr[m8_tr & 0x1FF];
      uint8 a_bl = map8ToAttr[m8_bl & 0x1FF];
      uint8 a_br = map8ToAttr[m8_br & 0x1FF];

      // Propagate priority bit for deep grass/water (0x10..0x1B range)
      if (a_tl >= 0x10 && a_tl < 0x1C) a_tl |= (m8_tl >> 14) & 1;
      if (a_tr >= 0x10 && a_tr < 0x1C) a_tr |= (m8_tr >> 14) & 1;
      if (a_bl >= 0x10 && a_bl < 0x1C) a_bl |= (m8_bl >> 14) & 1;
      if (a_br >= 0x10 && a_br < 0x1C) a_br |= (m8_br >> 14) & 1;

      g_nav_overworld_grid[(gr + 0) * 64 + gc + 0] = a_tl;
      g_nav_overworld_grid[(gr + 0) * 64 + gc + 1] = a_tr;
      g_nav_overworld_grid[(gr + 1) * 64 + gc + 0] = a_bl;
      g_nav_overworld_grid[(gr + 1) * 64 + gc + 1] = a_br;
    }
  }

  return (int)g_nav_overworld_grid;
}

EMSCRIPTEN_KEEPALIVE
int WasmBuildRoomAttrGrid(int room_id) {
  // Save state that Dungeon_LoadRoom touches
  uint16 saved_room = dungeon_room_index;

  // Set target room
  dungeon_room_index = (uint16)room_id;

  // Clear tilemap buffers (Dungeon_LoadRoom draws into these)
  memset(dung_bg2, 0, 0x2000 * 2);  // 64×64 uint16
  memset(dung_bg1, 0, 0x2000 * 2);

  // Clear attr tables
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

  // Restore
  dungeon_room_index = saved_room;

  // Return pointer to the attr table (caller reads 64×64 from ptr, +0x1000 for lower layer)
  return (int)dung_bg2_attr_table;
}

// Debug: get layer toggle door positions populated during WasmBuildRoomAttrGrid
static uint8 g_toggle_floor_debug[2 + 16 * 4];  // [count][pad] then per entry: [posLo, posHi, row, col]
EMSCRIPTEN_KEEPALIVE
int WasmGetToggleFloorPositions(void) {
  uint8 count = (uint8)(dung_num_toggle_floor >> 1);
  if (count > 16) count = 16;
  g_toggle_floor_debug[0] = count;
  g_toggle_floor_debug[1] = 0;
  for (uint8 i = 0; i < count; i++) {
    uint16 pos = dung_toggle_floor_pos[i];
    g_toggle_floor_debug[2 + i * 4 + 0] = (uint8)(pos & 0xFF);
    g_toggle_floor_debug[2 + i * 4 + 1] = (uint8)(pos >> 8);
    g_toggle_floor_debug[2 + i * 4 + 2] = (uint8)(pos / 64);  // row
    g_toggle_floor_debug[2 + i * 4 + 3] = (uint8)(pos % 64);  // col
  }
  return (int)g_toggle_floor_debug;
}

EMSCRIPTEN_KEEPALIVE
int WasmGetOverworldGuardSpawns(void) {
  // Buffer format:
  // [0] = count (0..16)
  // then per entry 4 bytes: xLo, xHi, yLo, yHi
  g_overworld_guard_spawns_buf[0] = 0;

  if (player_is_indoors)
    return (int)g_overworld_guard_spawns_buf;

  // The overworld engine proximity-loads sprites into sprite_state[].
  // For flood-fill we also need static guard spawn locations even when unloaded.
  uint8 count = 0;
  const uint8 base_x_hi = HIBYTE(sprcoll_x_base);
  const uint8 base_y_hi = HIBYTE(sprcoll_y_base);
  const uint8 chunks_x = (uint8)(sprcoll_x_size >> 8);
  const uint8 chunks_y = (uint8)(sprcoll_y_size >> 8);

  for (uint8 cy = 0; cy < chunks_y && count < 16; cy++) {
    for (uint8 cx = 0; cx < chunks_x && count < 16; cx++) {
      const uint8 r1 = (uint8)(cy * 4 + cx);
      for (uint16 cell = 0; cell < 256 && count < 16; cell++) {
        const uint16 blk = ((uint16)r1 << 8) | cell;
        const uint8 spawn = sprite_where_in_overworld[blk];
        if (!spawn || spawn >= 0xF4)
          continue; // empty / overlord

        const uint8 type = (uint8)(spawn - 1);
        if (type != 0x3F && type != 0x40)
          continue;

        const uint8 x_lo = (uint8)((blk << 4) & 0xF0);
        const uint8 y_lo = (uint8)(blk & 0xF0);
        const uint8 x_hi = (uint8)((blk >> 8 & 3) + base_x_hi);
        const uint8 y_hi = (uint8)((blk >> 10) + base_y_hi);

        int o = 1 + count * 4;
        g_overworld_guard_spawns_buf[o + 0] = x_lo;
        g_overworld_guard_spawns_buf[o + 1] = x_hi;
        g_overworld_guard_spawns_buf[o + 2] = y_lo;
        g_overworld_guard_spawns_buf[o + 3] = y_hi;
        count++;
      }
    }
  }

  g_overworld_guard_spawns_buf[0] = count;
  return (int)g_overworld_guard_spawns_buf;
}

// ─── Navigation Table Exports ───
// Expose static game tables for the navigation system (entrance positions,
// exit mapping, area heads, entrance→room mapping).

// Overworld entrances: area(u16) + pos(u16) + id(u8) per entry, count prefix.
// 129 entries max → 2 + 129*5 = 647 bytes.
static uint8 g_ow_entrances_buf[2 + 129 * 5];

EMSCRIPTEN_KEEPALIVE
int WasmGetOverworldEntrances(void) {
  uint16 count = kOverworld_Entrance_Area_SIZE / 2;
  if (count > 129) count = 129;
  g_ow_entrances_buf[0] = count & 0xFF;
  g_ow_entrances_buf[1] = (count >> 8) & 0xFF;
  for (uint16 i = 0; i < count; i++) {
    int o = 2 + i * 5;
    uint16 area = kOverworld_Entrance_Area[i];
    uint16 pos  = kOverworld_Entrance_Pos[i];
    uint8  id   = kOverworld_Entrance_Id[i];
    g_ow_entrances_buf[o + 0] = area & 0xFF;
    g_ow_entrances_buf[o + 1] = (area >> 8) & 0xFF;
    g_ow_entrances_buf[o + 2] = pos & 0xFF;
    g_ow_entrances_buf[o + 3] = (pos >> 8) & 0xFF;
    g_ow_entrances_buf[o + 4] = id;
  }
  return (int)g_ow_entrances_buf;
}

// Fall holes: area(u16) + pos(u16) + entranceId(u8) per entry, count prefix.
// 19 entries max → 2 + 19*5 = 97 bytes.
static uint8 g_fall_holes_buf[2 + 19 * 5];

EMSCRIPTEN_KEEPALIVE
int WasmGetFallHoles(void) {
  uint16 count = kFallHole_Area_SIZE / 2;
  if (count > 19) count = 19;
  g_fall_holes_buf[0] = count & 0xFF;
  g_fall_holes_buf[1] = (count >> 8) & 0xFF;
  for (uint16 i = 0; i < count; i++) {
    int o = 2 + i * 5;
    uint16 area = kFallHole_Area[i];
    uint16 pos  = kFallHole_Pos[i];
    uint8  eid  = kFallHole_Entrances[i];
    g_fall_holes_buf[o + 0] = area & 0xFF;
    g_fall_holes_buf[o + 1] = (area >> 8) & 0xFF;
    g_fall_holes_buf[o + 2] = pos & 0xFF;
    g_fall_holes_buf[o + 3] = (pos >> 8) & 0xFF;
    g_fall_holes_buf[o + 4] = eid;
  }
  return (int)g_fall_holes_buf;
}

// Area heads: fixed 64-byte array (kOverworldAreaHeads).
// Duplicated here because it's static const in overworld.c.
static const uint8 g_area_heads[64] = {
  0,  0,  2,  3,  3,  5,  5,  7,
  0,  0, 10,  3,  3,  5,  5, 15,
  16, 17, 18, 19, 20, 21, 22, 23,
  24, 24, 26, 27, 27, 29, 30, 30,
  24, 24, 34, 27, 27, 37, 30, 30,
  40, 41, 42, 43, 44, 45, 46, 47,
  48, 48, 50, 51, 52, 53, 53, 55,
  48, 48, 58, 59, 60, 53, 53, 63,
};

// Exit screen map: roomId(u16) + screenIndex(u8) per entry, count prefix.
// Max ~79 exits → 2 + 79*3 = 239 bytes. Use 128 for safety.
static uint8 g_exit_screen_buf[2 + 128 * 3];

EMSCRIPTEN_KEEPALIVE
int WasmGetExitScreenMap(void) {
  uint16 count = kExitData_ScreenIndex_SIZE;
  if (count > 128) count = 128;
  g_exit_screen_buf[0] = count & 0xFF;
  g_exit_screen_buf[1] = (count >> 8) & 0xFF;
  for (uint16 i = 0; i < count; i++) {
    int o = 2 + i * 3;
    uint16 room = kExitDataRooms[i];
    uint8  scr  = kExitData_ScreenIndex[i];
    // For big screens, resolve area head to correct sub-screen using exit coordinates
    if (scr < 64 && g_area_heads[scr] == scr) {
      int is_big = 0;
      for (int j = 0; j < 64; j++) {
        if (g_area_heads[j] == scr && j != scr) { is_big = 1; break; }
      }
      if (is_big) {
        uint16 exit_x = kExitData_XCoord[i];
        uint16 exit_y = kExitData_YCoord[i];
        uint8 head_col = scr & 7;
        uint8 head_row = scr >> 3;
        uint8 sub_col = (exit_x >= (uint16)((head_col + 1) * 512)) ? 1 : 0;
        uint8 sub_row = (exit_y >= (uint16)((head_row + 1) * 512)) ? 1 : 0;
        scr = ((head_row + sub_row) << 3) | (head_col + sub_col);
      }
    }
    g_exit_screen_buf[o + 0] = room & 0xFF;
    g_exit_screen_buf[o + 1] = (room >> 8) & 0xFF;
    g_exit_screen_buf[o + 2] = scr;
  }
  return (int)g_exit_screen_buf;
}


EMSCRIPTEN_KEEPALIVE
int WasmGetAreaHeads(void) {
  return (int)g_area_heads;
}

// Entrance rooms: entrance ID → dungeon room (uint16 per entry), count prefix.
// 133 entries max → 2 + 133*2 = 268 bytes.
static uint8 g_entrance_rooms_buf[2 + 133 * 2];

EMSCRIPTEN_KEEPALIVE
int WasmGetEntranceRooms(void) {
  uint16 count = kEntranceData_rooms_SIZE / 2;
  if (count > 133) count = 133;
  g_entrance_rooms_buf[0] = count & 0xFF;
  g_entrance_rooms_buf[1] = (count >> 8) & 0xFF;
  for (uint16 i = 0; i < count; i++) {
    int o = 2 + i * 2;
    uint16 room = kEntranceData_rooms[i];
    g_entrance_rooms_buf[o + 0] = room & 0xFF;
    g_entrance_rooms_buf[o + 1] = (room >> 8) & 0xFF;
  }
  return (int)g_entrance_rooms_buf;
}

// Entrance spawn positions: playerX(u16) + playerY(u16) per entry, count prefix.
// 133 entries max → 2 + 133*4 = 534 bytes.
static uint8 g_entrance_spawn_buf[2 + 133 * 5];

EMSCRIPTEN_KEEPALIVE
int WasmGetEntranceSpawns(void) {
  uint16 count = kEntranceData_playerX_SIZE / 2;
  if (count > 133) count = 133;
  g_entrance_spawn_buf[0] = count & 0xFF;
  g_entrance_spawn_buf[1] = (count >> 8) & 0xFF;
  for (uint16 i = 0; i < count; i++) {
    int o = 2 + i * 5;
    uint16 px = kEntranceData_playerX[i];
    uint16 py = kEntranceData_playerY[i];
    g_entrance_spawn_buf[o + 0] = px & 0xFF;
    g_entrance_spawn_buf[o + 1] = (px >> 8) & 0xFF;
    g_entrance_spawn_buf[o + 2] = py & 0xFF;
    g_entrance_spawn_buf[o + 3] = (py >> 8) & 0xFF;
    g_entrance_spawn_buf[o + 4] = kEntranceData_startingBg[i];
  }
  return (int)g_entrance_spawn_buf;
}

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

// ─── Room Exit-to-Overworld Door Positions ───
// Up to 8 exit doors per room. Each entry: [tileCol(1), tileRow(1), direction(1)]
// direction: 0=N, 1=S, 2=W, 3=E
// Sources: dung_exit_door_addresses (ExitToOw type) + regular entrance doors (types 6/10/14).

static uint8 g_exit_doors_buf[2 + 8 * 3];

EMSCRIPTEN_KEEPALIVE
int WasmGetRoomExitDoors(void) {
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
// Each entry: [destRoom(1), tileRow(1), tileCol(1), direction(1)]
// direction: 0=up, 4=down (matches attr bit 2)
// Stair index tiles have attr = 0x30..0x37 where bits 0-1 = stair index, bit 2 = direction.

static uint8 g_room_stairs_buf[2 + 4 * 4];

EMSCRIPTEN_KEEPALIVE
int WasmGetRoomStairInfo(void) {
  memset(g_room_stairs_buf, 0, sizeof(g_room_stairs_buf));

  if (!player_is_indoors) {
    return (int)g_room_stairs_buf;
  }

  uint8 found[4] = {0, 0, 0, 0};
  uint8 count = 0;

  // Scan both pages of the attr table for stair index tiles.
  // Page 0 = upper layer (offset 0), Page 1 = lower layer (offset 0x1000).
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
      g_room_stairs_buf[o + 3] = attr & 4;
      count++;
    }
  }

  g_room_stairs_buf[0] = count;
  g_room_stairs_buf[1] = 0;
  return (int)g_room_stairs_buf;
}

// ─── Room Travel Destinations (from room header) ───
// Returns the 5 travel destination bytes for the current room.
// [0] = pit/block destination, [1..4] = stair destinations for stair indices 0-3.
// Format: [dest0, dest1, dest2, dest3, dest4]
static uint8 g_travel_dest_buf[5];

EMSCRIPTEN_KEEPALIVE
int WasmGetRoomTravelDestinations(void) {
  for (int i = 0; i < 5; i++) {
    g_travel_dest_buf[i] = player_is_indoors ? dung_hdr_travel_destinations[i] : 0;
  }
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
  if (!player_is_indoors) return -1;
  return *(uint16*)(g_ram + 0x44A);
}

// ─── Room Walk Boundaries (palace toggle doors + open edges) ───
// Up to 4 inter-room walk-through connections per room.
// Each entry: [destRoom(2), tileRow(1), tileCol(1)]
// These are passages where walking through transitions to the adjacent room
// (typically palace context switches like Castle→Sewer).

static uint8 g_walk_bounds_buf[2 + 4 * 4];

EMSCRIPTEN_KEEPALIVE
int WasmGetRoomWalkBoundaries(void) {
  memset(g_walk_bounds_buf, 0, sizeof(g_walk_bounds_buf));

  if (!player_is_indoors) {
    return (int)g_walk_bounds_buf;
  }

  uint8 count = 0;
  uint8 num_toggles = (uint8)(dung_num_toggle_palace >> 1);
  if (num_toggles > 4) num_toggles = 4;

  uint16 room = dungeon_room_index;

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
    g_walk_bounds_buf[o + 0] = (uint8)(dest & 0xFF);
    g_walk_bounds_buf[o + 1] = (uint8)(dest >> 8);
    g_walk_bounds_buf[o + 2] = row;
    g_walk_bounds_buf[o + 3] = col;
    count++;
  }

  g_walk_bounds_buf[0] = count;
  g_walk_bounds_buf[1] = 0;
  return (int)g_walk_bounds_buf;
}
