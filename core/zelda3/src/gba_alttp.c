#include "gba_alttp.h"

#include <string.h>

#include "variables.h"
#include "zelda_rtl.h"

enum {
  kGbaAssetRoomIds = 0,
  kGbaAssetRoomHeaders = 1,
  kGbaAssetRoomLayers = 2,
  kGbaAssetRoomCollision = 3,
  kGbaAssetBgGraphics = 7,
  kGbaAssetPaletteIds = 8,
  kGbaAssetBgPalettes = 9,
};

const uint8 *g_gba_alttp_asset_ptrs[kGbaAlttpAssetCount];
uint32 g_gba_alttp_asset_sizes[kGbaAlttpAssetCount];

static bool g_palace_active;
static const uint16 kNoDoors[] = { 0xffff };

static MemBlk GbaAsset(int index) {
  return (MemBlk) { g_gba_alttp_asset_ptrs[index], g_gba_alttp_asset_sizes[index] };
}

static int FindPalaceRoom(uint16 room) {
  const uint16 *ids = (const uint16 *)g_gba_alttp_asset_ptrs[kGbaAssetRoomIds];
  size_t count = g_gba_alttp_asset_sizes[kGbaAssetRoomIds] / sizeof(uint16);
  for (size_t i = 0; i < count; i++) {
    if (ids[i] == room)
      return (int)i;
  }
  return -1;
}

static bool TileHasVisiblePixels(uint16 map_word) {
  int tile = map_word & 0x3ff;
  const uint8 *gfx = g_gba_alttp_asset_ptrs[kGbaAssetBgGraphics] + tile * 32;
  for (int i = 0; i < 32; i++) {
    if (gfx[i])
      return true;
  }
  return false;
}

bool GbaAlttp_IsAvailable(void) {
  return g_gba_alttp_asset_ptrs[kGbaAssetRoomIds] != NULL;
}

bool GbaAlttp_IsPyramidEntrancePosition(uint16 x, uint16 y) {
  return GbaAlttp_IsAvailable() && BYTE(overworld_screen_index) == 0x5b &&
      x >= 0x8a8 && x < 0x8c8 && y >= 0x7b0 && y < 0x7e0;
}

bool GbaAlttp_IsPalaceActive(void) {
  return g_palace_active && GbaAlttp_IsAvailable();
}

bool GbaAlttp_IsPalaceRoom(uint16 room) {
  return GbaAlttp_IsPalaceActive() && FindPalaceRoom(room) >= 0;
}

void GbaAlttp_BeginPalace(void) {
  g_palace_active = GbaAlttp_IsAvailable();
}

void GbaAlttp_EndPalace(void) {
  g_palace_active = false;
}

void GbaAlttp_SetupEntrance(void) {
  const uint16 room_base = 0x1000;
  dungeon_room_index = dungeon_room_index2 = 0x88;
  BG1HOFS_copy = BG2HOFS_copy = BG1HOFS_copy2 = BG2HOFS_copy2 = room_base + 0x80;
  BG1VOFS_copy = BG2VOFS_copy = BG1VOFS_copy2 = BG2VOFS_copy2 = room_base + 0x110;
  link_x_coord = room_base + 0xf8;
  link_y_coord = room_base + 0x1d8;
  camera_x_coord_scroll_low = room_base + 0x7f;
  camera_x_coord_scroll_hi = camera_x_coord_scroll_low + 2;
  camera_y_coord_scroll_low = room_base + 0x187;
  camera_y_coord_scroll_hi = camera_y_coord_scroll_low + 2;
  tilemap_location_calc_mask = 0x1f8;
  ow_entrance_value = 0;
  up_down_scroll_target = room_base;
  up_down_scroll_target_end = room_base + 0x110;
  left_right_scroll_target = room_base;
  left_right_scroll_target_end = room_base + 0x100;
  room_bounds_y.a0 = room_base + 0x100;
  room_bounds_y.b0 = room_base + 0x100;
  room_bounds_y.a1 = room_base + 0x110;
  room_bounds_y.b1 = room_base + 0x110;
  room_bounds_x.a0 = room_base;
  room_bounds_x.b0 = room_base;
  room_bounds_x.a1 = room_base + 0x100;
  room_bounds_x.b1 = room_base + 0x100;
  link_direction_facing = 0;
  main_tile_theme_index = 0;
  dung_cur_floor = 0;
  BYTE(cur_palace_index_x2) = 0xff;
  is_standing_in_doorway = 1;
  link_is_on_lower_level = link_is_on_lower_level_mirror = 0;
  quadrant_fullsize_x = 0;
  quadrant_fullsize_y = 2;
  link_quadrant_x = 1;
  link_quadrant_y = 2;
  queued_music_control = 0x10;
}

