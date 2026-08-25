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
/**
 * Raw tile runs: the cells no object in the vocabulary can express.
 *
 * The cartridge re-baked some room art with arrangements the drawing language cannot
 * produce - the recovered stream covers everything structural, and what remains is written
 * by this object, implemented in the drawing switch's reserved empty slot the way the
 * original game would have added one. Each use consumes the next run from the room's data:
 * a width, a height, then width*height tile words, drawn at the object's own position
 * through the same destination pointer every other object writes through.
 *
 * The cursor arms when the room's stream is fetched, which happens exactly once per room
 * load; with the dungeon absent or disabled the slot stays the no-op it always was.
 */
static const uint8 *g_raw_runs;
static const uint8 *g_raw_runs_end;

static void BeginRoomRawRuns(uint16 room) {
  g_raw_runs = g_raw_runs_end = NULL;
  int index = GbaAlttpFindRoom(room);
  if (index < 0)
    return;
  MemBlk runs = FindIndexInMemblk(GbaAlttpAsset(kGbaAssetRoomRawRuns), index);
  g_raw_runs = runs.ptr;
  g_raw_runs_end = runs.ptr + runs.size;
}

void GbaAlttp_DrawRawRun(uint16 *dst) {
  enum { kMapStride = 64 };
  if (!g_raw_runs || g_raw_runs + 2 > g_raw_runs_end)
    return;
  int width = g_raw_runs[0], height = g_raw_runs[1];
  g_raw_runs += 2;
  for (int y = 0; y < height; y++) {
    for (int x = 0; x < width; x++) {
      if (g_raw_runs + 2 > g_raw_runs_end)
        return;
      dst[y * kMapStride + x] = (uint16)(g_raw_runs[0] | (g_raw_runs[1] << 8));
      g_raw_runs += 2;
    }
  }
}

extern const uint8 *GbaAlttp_VoidRoomStream(void);

const uint8 *GbaAlttp_GetRoomLayout(uint16 room) {
  if (!GbaAlttp_IsBankRoom(room))
    return NULL;
  BeginRoomRawRuns(room);
  int index = GbaAlttpFindRoom(room);
  if (index >= 0) {
    MemBlk layout = FindIndexInMemblk(GbaAlttpAsset(kGbaAssetRoomLayouts), index);
    if (layout.size > 2)
      return layout.ptr;
  }
  return GbaAlttp_VoidRoomStream();
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
