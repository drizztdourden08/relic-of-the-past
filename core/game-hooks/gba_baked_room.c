/* @layer core-game-hooks @kind native */
/**
 * Installs a bank room the way the second cartridge's own engine consumes it.
 *
 * The port ships each room pre-expanded: three flat tilemap layers and a collision byte per
 * cell per layer. Its engine draws those directly and never runs a drawing program, so this
 * loader does the same — copy the layers into the engine's map buffers, fold the two upper
 * layers into one with the port's layer-wide priority preserved per tile, install the port's
 * own collision, then register the verified door records through the engine's door path so
 * shutters, exits and teleport travel stay native. The attribute overlay carries the few
 * per-cell translations into this engine's attribute language (exit doorway stripes, and
 * corrections where the collision conversion is still wrong).
 *
 * A bank id with no room installs a sealed void instead, so a stray edge transition parks the
 * player in a dead room rather than reaching the base grid. With the dungeon absent or the
 * setting off, the loader declines and the vanilla path runs untouched.
 */
#include "gba_alttp_internal.h"

#include <string.h>

#include "src/variables.h"
#include "src/zelda_rtl.h"
#include "src/dungeon.h"

enum { kCellsPerLayer = 4096, kLayerBytes = 0x2000, kAttrBytes = 0x1000, kLayersPerRoom = 3 };
enum { kAttrSolid = 0x01, kPriority = 0x2000 };
bool GbaAlttp_IsBakedRoomActive(void) {
  return player_is_indoors && GbaAlttp_IsBankRoom(dungeon_room_index);
}

/**
 * Collision comes from the engine's own attribute pass over the installed words — the same
 * derivation every vanilla room gets, and the one the stream era already proved correct for
 * these rooms. The port's converted collision arrays stay in the container as diagnostics
 * only; installing them directly put water on statues and holes in walls (the conversion's
 * tile-id masking bug). Void rooms are the exception: their sealed attributes must survive,
 * so the pass stands down for them.
 */
bool GbaAlttp_SkipAttrLoadForVoidRoom(void) {
  return GbaAlttp_IsBakedRoomActive() && GbaAlttpFindRoom(dungeon_room_index) < 0;
}

static bool TileHasVisiblePixels(uint16 map_word) {
  int tile = map_word & 0x3ff;
  const uint8 *gfx = g_gba_alttp_asset_ptrs[kGbaAssetBgGfxSnes4bpp] + tile * 32;
  for (int i = 0; i < 32; i++) {
    if (gfx[i])
      return true;
  }
  return false;
}

static void InstallVoidRoom(void) {
  memset(dung_bg2, 0, kLayerBytes);
  memset(dung_bg1, 0, kLayerBytes);
  memset(dung_bg2_attr_table, kAttrSolid, kAttrBytes);
  memset(dung_bg1_attr_table, kAttrSolid, kAttrBytes);
  dung_layout_and_starting_quadrant = 0;
}

/** Runs at the tail of the attribute pass, so the corrections land on the derived table. */
void GbaAlttp_ApplyBakedAttrOverlay(void) {
  if (!GbaAlttp_IsBakedRoomActive())
    return;
  int index = GbaAlttpFindRoom(dungeon_room_index);
  if (index < 0)
    return;
  MemBlk overlay = FindIndexInMemblk(GbaAlttpAsset(kGbaAssetAttrOverlays), index);
  for (size_t at = 0; at + 4 <= overlay.size; at += 4) {
    uint16 cell = (uint16)(overlay.ptr[at + 1] | (overlay.ptr[at + 2] << 8));
    if (cell >= kCellsPerLayer)
      continue;
    (overlay.ptr[at] ? dung_bg1_attr_table : dung_bg2_attr_table)[cell] = overlay.ptr[at + 3];
  }
}

static void RegisterDoors(uint16 room) {
  const uint16 *doors = GbaAlttp_GetRoomDoors(room);
  if (!doors)
    return;
  Dungeon_PrepDoorDrawLayer();
  for (int i = 0; doors[i] != 0xffff; i++)
    RoomData_DrawObject_Door(doors[i]);
  Dungeon_LoadDoorAttribute();
}

bool GbaAlttp_LoadBakedRoom(void) {
  if (!GbaAlttp_IsBakedRoomActive())
    return false;
  int index = GbaAlttpFindRoom(dungeon_room_index);
  if (index < 0) {
    InstallVoidRoom();
    return true;
  }

  MemBlk bottom = FindIndexInMemblk(GbaAlttpAsset(kGbaAssetRoomLayersSnes), index * kLayersPerRoom + 0);
  MemBlk middle = FindIndexInMemblk(GbaAlttpAsset(kGbaAssetRoomLayersSnes), index * kLayersPerRoom + 1);
  MemBlk top = FindIndexInMemblk(GbaAlttpAsset(kGbaAssetRoomLayersSnes), index * kLayersPerRoom + 2);
  if (bottom.size != kLayerBytes || middle.size != kLayerBytes || top.size != kLayerBytes) {
    InstallVoidRoom();
    return true;
  }

  memcpy(dung_bg2, bottom.ptr, kLayerBytes);
  const uint16 *middle_words = (const uint16 *)middle.ptr;
  const uint16 *top_words = (const uint16 *)top.ptr;
  for (int i = 0; i < kCellsPerLayer; i++) {
    /* The port's top layer draws in front of the player wholesale; this engine carries that
       per tile, so a visible top tile arrives with its priority bit set. */
    bool top_visible = TileHasVisiblePixels(top_words[i]);
    dung_bg1[i] = top_visible ? (uint16)(top_words[i] | kPriority) : middle_words[i];
  }

  /* Layout 7 is a full-size 512x512 room to the quadrant camera (kLayoutQuadrantFlags);
     anything narrower makes the camera treat the room as 256px pages and refuse to pan. */
  dung_layout_and_starting_quadrant = 7 << 2;
  RegisterDoors(dungeon_room_index);
  return true;
}
