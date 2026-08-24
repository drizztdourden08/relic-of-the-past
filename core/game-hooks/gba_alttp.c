/* @layer core-game-hooks @kind native */
#include "gba_alttp_internal.h"

#include <string.h>

#include "src/variables.h"
#include "src/zelda_rtl.h"

const uint8 *g_gba_alttp_asset_ptrs[kGbaAlttpAssetCount];
uint32 g_gba_alttp_asset_sizes[kGbaAlttpAssetCount];

// Opt-in, so a build that never pushes the setting behaves exactly like the base game.
static bool g_extra_dungeon_enabled;
static const uint16 kNoDoors[] = { 0xffff };

void GbaAlttp_SetExtraDungeonEnabled(bool enabled) {
  g_extra_dungeon_enabled = enabled;
}

bool GbaAlttp_IsExtraDungeonEnabled(void) {
  return g_extra_dungeon_enabled;
}

MemBlk GbaAlttpAsset(int index) {
  return (MemBlk) { g_gba_alttp_asset_ptrs[index], g_gba_alttp_asset_sizes[index] };
}

int GbaAlttpFindRoom(uint16 room) {
  const uint16 *ids = (const uint16 *)g_gba_alttp_asset_ptrs[kGbaAssetRoomIds];
  size_t count = g_gba_alttp_asset_sizes[kGbaAssetRoomIds] / sizeof(uint16);
  for (size_t i = 0; i < count; i++) {
    if (ids[i] == room)
      return (int)i;
  }
  return -1;
}

bool GbaAlttp_IsAvailable(void) {
  return g_gba_alttp_asset_ptrs[kGbaAssetRoomIds] != NULL;
}

// Derived from the room rather than a lifecycle flag: the engine enters and leaves through
// its own entrance and exit tables now, so there is no longer a moment we own in which to
// set or clear one, and a stale flag was a bug waiting to happen.
bool GbaAlttp_IsPalaceRoom(uint16 room) {
  return GbaAlttp_IsAvailable() && g_extra_dungeon_enabled && GbaAlttpFindRoom(room) >= 0;
}

// Indoors matters as much as the room id: leaving does not clear dungeon_room_index, so a
// room-only test stays true out on the overworld and the graphics/palette hooks re-upload
// the dungeon's tiles over the overworld ones.
bool GbaAlttp_IsPalaceActive(void) {
  return player_is_indoors && GbaAlttp_IsPalaceRoom(dungeon_room_index);
}

const uint8 *GbaAlttp_GetRoomHeader(uint16 room) {
  int index = GbaAlttpFindRoom(room);
  return index < 0 ? NULL : FindIndexInMemblk(GbaAlttpAsset(kGbaAssetRoomHeaders), index).ptr;
}

const uint16 *GbaAlttp_GetRoomDoors(uint16 room) {
  int index = GbaAlttpFindRoom(room);
  if (index < 0)
    return NULL;
  MemBlk doors = FindIndexInMemblk(GbaAlttpAsset(kGbaAssetRoomDoors), (size_t)index);
  return doors.size >= sizeof(uint16) ? (const uint16 *)doors.ptr : kNoDoors;
}

/**
 * This dungeon's enemy spawn list, in the engine's own format.
 *
 * The port stores spawns exactly as the base game does — a sort byte, three-byte records, a
 * terminator — so this is a pointer swap, not a conversion. NULL for any other room, which is
 * what makes the caller fall through to the base table.
 */
const uint8 *GbaAlttp_GetRoomSprites(uint16 room) {
  int index = GbaAlttpFindRoom(room);
  if (index < 0 || !GbaAlttp_IsPalaceRoom(room))
    return NULL;
  return FindIndexInMemblk(GbaAlttpAsset(kGbaAssetRoomEntities), index).ptr;
}

/** This dungeon's secret/pot-drop list. Native format too, so also a pointer swap. */
const uint8 *GbaAlttp_GetRoomSecrets(uint16 room) {
  int index = GbaAlttpFindRoom(room);
  if (index < 0 || !GbaAlttp_IsPalaceRoom(room))
    return NULL;
  return FindIndexInMemblk(GbaAlttpAsset(kGbaAssetRoomSecrets), index).ptr;
}
