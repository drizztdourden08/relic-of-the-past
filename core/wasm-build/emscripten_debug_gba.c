/* @layer core-wasm-build @kind native */
/**
 * Developer harness exports for the optional second-cartridge content.
 *
 * Nothing in normal gameplay calls any of these: the extra dungeon is reached through the
 * overworld entrance, and these exist so a JS harness can teleport straight into a room and
 * read back engine state while reverse-engineering it. They live apart from emscripten_api.c
 * so the shipping API surface stays readable and within the file-size policy.
 */
#include <stdint.h>
#include <emscripten.h>

#include "src/types.h"
#include "src/variables.h"
#include "src/zelda_rtl.h"
#include "src/dungeon.h"
#include "gba_alttp.h"

#include "emscripten_internal.h"

// Developer harness entry point. Normal gameplay reaches this through the
// Pyramid hole and never calls this export.
EMSCRIPTEN_KEEPALIVE
int WasmDebugEnterGbaPalace(void) {
  if (!GbaAlttp_IsAvailable())
    return 0;
  which_entrance = kGbaAlttpEntrance;
  sram_progress_indicator = 3;
  if (link_health_capacity == 0)
    link_health_capacity = link_health_current = 0x18;
  Module_PreDungeon();
  main_module_index = 7;
  submodule_index = 0;
  subsubmodule_index = 0;
  flag_is_link_immobilized = 0;
  flag_block_link_menu = 0;
  link_auxiliary_state = 0;
  link_incapacitated_timer = 0;
  link_player_handler_state = 0;
  printf("[GBA ALttP] Debug entrance room=%04x active=%d\n",
         dungeon_room_index, GbaAlttp_IsPalaceActive());
  return GbaAlttp_IsPalaceRoom(dungeon_room_index) && dungeon_room_index == 0x88;
}

EMSCRIPTEN_KEEPALIVE
int WasmDebugGetLinkX(void) { return link_x_coord; }

EMSCRIPTEN_KEEPALIVE
int WasmDebugGetLinkY(void) { return link_y_coord; }

EMSCRIPTEN_KEEPALIVE
int WasmDebugGetDungeonRoom(void) { return dungeon_room_index; }

EMSCRIPTEN_KEEPALIVE
int WasmDebugGetOverworldScreen(void) { return overworld_screen_index; }

EMSCRIPTEN_KEEPALIVE
int WasmDebugGetOverworldMap16Cell(int index) {
  return (unsigned)index < 4096 ? dung_bg2[index] : -1;
}

EMSCRIPTEN_KEEPALIVE
int WasmDebugGetOverworldBaseX(void) { return overworld_offset_base_x; }

EMSCRIPTEN_KEEPALIVE
int WasmDebugGetOverworldBaseY(void) { return overworld_offset_base_y; }

EMSCRIPTEN_KEEPALIVE
int WasmDebugGetRuntimeState(int index) {
  switch (index) {
  case 0: return player_is_indoors;
  case 1: return dungeon_room_index;
  case 2: return link_x_coord;
  case 3: return link_y_coord;
  case 4: return BG2HOFS_copy2;
  case 5: return BG2VOFS_copy2;
  case 6: return camera_x_coord_scroll_low;
  case 7: return camera_y_coord_scroll_low;
  case 8: return room_bounds_x.a0;
  case 9: return room_bounds_x.a1;
  case 10: return room_bounds_y.a0;
  case 11: return room_bounds_y.a1;
  case 12: return link_quadrant_x;
  case 13: return link_quadrant_y;
  case 14: return quadrant_fullsize_x;
  case 15: return quadrant_fullsize_y;
  case 16: return is_standing_in_doorway;
  case 17: return link_direction_facing;
  case 18: return link_tile_below;
  case 19: return ow_entrance_value;
  case 20: return main_module_index;
  case 21: return submodule_index;
  case 22: return GbaAlttp_IsPalaceActive();
  case 23: return composite_of_layout_and_quadrant;
  case 24: return dung_hdr_collision;
  case 25: return link_is_on_lower_level;
  case 26: return link_is_on_lower_level_mirror;
  case 27: return oam_priority_value;
  case 28: return cheatWalkThroughWalls;
  case 29: return GbaAlttp_UsesFixedHorizontalCamera();
  default: return -1;
  }
}

EMSCRIPTEN_KEEPALIVE
int WasmDebugGetDungeonAttr(int index) {
  return (unsigned)index < 0x2000 ? dung_bg2_attr_table[index] : -1;
}

EMSCRIPTEN_KEEPALIVE
int WasmDebugGetInputMode(void) { return g_js_input_mode; }

EMSCRIPTEN_KEEPALIVE
void WasmDebugResetGbaPalace(void) { GbaAlttp_EndPalace(); }

EMSCRIPTEN_KEEPALIVE
void WasmDebugShiftOverworld(int dx, int dy) {
  if (player_is_indoors)
    return;
  link_x_coord += dx;
  link_y_coord += dy;
  BG1HOFS_copy += dx;
  BG1HOFS_copy2 += dx;
  BG2HOFS_copy += dx;
  BG2HOFS_copy2 += dx;
  BG1VOFS_copy += dy;
  BG1VOFS_copy2 += dy;
  BG2VOFS_copy += dy;
  BG2VOFS_copy2 += dy;
  camera_x_coord_scroll_low += dx;
  camera_x_coord_scroll_hi += dx;
  camera_y_coord_scroll_low += dy;
  camera_y_coord_scroll_hi += dy;
}
