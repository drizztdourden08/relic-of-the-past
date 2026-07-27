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

static uint8 g_live_room_buf[4];

EMSCRIPTEN_KEEPALIVE
int WasmGetLiveRoomFlags(void) {
  uint16 room = dungeon_room_index;
  uint16 flags = dung_savegame_state_bits >> 4;
  PutU16(g_live_room_buf, 0, room);
  PutU16(g_live_room_buf, 2, flags);
  return (int)g_live_room_buf;
}

// ─── Overworld Event Flags Query ───

EMSCRIPTEN_KEEPALIVE
int WasmGetOverworldFlags(void) {
  return (int)save_ow_event_info;
}

// ─── Progress Flags Query ───
// Layout: 19 bytes.
//   [0]  sram_progress_indicator
//   [1]  sram_progress_flags
//   [2]  sram_progress_indicator_3
//   [3]  link_item_flippers
//   [4]  link_item_boots
//   [5]  link_item_bug_net
//   [6]  link_item_mirror
//   [7]  link_item_quake_medallion
//   [8]  link_magic_consumption
//   [9]  save_dung_info[0x109] low byte  (Potion Shop room flag)
//   [10] save_dung_info[0x123] low byte  (Mini Moldorm Cave room flag)
//   [11] save_dung_info[0x11E] low byte  (Hype Cave room flag)
//   [12] player_sleep_in_bed_state
//   [13] follower_indicator
//   [14] link_num_keys
//   [15] link_bigkey
//   [16] save_dung_info[0x109] high byte
//   [17] save_dung_info[0x123] high byte
//   [18] save_dung_info[0x11E] high byte
// A room word's chest/item bits span the full 16 bits (CHEST_OPEN_MASKS runs up
// to 0x400), so the three tracked rooms each carry both the low byte (already
// here) and a high byte appended at the end, rather than widening [9]-[11] in
// place and reshuffling every other index in this buffer.
static uint8 g_progress_buf[21];

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
  g_progress_buf[13] = follower_indicator;  // tagalong id (0 = none); NPC-presence gate
  g_progress_buf[14] = link_num_keys;       // key grants/spends are observable progress
  g_progress_buf[15] = (uint8)link_bigkey;  // big-key grants are observable progress
  g_progress_buf[16] = (uint8)(save_dung_info[0x109] >> 8);
  g_progress_buf[17] = (uint8)(save_dung_info[0x123] >> 8);
  g_progress_buf[18] = (uint8)(save_dung_info[0x11E] >> 8);
  // Scripted-scene checkpoints the run cannot otherwise observe. The first is the
  // starting-point id the game stamps as each opening scene completes; the second
  // is the map-marker state the eastern sage sets once he has given his errand.
  g_progress_buf[19] = which_starting_point;
  g_progress_buf[20] = savegame_map_icons_indicator;
  return (int)g_progress_buf;
}

// ─── Viewport Info ───

static uint8 g_viewport_buf[32];

