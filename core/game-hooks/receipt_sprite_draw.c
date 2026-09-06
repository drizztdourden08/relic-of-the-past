/* @layer core-game-hooks @kind native */
// The one sprite-side receipt draw every physical substitution shares (the standing
// prizes, the key drops, the receive-crossing world items): sprite |k| rendered as the
// receipt art of grant id |grant| — a virtual id as its presentation item — with the same
// tiles, size flag and palette the hold-up presentation composes in
// Ancilla_ReceiveItem_Draw, through the shared animated-tile decode slot. The palette
// answers to the capacity icon (upgrade_icon.c) like the hold-up's does.
//
// OAM shape. A receipt is one 16x16 entry, or two 8x8 entries stacked (kReceiveItem_Tab1
// == 0: the rods, the bow, the blades, the arrow bundles...). A sprite's OAM region holds
// (sprite_flags2 & 0x1f) + 1 entries: its body entries, then the one slot
// SpriteDraw_Shadow writes at the end. Every vanilla draw these seams replace is a single
// body entry, so a two-tile receipt's bottom tile landed on the shadow slot and was
// overwritten by the shadow — the item's top half over a blob — or spilled past a
// shadowless sprite's region. The region is grown to fit the shape (the next frame's
// allocation in Sprite_TimersAndOam reads the count), and the shadow is skipped for the
// one frame its slot still lies past the region.
//
// TILES. The decode slot is one picture, uploaded once a frame, so two sprites drawn from
// it in the same frame would both show the last decode. Each draw therefore claims a
// private tile block (sprite_art_slots.c) and names it in its OAM entries; the seam
// commits the finished picture into that block once nothing else will repaint the slot.
//
// MEMO. While a hold-up receipt lives, the decode slot is the held-up item's and no draw
// may touch it. A seam that wants its sprite to keep showing its picture through those
// frames (a shelf behind a purchase's ceremony) asks for the memo: the finished picture
// of the sprite's last decoded frame, kept per sprite index and keyed by the grant it was
// drawn as, written into a claimed block without any decode.
#include "game_hooks_internal.h"
#include "sprite_art_slots.h"
#include "decode_slot.h"
#include "src/sprite.h"
#include "src/load_gfx.h"

typedef struct {
  bool valid;
  uint8 grant, pal, ext;
  uint8 art[SPRITE_ART_BYTES];
} ArtMemo;

static ArtMemo g_memo[16];

bool GameHook_HoldUpReceiptLive(void) {
  for (int i = 0; i < 10; i++) {
    if (ancilla_type[i] == 0x22) return true;
  }
  return false;
}

// Grow sprite |k|'s OAM region to |body| entries plus its shadow slot (when it casts one).
// True when this frame's region, allocated before the draw, already fits the whole shape.
static bool EnsureOamRegion(int k, int body) {
  int shadow = (sprite_flags3[k] & 0x10) ? 1 : 0;
  int count = sprite_flags2[k] & 0x1f;
  if (count + 1 >= body + shadow) return true;
  sprite_flags2[k] = (uint8)((sprite_flags2[k] & ~0x1f) | (body + shadow - 1));
  return false;
}

// The picture's one or two entries at |k|'s spot, then its shadow once the region has the
// slot for it. A two-tile receipt is one 8-pixel column, centred over the sprite's
// 16-pixel footprint (and the shadow drawn under it) instead of hugging its left edge.
static void WriteReceiptOam(int k, PrepOamCoordsRet *info, int x_adj, int y_adj,
                            uint8 art, uint8 pal, uint8 ext, bool fits) {
  OamEnt *oam = GetOamCurPtr();
  uint8 flags = (uint8)(pal * 2) | (info->flags & 0x30);
  uint16 x = info->x + x_adj + (ext == 0 ? 4 : 0), y = info->y + y_adj;
  SetOamHelper0(oam, x, y, art, flags, ext);
  if (ext == 0)
    SetOamHelper0(oam + 1, x, y + 8, (uint8)(art + SPRITE_ART_ROW_STRIDE), flags, 0);
  if (fits && (sprite_flags3[k] & 0x10))
    SpriteDraw_Shadow(k, info);
}