const uint8 *GbaAlttp_GetRoomHeader(uint16 room) {
  int index = FindPalaceRoom(room);
  return index < 0 ? NULL : FindIndexInMemblk(GbaAsset(kGbaAssetRoomHeaders), index).ptr;
}

const uint16 *GbaAlttp_GetRoomDoors(uint16 room) {
  return FindPalaceRoom(room) < 0 ? NULL : kNoDoors;
}

bool GbaAlttp_LoadPrebuiltRoom(uint16 room) {
  if (!GbaAlttp_IsPalaceActive())
    return false;
  int index = FindPalaceRoom(room);
  if (index < 0)
    return false;

  MemBlk layer0 = FindIndexInMemblk(GbaAsset(kGbaAssetRoomLayers), index * 3 + 0);
  MemBlk layer1 = FindIndexInMemblk(GbaAsset(kGbaAssetRoomLayers), index * 3 + 1);
  MemBlk layer2 = FindIndexInMemblk(GbaAsset(kGbaAssetRoomLayers), index * 3 + 2);
  MemBlk collision0 = FindIndexInMemblk(GbaAsset(kGbaAssetRoomCollision), index * 3 + 0);
  MemBlk collision1 = FindIndexInMemblk(GbaAsset(kGbaAssetRoomCollision), index * 3 + 1);
  MemBlk collision2 = FindIndexInMemblk(GbaAsset(kGbaAssetRoomCollision), index * 3 + 2);
  if (layer0.size != 0x2000 || layer1.size != 0x2000 || layer2.size != 0x2000 ||
      collision0.size != 0x1000 || collision1.size != 0x1000 || collision2.size != 0x1000)
    return false;

  memcpy(dung_bg2, layer0.ptr, 0x2000);
  const uint16 *middle = (const uint16 *)layer1.ptr;
  const uint16 *top = (const uint16 *)layer2.ptr;
  for (int i = 0; i < 4096; i++)
    dung_bg1[i] = TileHasVisiblePixels(top[i]) ? top[i] : middle[i];

  memcpy(dung_bg2_attr_table, collision0.ptr, 0x1000);
  if (room == 0x88) {
    // Translate the GBA entrance threshold to the native SNES doorway stripe.
    // This matches the two columns and five rows used by vanilla room exits.
    for (int y = 0x1d8; y <= 0x1f8; y += 8) {
      dung_bg2_attr_table[y * 8 + 31] = 0x8e;
      dung_bg2_attr_table[y * 8 + 32] = 0x8e;
    }
  }
  const uint8 *middle_attr = collision1.ptr;
  const uint8 *top_attr = collision2.ptr;
  for (int i = 0; i < 4096; i++)
    dung_bg1_attr_table[i] = TileHasVisiblePixels(top[i]) ? top_attr[i] : middle_attr[i];
  dung_layout_and_starting_quadrant = 0;
  GbaAlttp_ApplyDungeonPalette();
  return true;
}

void GbaAlttp_ApplyDungeonGraphics(void) {
  if (!GbaAlttp_IsPalaceRoom(dungeon_room_index))
    return;
  if (g_gba_alttp_asset_sizes[kGbaAssetBgGraphics] == 512 * 32)
    memcpy(&g_zenv.vram[0x2000], g_gba_alttp_asset_ptrs[kGbaAssetBgGraphics], 512 * 32);
}

void GbaAlttp_ApplyDungeonPalette(void) {
  if (!GbaAlttp_IsPalaceRoom(dungeon_room_index))
    return;
  const uint8 *header = GbaAlttp_GetRoomHeader(dungeon_room_index);
  const uint8 *ids = g_gba_alttp_asset_ptrs[kGbaAssetPaletteIds];
  size_t count = g_gba_alttp_asset_sizes[kGbaAssetPaletteIds];
  for (size_t i = 0; i < count; i++) {
    if (ids[i] != header[1])
      continue;
    MemBlk palette = FindIndexInMemblk(GbaAsset(kGbaAssetBgPalettes), i);
    if (palette.size == 6 * 16 * sizeof(uint16)) {
      memcpy(main_palette_buffer + 32, palette.ptr, palette.size);
      memcpy(aux_palette_buffer + 32, palette.ptr, palette.size);
    }
    return;
  }
}
