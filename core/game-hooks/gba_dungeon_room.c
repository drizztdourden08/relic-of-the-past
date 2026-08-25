/* @layer core-game-hooks @kind native */
#include "gba_alttp_internal.h"

#include <string.h>

#include "src/variables.h"

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
