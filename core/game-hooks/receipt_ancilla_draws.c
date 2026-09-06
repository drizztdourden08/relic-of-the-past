/* @layer core-game-hooks @kind native */
// Draw-only substitution for the receive-crossing world item ANCILLAE — the falling
// milestone prize (the two stone-tablet rewards) and the dug-up instrument reveal.
// Both spawn with the VANILLA item id, fly/fall for many frames drawing vanilla art,
// and only substitute at pickup (the Link_ReceiveItem seam) — so without this the
// player watches the wrong item fall. The ancilla counterpart of world_item_draws.c:
// no table of its own, every decision comes from the armed npc-override entries via
// GameHook_PeekNpcGrantItem (gate enforced inside the peek; nothing armed -> the
// caller keeps the vanilla draw, byte for byte).
#include "game_hooks_internal.h"
#include "src/ancilla.h"
#include "src/load_gfx.h"

// True while a hold-up receipt owns the shared animated-tile decode slot (the same
// guard as the sprite-side draw overrides; these ancillae are killed before their
// pickup spawns that receipt, so this only defers for an unrelated concurrent grant).
static bool ReceiptOwnsDecodeSlot(void) {
  for (int i = 0; i < 10; i++) {
    if (ancilla_type[i] == 0x22) return true;
  }
  return false;
}

// Draw ancilla |k| as |item| through the game's own receipt draw: the item id and the
// receipt palette slot are swapped in around the vanilla call and restored, so shape,
// clamping and the advanced OAM pointer stay exactly the vanilla routine's.
static OamEnt *DrawAncillaAsReceiptItem(int k, int item, int x, int y) {
  DecodeAnimatedSpriteTile_variable(kReceiveItemGfx[item]);
  // A blade or a shield decodes in the right shape and the wrong colours, because its
  // palette row holds the PLAYER's equipment; its fixed-palette picture goes over the
  // decode here (gear_icon.c). No-op for every other id, and with the gate down.
  GameHook_WriteGearArt((uint8)item);
  // The quiver's own picture over the arrow it arrives as; the vendored draw below asks
  // for its row and size itself (retro_quiver_icon.c).
  GameHook_WriteQuiverArt((uint8)item);
  uint8 saved_item = ancilla_item_to_link[k];
  uint8 saved_pal = ancilla_arr4[k];
  ancilla_item_to_link[k] = (uint8)item;
  ancilla_arr4[k] = 5;  // the receipt's own fallback palette for its animated ids
  OamEnt *start = GetOamCurPtr();
  OamEnt *oam = Ancilla_ReceiveItem_Draw(k, x, y);
  // The vendored draw picks its palette row through a read shared with the hold-up
  // ceremony, which must keep answering natively — so the row for the picture written
  // above is applied to the entries it just wrote instead. Palette is bits 1-3 of the
  // OAM flags byte. Asking with an impossible native means the loop only runs for the
  // eight affected ids, and never with the gate down or no file loaded.
  uint8 row = GameHook_GearPalette((uint8)item, 0xff);
  if (row != 0xff) {
    for (OamEnt *e = start; e < oam; e++) e->flags = (uint8)((e->flags & ~0x0e) | (row * 2));
  }
  ancilla_item_to_link[k] = saved_item;
  ancilla_arr4[k] = saved_pal;
  return oam;
}

// The falling milestone prize. Returns the advanced OAM pointer when the assigned
// item was drawn, NULL when the caller must draw vanilla art itself.
OamEnt *GameHook_DrawFallingPrizeOverride(int k, int x, int y) {
  int item = GameHook_PeekNpcGrantItem(ancilla_item_to_link[k]);
  if (item < 0 || kReceiveItemGfx[item] == 0xff) return NULL;
  // Keep the vanilla art for the frames a live receipt holds the slot; the decode
  // would corrupt the held-up item's tiles mid-animation.
  if (ReceiptOwnsDecodeSlot()) return NULL;
  return DrawAncillaAsReceiptItem(k, item, x, y);
}

// The dug-up instrument reveal. Its vanilla grant id is 0x14; its vanilla draw is a
// single fixed animated tile, decoded once at spawn. True when the assigned item was
// drawn instead — the caller skips its own OAM write but keeps its off-screen check
// (the receipt draw writes the same first OAM entry with the same clamping).
bool GameHook_DrawDugUpItemOverride(int k, int x, int y) {
  int item = GameHook_PeekNpcGrantItem(0x14);
  if (item < 0 || kReceiveItemGfx[item] == 0xff) return false;
  if (ReceiptOwnsDecodeSlot()) return false;
  // This ancilla's per-frame OAM allocation is a single entry; a two-tile receipt
  // shape needs a second. Grow the allocation and let this one frame (the reveal's
  // first, still underground) keep vanilla art; every following frame substitutes.
  if (kReceiveItem_Tab1[item] == 0 && ancilla_numspr[k] < 8) {
    ancilla_numspr[k] = 8;
    return false;
  }
  DrawAncillaAsReceiptItem(k, item, x, y);
  return true;
}
