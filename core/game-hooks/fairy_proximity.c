/* @layer core-game-hooks @kind native */
// The great fairy greets a player who is a whole screen away.
//
// Sprite_BigFairy's "is the player close" test (sprite_main.c) is 8-bit:
//
//   Sprite_DirectionToFaceLink(k, &pt);
//   if ((uint8)(pt.x + 0x30) < 0x60 && (uint8)(pt.y + 0x30) < 0x60)
//
// pt.x is a BYTE, so a player exactly 0x100 away wraps to a delta of 0 and reads as standing on
// top of the fairy. The fairy then greets, sets flag_is_link_immobilized, and spawns the healing
// cloud that owns the release. The cloud's own approach test uses honest 16-bit coordinates
// (Sprite_Get16BitCoords), correctly sees the player a screen away, and never reaches the 6x6
// window that starts the heal, so the heal never runs, the cloud never advances, and nothing
// ever clears the immobilize flag. The player is frozen where they stand.
//
// Measured on the reported save: the cloud sat motionless at dx = -256 exactly, with the refill
// still at 0, while the player was immobilized a screen away.
//
// Vanilla does not trip this because a 4:3 view never shows the fairy from that distance, so the
// player has no reason to stand there. A wider play area does, which is why this surfaces here.
//
// Gate: kFeatures0_ExtendedRendering, the master switch for the wider view that makes the
// standoff reachable. Off, the query is the caller's own 8-bit test verbatim.
#include "game_hooks_internal.h"

// The same half-window the vendored test uses, applied to the true distance.
#define FAIRY_GREET_RANGE 0x30

static int Distance16(int a, int b) {
  int d = a - b;
  return d < 0 ? -d : d;
}

bool GameHook_FairyGreetsLink(int k, bool vanilla_near) {
  if (!vanilla_near) return false;
  if (!(enhanced_features0 & kFeatures0_ExtendedRendering)) return vanilla_near;
  int sx = sprite_x_lo[k] | (sprite_x_hi[k] << 8);
  int sy = sprite_y_lo[k] | (sprite_y_hi[k] << 8);
  if (Distance16(link_x_coord, sx) < FAIRY_GREET_RANGE
      && Distance16(link_y_coord, sy) < FAIRY_GREET_RANGE) {
    return true;
  }
  printf("[BugFix] Fairy greeting refused: the player is %d,%d away, not adjacent\n",
         Distance16(link_x_coord, sx), Distance16(link_y_coord, sy));
  return false;
}