EMSCRIPTEN_KEEPALIVE
int WasmGetViewportInfo(void) {
  g_viewport_buf[0] = main_module_index;
  g_viewport_buf[1] = submodule_index;
  // extra{LeftRight,Left,Right}Cur are uint16 (can exceed 255 for very wide ratios)
  PutU16(g_viewport_buf, 2, g_zenv.ppu->extraLeftRight);
  PutU16(g_viewport_buf, 4, g_zenv.ppu->extraLeftCur);
  PutU16(g_viewport_buf, 6, g_zenv.ppu->extraRightCur);
  g_viewport_buf[8] = (uint8)g_zenv.ppu->extraBottomCur;  // vertical content rows below base (<=kPpuExtraTopBottom)
  g_viewport_buf[11] = (uint8)g_zenv.ppu->extraTopCur;     // vertical content rows above base (tall); [11] was unused

  // locationModule: the player's physical location regardless of UI overlays.
  // The menu / spotlight modules are transient overlays — the player hasn't
  // moved, so report saved_module_for_menu instead. Guard: if
  // saved_module_for_menu is 0 while in the menu module, this is a real menu
  // screen (file select etc), not a gameplay overlay — report the actual module.
  uint8 mod = main_module_index;
  if ((mod == MODULE_MENU || mod == MODULE_SPOTLIGHT_CLOSE || mod == MODULE_SPOTLIGHT_OPEN) &&
      saved_module_for_menu != 0) {
    g_viewport_buf[9] = saved_module_for_menu;
  } else {
    g_viewport_buf[9] = mod;
  }
  // locationType: 0=overworld/other, 1=house/cave, 2=dungeon
  uint8 locMod = g_viewport_buf[9];
  g_viewport_buf[10] = (locMod == MODULE_DUNGEON) ? (cur_palace_index_x2 == 0xff ? 1 : 2) : 0;

  uint16 w = (uint16)(g_config.extended_aspect_ratio * 2 + 256);
  int topB = g_zenv.ppu->extraTopBottom;
  int botB = topB > 0 ? topB : (g_config.extend_y ? 16 : 0);
  uint16 h = (uint16)(224 + topB + botB);  // total render height (matches g_snes_height)
  PutU16(g_viewport_buf, 12, w);
  PutU16(g_viewport_buf, 14, h);

  // Camera world position (BG2 scroll = top-left of viewport in world coords)
  PutU16(g_viewport_buf, 16, BG2HOFS_copy2);
  PutU16(g_viewport_buf, 18, BG2VOFS_copy2);

  // The player's world position
  PutU16(g_viewport_buf, 20, link_x_coord);
  PutU16(g_viewport_buf, 22, link_y_coord);

  // Vertical (tall) max budget per side, so JS can compute blackTop = budget - extraTopCur unambiguously
  // (snesHeight alone can't tell a tall V=8 config from the legacy extend_y +16 bottom-only).
  PutU16(g_viewport_buf, 24, (uint16)g_zenv.ppu->extraTopBottom);

  // Camera-lock render shift (wide/tall view): the rendered view sits at the game camera MINUS this shift,
  // and the shift varies as the lock re-centers while the player moves. World-space overlays must subtract it
  // (on top of extraLeftRight) or they drift / appear to follow the player. Signed; stored as int16, read as signed.
  PutU16(g_viewport_buf, 26, (uint16)(int16)g_zenv.ppu->cameraLockShiftX);
  PutU16(g_viewport_buf, 28, (uint16)(int16)g_zenv.ppu->cameraLockShiftY);

  // Doorway/door debug state, surfaced for display only (the Navigation widget's Player
  // State panel). Both are LATCHED, not per-frame: is_standing_in_doorway is set on
  // entering a room through a doorway and cleared only on certain intra-room transitions;
  // door_animation_step_indicator is left at 16 once a door finishes opening rather than
  // returning to 0. Neither is safe to use as a "is this happening right now" gate.
  g_viewport_buf[30] = is_standing_in_doorway;
  g_viewport_buf[31] = (uint8)door_animation_step_indicator;  // 0..16
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

// ─── Player state (display-only) ───
// Layout: 8 bytes
//   [0] link_player_handler_state (kPlayerState_*)
//   [1] player_sleep_in_bed_state  (step counter INSIDE the sleeping handler)
//   [2] link_is_running            (dashing with the Pegasus boots)
//   [3] link_is_bunny
//   [4] link_is_in_deep_water
//   [5] link_grabbing_wall
//   [6] sram_progress_flags        (named bits, for the widget's state chips)
//   [7] link_incapacitated_timer   (nonzero while stunned/recoiling)
//
// Deliberately NOT folded into the progress buffer that WasmGetProgressFlags
// returns: the simulator DIFFS that buffer to detect checks, and these values
// change every frame, so adding them there would fabricate check events.
static uint8 g_player_state_buf[8];

EMSCRIPTEN_KEEPALIVE
int WasmGetPlayerStateInfo(void) {
  g_player_state_buf[0] = link_player_handler_state;
  g_player_state_buf[1] = player_sleep_in_bed_state;
  g_player_state_buf[2] = link_is_running;
  g_player_state_buf[3] = link_is_bunny;
  g_player_state_buf[4] = link_is_in_deep_water;
  g_player_state_buf[5] = link_grabbing_wall;
  g_player_state_buf[6] = sram_progress_flags;
  g_player_state_buf[7] = link_incapacitated_timer;
  return (int)g_player_state_buf;
}
