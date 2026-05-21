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