bool GameHook_DrawSpriteAsReceiptItem(int k, int grant, int x_adj, int y_adj) {
  if (grant < 0) return false;
  // A virtual id draws as its native presentation item (pure lookup): the upgrade's
  // refill item, or the progressive family's next tier from live inventory.
  uint8 item = GameHook_GrantPresentationOf((uint8)grant);
  // A rupee reward swaps in the numberless gem's receipt — its art, its 8x16 shape and
  // its palette row — instead of the numbered picture (rupee_gem_draw.c). Off, or for
  // anything that is not a rupee, |item| and the palette below are untouched.
  uint8 gem_pal = 0;
  bool gem = GameHook_ColoredRupeeGem(grant, &item, &gem_pal);
  uint8 gfx = kReceiveItemGfx[item];
  if (gfx == 0xff) return false;
  // Keep the vanilla art for the frames a live receipt holds the slot; the decode
  // below would corrupt the held-up item's tiles mid-animation.
  if (GameHook_HoldUpReceiptLive()) return false;
  // The quiver's receipt is a narrow arrow; its own picture is a wide one (retro_quiver_icon.c).
  // So is the meter upgrade's refill under its icon (upgrade_icon.c).
  uint8 ext = GameHook_QuiverShape(item, GameHook_ReceiptShapeFor((uint8)grant, kReceiveItem_Tab1[item]));
  int body = ext == 0 ? 2 : 1;
  bool fits = EnsureOamRegion(k, body);
  // The body alone may still fit a region that lacks the shadow slot; when even that
  // fails (a shadowless one-entry sprite), this one frame keeps vanilla art.
  if (!fits && (sprite_flags2[k] & 0x1f) < body - 1) return false;
  // Re-decoded every drawn frame, so any other user of the shared slot (a receipt that
  // just finished, a text box's story-sheet scribble) is repaired the next frame — the
  // same per-frame repair pattern as receipt_gfx_guard.c.
  DecodeAnimatedSpriteTile_variable(gfx);
  // The gem's two colour indices, pointed at the pair this denomination reads in.
  GameHook_TintRupeeGem(grant);
  // A blade or a shield reads its colours out of the player's own equipment row, so the
  // decode above is the right shape in the wrong colours. Its fixed-palette picture goes
  // over the decode here, before the icon and the glint, and the palette read below
  // answers with that picture's row (gear_icon.c).
  GameHook_WriteGearArt(item);
  // The quiver's own picture over the arrow the retro bow hands it over as.
  GameHook_WriteQuiverArt(item);
  uint8 pal = gem ? gem_pal : GameHook_ReceiptPaletteFor((uint8)grant, kWishPond2_OamFlags[item]);
  if (sign8(pal)) pal = 5;  // the receipt's own fallback palette for its animated ids
  // Last say, and only for the ids whose picture was just replaced above: the eight gear
  // ids, and the quiver's receipt.
  if (!gem) pal = GameHook_QuiverPalette(item, GameHook_GearPalette(item, pal));
  // The glint runs over whatever ends up in the slot, so it is armed here and applied by
  // the caller once any capacity icon has been written over this decode (item_sheen.c).
  GameHook_ArmItemSheen(pal, GameHook_IsRupeeReceipt(grant));
  // What the memo will keep once the caller commits this frame's picture.
  g_memo[k].grant = (uint8)grant;
  g_memo[k].pal = pal;
  g_memo[k].ext = ext;
  g_memo[k].valid = false;
  PrepOamCoordsRet info;
  if (Sprite_PrepOamCoordOrDoubleRet(k, &info))
    return true;
  WriteReceiptOam(k, &info, x_adj, y_adj, GameHook_ClaimSpriteArt(k), pal, ext, fits);
  return true;
}

void GameHook_MemoSpriteArt(int k, int grant) {
  ArtMemo *memo = &g_memo[k];
  if (grant < 0 || memo->grant != (uint8)grant) return;
  memcpy(memo->art, g_ram + DECODE_SLOT_ADDR, SPRITE_ART_BYTES);
  memo->valid = true;
}

bool GameHook_DrawSpriteArtFromMemo(int k, int grant, int x_adj, int y_adj) {
  ArtMemo *memo = &g_memo[k];
  if (grant < 0 || !memo->valid || memo->grant != (uint8)grant) return false;
  int body = memo->ext == 0 ? 2 : 1;
  bool fits = EnsureOamRegion(k, body);
  if (!fits && (sprite_flags2[k] & 0x1f) < body - 1) return false;
  PrepOamCoordsRet info;
  if (Sprite_PrepOamCoordOrDoubleRet(k, &info))
    return true;
  uint8 art = GameHook_ClaimSpriteArt(k);
  GameHook_CommitSpriteArtBytes(k, memo->art);
  WriteReceiptOam(k, &info, x_adj, y_adj, art, memo->pal, memo->ext, fits);
  return true;
}
