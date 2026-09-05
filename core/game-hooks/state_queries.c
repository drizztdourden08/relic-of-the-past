/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── Overworld Special-Area Query ───

// dungeon_room_index values Overworld_CheckSpecialSwitchArea assigns for the 3 special-
// switch locations (overworld.c's kSpecialSwitchArea_Exit table: 0x180, 0x181, 0x182,
// 0x189), set in the SAME call that flips main_module_index to 11, so unlike
// overworld_screen_index (which only reaches its special-area value a few frames later,
// once Overworld_EnterSpecialArea/LoadOverworldFromSpecialOverworld actually runs), this
// is already correct on the very first frame of the transition.
static bool IsKnownSpecialAreaRoomIndex(uint16 idx) {
  return idx == 0x180 || idx == 0x181 || idx == 0x182 || idx == 0x189;
}

// Sticky across a whole module-11 episode: overworld_screen_index and dungeon_room_index
// each independently have a brief window of a few frames, both on entering and (especially)
// on leaving, where neither confirms the special-area flavor even though we're still
// mid-transition, because the game hasn't finished updating them relative to the module
// flip. Latching on any positive signal and holding it for as long as main_module_index
// stays MODULE_FALLING_ENTRANCE closes that gap instead of the widescreen view (and the
// HUD/cheat gates) flashing back to collapsed for those few frames every single crossing.
static bool s_stickySpecialArea = false;

// The parameterized version a caller uses once it has already resolved a menu-overlay
// remap (main_module_index==14, the real module sitting in saved_module_for_menu).
// Otherwise the special area silently stops being recognized the instant the player
// opens the pause menu over it, since main_module_index reads 14 there, not 11. This is
// also the only form that updates the latch above. GameHook_IsOverworldSpecialArea says
// why the raw form must not.
bool GameHook_IsOverworldSpecialAreaFor(int effectiveModule) {
  if (effectiveModule != MODULE_FALLING_ENTRANCE) {
    s_stickySpecialArea = false;
    return false;
  }
  if (overworld_screen_index >= OVERWORLD_SPECIAL_AREA_SCREEN_MIN || IsKnownSpecialAreaRoomIndex(dungeon_room_index)) {
    s_stickySpecialArea = true;
  }
  return s_stickySpecialArea;
}

// Raw-module form for cheats.c's gameplay-input gate, where excluding the paused state is
// correct (matches how a normal overworld location already behaves while paused). Reads
// the latch WITHOUT the reset-on-mismatch above: pausing sets main_module_index to 14,
// and if this form ran that through the same reset it would clear the latch on every
// pause, then need a fresh signal to relatch on unpausing (screen_index still would give
// one immediately, but there is no reason to let a pure input-gate query mutate location
// state that ConfigurePpuSideSpace/WasmGetViewportInfo are the source of truth for).
bool GameHook_IsOverworldSpecialArea(void) {
  return main_module_index == MODULE_FALLING_ENTRANCE && s_stickySpecialArea;
}

// ─── Inventory State Query ───

static uint8 g_inventory_buf[40];

EMSCRIPTEN_KEEPALIVE
int WasmGetInventoryState(void) {
  if (!TrackerQueryGate()) {
    memset(g_inventory_buf, 0, sizeof(g_inventory_buf));
    return (int)g_inventory_buf;
  }
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
  if (!FlagQueryGate()) return (int)GatedEmpty();  // live-WRAM alias: see gated_empty.c
  return (int)save_dung_info;
}

// ─── Live Room Flags Query ───

static uint8 g_live_room_buf[4];

EMSCRIPTEN_KEEPALIVE
int WasmGetLiveRoomFlags(void) {
  if (!FlagQueryGate()) {
    memset(g_live_room_buf, 0, sizeof(g_live_room_buf));
    return (int)g_live_room_buf;
  }
  uint16 room = dungeon_room_index;
  uint16 flags = dung_savegame_state_bits >> 4;
  PutU16(g_live_room_buf, 0, room);
  PutU16(g_live_room_buf, 2, flags);
  return (int)g_live_room_buf;
}

// ─── Overworld Event Flags Query ───

