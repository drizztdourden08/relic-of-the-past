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

bool GbaAlttp_IsBankRoom(uint16 room) {
  enum { kBankFirstRoom = 0x140, kBankEndRoom = 0x280 };
  return GbaAlttp_IsAvailable() && room >= kBankFirstRoom && room < kBankEndRoom;
}

/**
 * The room a stray edge transition lands in: bank slots the dungeon does not own.
 *
 * Floor zero, layout zero, three empty object sections. Its own derived collision seals it -
 * nothing registers, nothing is walkable beyond the edges - so wandering off the dungeon's
 * boundary parks the player in a dead room instead of a base-game one. The base grid can no
 * longer be reached from the bank at all.
 */
static const uint8 kVoidRoomStream[] = { 0x00, 0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff };
static const uint8 kVoidRoomHeader[14];

const uint8 *GbaAlttp_VoidRoomStream(void) { return kVoidRoomStream; }

const uint8 *GbaAlttp_GetRoomHeader(uint16 room) {
  int index = GbaAlttpFindRoom(room);
  if (index >= 0)
    return FindIndexInMemblk(GbaAlttpAsset(kGbaAssetRoomHeaders), index).ptr;
  return GbaAlttp_IsBankRoom(room) ? kVoidRoomHeader : NULL;
}

/**
 * The doors that REGISTER, as opposed to the doors that draw.
 *
 * The room stream carries every recovered door record, because their art is part of the baked
 * map; this table is the subset whose destinations were verified to stay inside the dungeon,
 * and it is what the engine's attribute pass reads. A drawn-but-unregistered door stays
 * sealed. Verified against original hardware room by room; when a sealed door turns out to
 * work on the cartridge, it moves into this list as data.
 */
const uint16 *GbaAlttp_GetRoomDoors(uint16 room) {
  int index = GbaAlttpFindRoom(room);
  if (index < 0)
    return GbaAlttp_IsBankRoom(room) ? kNoDoors : NULL;
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
static const uint8 kNoSprites[] = { 0x00, 0xff };
static const uint8 kNoSecrets[] = { 0xff, 0xff };

const uint8 *GbaAlttp_GetRoomSprites(uint16 room) {
  int index = GbaAlttpFindRoom(room);
  if (index >= 0)
    return FindIndexInMemblk(GbaAlttpAsset(kGbaAssetRoomEntities), index).ptr;
  return GbaAlttp_IsBankRoom(room) ? kNoSprites : NULL;
}

/** This dungeon's secret/pot-drop list. Native format too, so also a pointer swap. */
const uint8 *GbaAlttp_GetRoomSecrets(uint16 room) {
  int index = GbaAlttpFindRoom(room);
  if (index >= 0)
    return FindIndexInMemblk(GbaAlttpAsset(kGbaAssetRoomSecrets), index).ptr;
  return GbaAlttp_IsBankRoom(room) ? kNoSecrets : NULL;
}
