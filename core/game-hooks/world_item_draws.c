/* @layer core-game-hooks @kind native */
// Draw-only substitution for the receive-crossing world item SPRITES — the in-world
// pickups whose grants already substitute at the native receive seam (npc_overrides.c)
// but whose on-the-ground art stayed vanilla: the standing fungus, the shelved tome,
// the thrown/regurgitated reward sprite, and the pedestal blade. Each renders as the
// item its pickup will actually grant, via the shared sprite-side receipt draw
// (receipt_sprite_draw.c) — the same draw drop_overrides.c / standing_overrides.c use.
//
// No table and no arming of its own: every decision comes from the armed npc-override
// entries through GameHook_PeekNpcGrantItem, so the drawn item can never disagree with
// the granted one, and the gate (kFeatures3_NpcOverrides, stripped by Vanilla Safe) is
// enforced inside the peek. Peek says nothing armed -> the caller draws vanilla art.
#include "game_hooks_internal.h"
#include "sprite_art_slots.h"

// The glint over whatever the draw just decoded, once nothing else will repaint the slot
// (item_sheen.c), and then the finished picture into this sprite's own tiles so a second
// substituted sprite drawn later this frame cannot overwrite it (sprite_art_slots.c).
// Both off with their gates, and both reached only by a draw that actually happened.
static bool WithSheen(int k, bool drawn) {
  if (!drawn) return false;
  GameHook_ApplyItemSheen();
  GameHook_CommitSpriteArt(k);
  return true;
}

bool GameHook_DrawWorldItemOverride(int k, uint8 vanilla_item) {
  return WithSheen(k, GameHook_DrawSpriteAsReceiptItem(k, GameHook_PeekNpcGrantItem(vanilla_item), 0, 0));
}

bool GameHook_DrawPedestalItemOverride(int k) {
  // The blade art spans 16px wide from x-8 and 24px tall from y-8; center the 16x16
  // receipt art on that span so the assigned item sits on the stone instead of beside
  // it. Vanilla grant id at this pedestal is 1 (the receive-path id its script passes).
  return WithSheen(k, GameHook_DrawSpriteAsReceiptItem(k, GameHook_PeekNpcGrantItem(1), -8, -8));
}
