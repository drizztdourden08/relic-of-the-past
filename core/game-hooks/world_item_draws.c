/* @layer core-game-hooks @kind native */
// Draw-only substitution for the receive-crossing world item SPRITES: the in-world
// pickups whose grants already substitute at the native receive seam (npc_overrides.c)
// but whose on-the-ground art stayed vanilla: the standing fungus, the shelved tome,
// the thrown/regurgitated reward sprite, and the pedestal blade. Each renders as the
// item its pickup will actually grant, via the shared sprite-side receipt draw
// (receipt_sprite_draw.c), the same draw drop_overrides.c / standing_overrides.c use.
//
// No table and no arming of its own: every decision comes from the armed npc-override
// entries through GameHook_PeekNpcGrantItem, so the drawn item can never disagree with
// the granted one, and the gate (kFeatures3_NpcOverrides, stripped by Vanilla Safe) is
// enforced inside the peek. Peek says nothing armed -> the caller draws vanilla art.
#include "game_hooks_internal.h"
#include "sprite_art_slots.h"

// The id handed to the shared receipt draw. The peek answers with the presentation item,
// which is the right picture for a native or progressive grant. A capacity family has no
// native picture: its icon, the icon's palette row and its OAM size are all looked up from
// the RAW assigned id (upgrade_icon.c), and its presentation alone is a rupee or refill
// receipt, which the coloured-gem swap then draws as a gem. So a virtual id goes in raw, the
// same id the standing and drop seams pass. Any other id, a prize crystal included, keeps the
// peek's answer.
static int DrawGrantOf(uint8 vanilla_item) {
  int item = GameHook_PeekNpcGrantItem(vanilla_item);
  if (item < 0) return item;
  int raw = GameHook_PeekNpcGrantRaw(vanilla_item);
  return raw >= 0 && GameHook_IsVirtualGrantId((uint8)raw) ? raw : item;
}

// A capacity upgrade's icon over the presentation's fresh decode, then the glint over
// whatever ended up in the slot (item_sheen.c), then the finished picture into this sprite's
// own tiles so a second substituted sprite drawn later this frame cannot overwrite it
// (sprite_art_slots.c). Each is off with its own gate, and all run only after a real draw.
static bool Finish(int k, int grant, bool drawn) {
  if (!drawn) return false;
  GameHook_WriteUpgradeIconFor((uint8)grant);
  GameHook_ApplyItemSheen();
  GameHook_CommitSpriteArt(k);
  return true;
}

bool GameHook_DrawWorldItemOverride(int k, uint8 vanilla_item) {
  int grant = DrawGrantOf(vanilla_item);
  return Finish(k, grant, GameHook_DrawSpriteAsReceiptItem(k, grant, 0, 0));
}

// The blade this draw replaces is six 8x8 tiles at x-8/x+0 and y-8/y+0/y+8
// (sprite_main.c MasterSword_Draw), so its tiles span 16 wide from x-8 and 24 tall from
// y-8. The picture inside those tiles is not centred on them: the blade and its crossguard
// are drawn about the column between x+1 and x+2, which is also the centre of the stone's
// sword hole (both measured on a captured frame). Every receipt shape is 16 tall (one 16x16
// entry, or two 8x8 stacked) and 16 wide once WriteReceiptOam has centred a narrow one, so
// one offset centres any item: its middle on the blade's axis, its height on the tiles.
#define BLADE_AXIS_DX 2
#define BLADE_ART_Y (-8)
#define BLADE_ART_HEIGHT 24
#define RECEIPT_ART_SIDE 16

bool GameHook_DrawPedestalItemOverride(int k) {
  // Vanilla grant id at this pedestal is 1 (the receive-path id its script passes).
  int grant = DrawGrantOf(1);
  return Finish(k, grant, GameHook_DrawSpriteAsReceiptItem(k, grant,
                                                           BLADE_AXIS_DX - RECEIPT_ART_SIDE / 2,
                                                           BLADE_ART_Y + (BLADE_ART_HEIGHT - RECEIPT_ART_SIDE) / 2));
}
