/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── Game UI State Export ───
// Single buffer containing all state needed for the React UI overlay.
// Polled every frame from JS via requestAnimationFrame.

static uint8 g_ui_state_buf[256];

// Overlay mode bitmask — controls native rendering suppression (future use)
static uint8 g_ui_overlay_mode = 0;

EMSCRIPTEN_KEEPALIVE
int WasmGetGameUIState(void) {
  uint8 *b = g_ui_state_buf;
  int i;

  // ─── Bytes 0–2: Game Mode ───
  b[0] = main_module_index;
  b[1] = submodule_index;
  b[2] = subsubmodule_index;

  // ─── Bytes 3–14: HUD Vitals ───
  b[3] = link_health_current;
  b[4] = link_health_capacity;
  b[5] = link_magic_power;
  b[6] = link_magic_consumption;
  PutU16(b, 7, link_rupees_actual);
  PutU16(b, 9, link_rupees_goal);
  b[11] = link_item_bombs;
  b[12] = link_num_arrows;
  b[13] = link_num_keys;
  b[14] = hud_cur_item;

  // ─── Bytes 15–17: Extended Equipment Slots ───
  b[15] = hud_cur_item_x;
  b[16] = hud_cur_item_l;
  b[17] = hud_cur_item_r;

  // ─── Bytes 18–21: Animated Fillers ───
  b[18] = link_hearts_filler;
  b[19] = link_magic_filler;
  b[20] = link_bomb_filler;
  b[21] = link_arrow_filler;

  // ─── Bytes 22–41: Item Slots (20 bytes) ───
  b[22] = link_item_bow;
  b[23] = link_item_boomerang;
  b[24] = link_item_hookshot;
  b[25] = link_item_bombs;
  b[26] = link_item_mushroom;
  b[27] = link_item_fire_rod;
  b[28] = link_item_ice_rod;
  b[29] = link_item_bombos_medallion;
  b[30] = link_item_ether_medallion;
  b[31] = link_item_quake_medallion;
  b[32] = link_item_torch;
  b[33] = link_item_hammer;
  b[34] = link_item_flute;
  b[35] = link_item_bug_net;
  b[36] = link_item_book_of_mudora;
  b[37] = link_item_bottle_index;
  b[38] = link_item_cane_somaria;
  b[39] = link_item_cane_byrna;
  b[40] = link_item_cape;
  b[41] = link_item_mirror;

  // ─── Bytes 42–45: Bottle Contents ───
  b[42] = link_bottle_info[0];
  b[43] = link_bottle_info[1];
  b[44] = link_bottle_info[2];
  b[45] = link_bottle_info[3];

  // ─── Bytes 46–52: Equipment ───
  b[46] = link_sword_type;
  b[47] = link_shield_type;
  b[48] = link_armor;
  b[49] = link_item_gloves;
  b[50] = link_item_boots;
  b[51] = link_item_flippers;
  b[52] = link_item_moon_pearl;

  // ─── Bytes 53–60: Dungeon Progress ───
  b[53] = link_which_pendants;
  b[54] = link_has_crystals;
  PutU16(b, 55, link_dungeon_map);
  PutU16(b, 57, link_compass);
  PutU16(b, 59, link_bigkey);

  // ─── Bytes 61–68: Text/Dialogue ───
  PutU16(b, 61, dialogue_message_index);
  b[63] = messaging_module;
  b[64] = text_render_state;
  b[65] = text_incremental_state;
  b[66] = choice_in_multiselect_box;
  PutU16(b, 67, text_wait_countdown);

  // ─── Bytes 69–78: Map State ───
  b[69] = overworld_map_state;
  PutU16(b, 70, dungmap_cur_floor);
  PutU16(b, 72, dungmap_idx);
  b[74] = dungmap_init_state;
  PutU16(b, 75, cur_palace_index_x2);
  PutU16(b, 77, dungeon_room_index);
  b[79] = dung_cur_floor;

  // ─── Bytes 80–81: Floor Indicator / Ability Flags ───
  b[80] = hud_floor_changed_timer;
  b[81] = link_ability_flags;

  // ─── Bytes 82–83: Save Menu / Meta ───
  b[82] = saved_module_for_menu;
  b[83] = sram_progress_indicator;

  // ─── Bytes 84–107: Inventory Order (24 bytes) ───
  for (i = 0; i < 24; i++) {
    b[84 + i] = hud_inventory_order[i];
  }

  // ─── Byte 108: Overlay mode echo ───
  b[108] = g_ui_overlay_mode;

  // ─── Bytes 109–114: Location State ───
  PutU16(b, 109, overworld_screen_index);
  b[111] = player_is_indoors;
  b[112] = is_in_dark_world;
  b[113] = (uint8)(overworld_area_index & 0xFF);
  b[114] = link_heart_pieces;

  // ─── Bytes 115–118: Player Action State (for haptics) ───
  b[115] = link_player_handler_state;
  b[116] = link_is_running;
  b[117] = link_dash_ctr;
  b[118] = link_animation_steps;

  // ─── Bytes 119–124: Extended Location (for region detection) ───
  b[119] = which_entrance;
  b[120] = link_is_on_lower_level;
  PutU16(b, 121, link_x_coord);
  PutU16(b, 123, link_y_coord);

  // ─── Bytes 125–128: Current Resource Caps (for "indicate max resources") ───
  // Rupee cap mirrors hud.c's static MaxRupees() — duplicated here since that helper has internal
  // linkage; the underlying condition (enhanced_features0 & kFeatures0_CarryMoreRupees) is the same.
  b[125] = kMaxBombsForLevel[link_bomb_upgrades];
  b[126] = kMaxArrowsForLevel[link_arrow_upgrades];
  PutU16(b, 127, (enhanced_features0 & kFeatures0_CarryMoreRupees) ? 9999 : 999);

  return (int)g_ui_state_buf;
}

EMSCRIPTEN_KEEPALIVE
void WasmSetUIOverlayMode(int mode) {
  g_ui_overlay_mode = (uint8)mode;
}

EMSCRIPTEN_KEEPALIVE
int WasmGetUIOverlayMode(void) {
  return g_ui_overlay_mode;
}
