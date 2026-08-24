/* @layer core-game-hooks @kind native */
#include "gba_alttp_internal.h"

#include <string.h>

#include "src/variables.h"
#include "src/dungeon.h"

/**
 * This room in the engine's own room format.
 *
 * A room is a drawing program - a floor byte, a layout byte, then sections of three-byte objects
 * and two-byte door records - and running it is what produces the tilemap AND registers
 * everything built on top of it: doors, staircases, collision, tile priority, the layout the
 * camera sizes itself from. The second cartridge shipped its rooms pre-expanded into flat
 * tilemaps, so none of that ran, and each piece had to be restored separately.
 *
 * The extraction recovers the stream instead, so all of it comes back at once and this reduces
 * to handing the engine a different pointer. Everything after that is the engine's own code path
 * for every other room in the game, unmodified.
 */
const uint8 *GbaAlttp_GetRoomLayout(uint16 room) {
  if (!GbaAlttp_IsPalaceRoom(room))
    return NULL;
  int index = GbaAlttpFindRoom(room);
  if (index < 0)
    return NULL;
  MemBlk layout = FindIndexInMemblk(GbaAlttpAsset(kGbaAssetRoomLayouts), index);
  return layout.size > 2 ? layout.ptr : NULL;
}

/**
 * Upload this dungeon's background sheet.
 *
 * The shapes are the base game's own: five of the eight 64-tile sheets are byte-identical in
 * planes 0-2, and 453 of 512 tiles overall. What differs is the fourth plane. The base game
 * stores background art as 3bpp and synthesises plane 3 on load, either as zero or as the OR
 * of the other three, chosen per VRAM slot; this port stores real 4bpp and re-encoded three
 * of those sheets to carry their colour in the palette instead. So the engine's own expansion
 * would put the right shapes on screen in the wrong colours, and the sheet has to arrive
 * whole. The room records still name the native theme indices, which is what everything the
 * engine DERIVES from a blockset — the collision bank, the animated-tile set — reads.
 */
void GbaAlttp_ApplyDungeonGraphics(void) {
  if (!GbaAlttp_IsPalaceActive())
    return;
  if (g_gba_alttp_asset_sizes[kGbaAssetBgGfxSnes4bpp] == 512 * 32)
    memcpy(&g_zenv.vram[0x2000], g_gba_alttp_asset_ptrs[kGbaAssetBgGfxSnes4bpp], 512 * 32);
}