EMSCRIPTEN_KEEPALIVE
int WasmGetOverworldFlags(void) {
  if (!FlagQueryGate()) return (int)GatedEmpty();  // live-WRAM alias: see gated_empty.c
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
// here) and a high byte appended at the end, instead of widening [9]-[11] in
// place and reshuffling every other index in this buffer.
static uint8 g_progress_buf[21];

EMSCRIPTEN_KEEPALIVE
int WasmGetProgressFlags(void) {
  if (!FlagQueryGate()) {
    memset(g_progress_buf, 0, sizeof(g_progress_buf));
    return (int)g_progress_buf;
  }
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
  if (!RenderQueryGate()) {
    memset(g_viewport_buf, 0, sizeof(g_viewport_buf));
    return (int)g_viewport_buf;
  }
  g_viewport_buf[0] = main_module_index;
  g_viewport_buf[1] = submodule_index;
  // extra{LeftRight,Left,Right}Cur are uint16 (can exceed 255 for very wide ratios)
  PutU16(g_viewport_buf, 2, g_zenv.ppu->extraLeftRight);
  PutU16(g_viewport_buf, 4, g_zenv.ppu->extraLeftCur);
  PutU16(g_viewport_buf, 6, g_zenv.ppu->extraRightCur);
  g_viewport_buf[8] = (uint8)g_zenv.ppu->extraBottomCur;  // vertical content rows below base (<=kPpuExtraTopBottom)
  g_viewport_buf[11] = (uint8)g_zenv.ppu->extraTopCur;     // vertical content rows above base (tall); [11] was unused

  // locationModule: the player's physical location regardless of UI overlays.
  // The menu / spotlight modules are transient overlays where the player hasn't
  // moved, so report saved_module_for_menu instead. Guard: if
  // saved_module_for_menu is 0 while in the menu module, this is a real menu
  // screen (file select etc), not a gameplay overlay, so report the actual module.
  uint8 mod = main_module_index;
  if ((mod == MODULE_MENU || mod == MODULE_SPOTLIGHT_CLOSE || mod == MODULE_SPOTLIGHT_OPEN) &&
      saved_module_for_menu != 0) {
    mod = saved_module_for_menu;
  }
  // The overworld-special-area flavor of MODULE_FALLING_ENTRANCE is normal outdoor
  // gameplay, so report it as such and consumers keyed on locationModule === MODULE_OVERWORLD
  // (the edge-glow effect) still engage there. Checked against `mod` (already
  // menu-remapped above), not the raw module, so this still holds while paused.
  if (GameHook_IsOverworldSpecialAreaFor(mod)) {
    mod = MODULE_OVERWORLD;
  }
  g_viewport_buf[9] = mod;
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
  // door_animation_step_indicator is left at 16 once a door finishes opening instead of
  // returning to 0. Neither is safe to use as a "is this happening right now" gate.
  g_viewport_buf[30] = is_standing_in_doorway;
  g_viewport_buf[31] = (uint8)door_animation_step_indicator;  // 0..16
  return (int)g_viewport_buf;
}

// ─── Indoor Collision Attr Table ───

EMSCRIPTEN_KEEPALIVE
int WasmGetIndoorAttrTable(void) {
  if (!NavQueryGate()) return (int)GatedEmpty();  // live-WRAM alias: see gated_empty.c
  // 0x0000..0x0FFF = upper layer attrs, 0x1000..0x1FFF = lower layer attrs
  return (int)dung_bg2_attr_table;
}

EMSCRIPTEN_KEEPALIVE
int WasmGetLinkIsOnLowerLevel(void) {
  if (!NavQueryGate()) return 0;
  return link_is_on_lower_level ? 1 : 0;
}

EMSCRIPTEN_KEEPALIVE
int WasmGetRoomCollisionType(void) {
  if (!NavQueryGate()) return 0;
  if (!player_is_indoors) return -1;
  return (int)dung_hdr_collision;
}

// Headless-safe: read collision type directly from ROM header for any room
EMSCRIPTEN_KEEPALIVE
int WasmGetRoomCollisionTypeForRoom(int room_id) {
  if (!NavQueryGate()) return 0;
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
  if (!RenderQueryGate()) {
    memset(g_player_state_buf, 0, sizeof(g_player_state_buf));
    return (int)g_player_state_buf;
  }
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
