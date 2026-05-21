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
  b[7] = (uint8)(link_rupees_actual & 0xFF);
  b[8] = (uint8)((link_rupees_actual >> 8) & 0xFF);
  b[9] = (uint8)(link_rupees_goal & 0xFF);
  b[10] = (uint8)((link_rupees_goal >> 8) & 0xFF);
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
  b[55] = (uint8)(link_dungeon_map & 0xFF);
  b[56] = (uint8)((link_dungeon_map >> 8) & 0xFF);
  b[57] = (uint8)(link_compass & 0xFF);
  b[58] = (uint8)((link_compass >> 8) & 0xFF);
  b[59] = (uint8)(link_bigkey & 0xFF);
  b[60] = (uint8)((link_bigkey >> 8) & 0xFF);

  // ─── Bytes 61–68: Text/Dialogue ───
  b[61] = (uint8)(dialogue_message_index & 0xFF);
  b[62] = (uint8)((dialogue_message_index >> 8) & 0xFF);
  b[63] = messaging_module;
  b[64] = text_render_state;
  b[65] = text_incremental_state;
  b[66] = choice_in_multiselect_box;
  b[67] = (uint8)(text_wait_countdown & 0xFF);
  b[68] = (uint8)((text_wait_countdown >> 8) & 0xFF);

  // ─── Bytes 69–78: Map State ───
  b[69] = overworld_map_state;
  b[70] = (uint8)(dungmap_cur_floor & 0xFF);
  b[71] = (uint8)((dungmap_cur_floor >> 8) & 0xFF);
  b[72] = (uint8)(dungmap_idx & 0xFF);
  b[73] = (uint8)((dungmap_idx >> 8) & 0xFF);
  b[74] = dungmap_init_state;
  b[75] = (uint8)(cur_palace_index_x2 & 0xFF);
  b[76] = (uint8)((cur_palace_index_x2 >> 8) & 0xFF);
  b[77] = (uint8)(dungeon_room_index & 0xFF);
  b[78] = (uint8)((dungeon_room_index >> 8) & 0xFF);
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
  b[109] = (uint8)(overworld_screen_index & 0xFF);
  b[110] = (uint8)((overworld_screen_index >> 8) & 0xFF);
  b[111] = player_is_indoors;
  b[112] = is_in_dark_world;
  b[113] = (uint8)(overworld_area_index & 0xFF);
  b[114] = link_heart_pieces;

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
