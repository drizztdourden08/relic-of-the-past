/* @layer core-game-hooks @kind native */
// Draw-only substitution for the receive-crossing world item ANCILLAE: the falling
// milestone prize (the two stone-tablet rewards) and the dug-up instrument reveal.
// Both spawn with the VANILLA item id, fly/fall for many frames drawing vanilla art,
// and only substitute at pickup (the Link_ReceiveItem seam), so without this the
// player watches the wrong item fall. The ancilla counterpart of world_item_draws.c:
// no table of its own, every decision comes from the armed npc-override entries via
// GameHook_PeekNpcGrantItem (gate enforced inside the peek; nothing armed -> the
// caller keeps the vanilla draw, byte for byte).
//
// A rupee reward takes the same coloured-gem swap the ground drops and the hold-up
// take, under its own gate (kFeatures3_ColoredRupees, enforced inside rupee_gem_draw.c),
// so an airborne 50 is the violet gem instead of the numbered green picture.
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

// What this draw actually puts on screen, once the icon and coloured-gem swaps have had their say.
typedef struct {
  uint8 item;  // the receipt id whose art, shape and tiles the draw uses
  uint8 row;   // the palette row to force onto the written entries, or 0xff for none
  bool icon;   // a capacity icon goes over the decode (upgrade_icon.c)
} ReceiptArt;

// The receipt a capacity icon rides on: the fifty-rupee one, only because it is a WIDE
// 16x16 receipt. The icon replaces its whole picture, so none of its own art shows, and
// its wide shape is what the icon needs even when the family presents as a narrow refill.
#define ICON_CARRIER_RECEIPT 0x41

// A capacity upgrade (the wallet, the bomb, arrow and magic capacity families) has no native
// picture and draws as its family icon, on the icon's own palette row, exactly as the standing
// and drop seams draw it. The question is asked with the RAW assigned id, since the icon is
// keyed on it, and it answers only with kFeatures3_CapacityProfile up and the icon file loaded.
// A rupee reward draws as the numberless gem in its denomination's colour instead of the
// game's numbered picture, the same swap the ground drops and the hold-up already make
// (rupee_gem_draw.c). Keyed on the RAW assigned id, never the presentation one, so a
// capacity or progressive grant that merely presents as a rupee receipt keeps its own
// icon and palette. With kFeatures3_ColoredRupees down, nothing is swapped.
static ReceiptArt ReceiptArtOf(int grant, int item) {
  ReceiptArt art = { (uint8)item, 0xff, false };
  uint8 icon_row = grant >= 0 ? GameHook_ReceiptPaletteFor((uint8)grant, 0xff) : 0xff;
  if (icon_row != 0xff) {
    art.item = ICON_CARRIER_RECEIPT;
    art.row = icon_row;
    art.icon = true;
    return art;
  }
  uint8 gem_item = 0, gem_row = 0;
  if (GameHook_ColoredRupeeGem(grant, &gem_item, &gem_row)) {
    art.item = gem_item;
    art.row = gem_row;
  }
  return art;
}

// Draw ancilla |k| as the assigned item through the game's own receipt draw: the item id
// and the receipt palette slot are swapped in around the vanilla call and restored, so
// shape, clamping and the advanced OAM pointer stay exactly the vanilla routine's.
// |grant| is the raw assigned id, |art| what ReceiptArtOf settled on for it.
static OamEnt *DrawAncillaAsReceiptItem(int k, int grant, ReceiptArt art, int x, int y) {
  GameHook_DecodeReceiptTiles(kReceiveItemGfx[art.item]);
  // A capacity upgrade's icon over the carrier's fresh decode.
  if (art.icon) GameHook_WriteUpgradeIconFor((uint8)grant);
  // The gem's two colour indices pointed at this denomination's pair, over the world
  // rupee's own current shine picture, so a gem falling from the sky glints with every
  // other rupee on screen. No-op for anything that is not a rupee reward.
  GameHook_TintRupeeGem(grant);
  // A blade or a shield decodes in the right shape and the wrong colours, because its
  // palette row holds the PLAYER's equipment; its fixed-palette picture goes over the
  // decode here (gear_icon.c). No-op for every other id, and with the gate down.
  GameHook_WriteGearArt(art.item);
  // The quiver's own picture over the arrow it arrives as; the vendored draw below asks
  // for its row and size itself (retro_quiver_icon.c).
  GameHook_WriteQuiverArt(art.item);
  uint8 saved_item = ancilla_item_to_link[k];
  uint8 saved_pal = ancilla_arr4[k];
  ancilla_item_to_link[k] = art.item;
  ancilla_arr4[k] = 5;  // the receipt's own fallback palette for its animated ids
  OamEnt *start = GetOamCurPtr();
  OamEnt *oam = Ancilla_ReceiveItem_Draw(k, x, y);
  // The vendored draw picks its palette row through reads shared with the hold-up
  // ceremony, which must keep answering natively, so the row for the picture written
  // above is applied to the entries it just wrote instead. Palette is bits 1-3 of the
  // OAM flags byte. Asking with an impossible native means the gear branch only runs for
  // the eight affected ids, and never with the gate down or no file loaded.
  uint8 row = art.row != 0xff ? art.row : GameHook_GearPalette(art.item, 0xff);
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
  uint8 vanilla = ancilla_item_to_link[k];
  int item = GameHook_PeekNpcGrantItem(vanilla);
  if (item < 0 || kReceiveItemGfx[item] == 0xff) return NULL;
  // Keep the vanilla art for the frames a live receipt holds the slot; the decode
  // would corrupt the held-up item's tiles mid-animation.
  if (ReceiptOwnsDecodeSlot()) return NULL;
  int grant = GameHook_PeekNpcGrantRaw(vanilla);
  return DrawAncillaAsReceiptItem(k, grant, ReceiptArtOf(grant, item), x, y);
}

// The dug-up instrument reveal. Its vanilla grant id is 0x14; its vanilla draw is a
// single fixed animated tile, decoded once at spawn. True when the assigned item was
// drawn instead: the caller skips its own OAM write but keeps its off-screen check
// (the receipt draw writes the same first OAM entry with the same clamping).
bool GameHook_DrawDugUpItemOverride(int k, int x, int y) {
  int item = GameHook_PeekNpcGrantItem(0x14);
  if (item < 0 || kReceiveItemGfx[item] == 0xff) return false;
  if (ReceiptOwnsDecodeSlot()) return false;
  int grant = GameHook_PeekNpcGrantRaw(0x14);
  ReceiptArt art = ReceiptArtOf(grant, item);
  // This ancilla's per-frame OAM allocation is a single entry; a two-tile receipt
  // shape needs a second. Grow the allocation and let this one frame (the reveal's
  // first, still underground) keep vanilla art; every following frame substitutes.
  // The shape read is the SWAPPED id's, because the gem a rupee reward draws as is a
  // two-tile shape where the numbered picture it replaced was one.
  if (kReceiveItem_Tab1[art.item] == 0 && ancilla_numspr[k] < 8) {
    ancilla_numspr[k] = 8;
    return false;
  }
  DrawAncillaAsReceiptItem(k, grant, art, x, y);
  return true;
}
