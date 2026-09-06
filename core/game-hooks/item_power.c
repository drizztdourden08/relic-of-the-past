/* @layer core-game-hooks @kind native */
// How helpful the items are — the seven switches the reference randomizer bundles into one
// four-step "item functionality" choice (its Rom.py patches eight bytes per step; the option
// catalog's item-power rows ask them apart). Every one of them lives in the WRAM gate word
// kRam_Features4 rather than in a host gate, because the GAME branches on all of them: a host
// gate would be invisible to a save state and to the replay recorder, and flipping one mid-run
// would desynchronise a replay (host_gates.h states that rule).
//
// Each bit is phrased as a DIVERGENCE, so a zero word is the unmodified game and every hook
// below returns exactly the expression the vendored call site used to compute inline. That is
// the invariant to check when reading this file: with features4 clear, each function is an
// identity over its argument, or the constant the vendored code held.
//
// Two of the seven are not only the player's to set. A tier tick set with no beam blade in it
// would leave the tablets behind a requirement nothing in the seed could meet, and one with no
// blade at all would do the same to the medallion doors, so the session arms those two bits
// from the tick set as well as from the switch (item-power/item-power-rule.ts derives the pair
// on both sides, so the logic and the running game can never disagree). Nothing here knows
// that: it reads the bit it was given.
#include "game_hooks_internal.h"

static bool ItemPowerBit(uint32 bit) {
  return (enhanced_features4 & bit) != 0;
}

// sprite_main.c Sprite_E3_Fairy: swinging the net at a fairy offers to bottle it. Off, the
// swing is simply not a catch and the fairy goes on behaving as one.
bool GameHook_NetCatchesFairies(void) {
  return !ItemPowerBit(kFeatures4_NoFairyCatching);
}

// ancilla.c Ancilla31_ByrnaSpark: the value written to link_disable_sprite_damage while the
// barrier is up. Vanilla wrote a literal 1 here; off, the barrier still burns what walks into
// it and the player takes damage as usual.
uint8 GameHook_ByrnaBarrierGuard(void) {
  return ItemPowerBit(kFeatures4_NoByrnaBarrierGuard) ? 0 : 1;
}

// player.c kCapeDepletionTimers: FRAMES between two meter units, so halving the count is what
// "drains twice as fast" means. Clamped at one frame — a zero would never reach the decrement.
uint8 GameHook_CapeDrainRate(uint8 frames) {
  if (!ItemPowerBit(kFeatures4_CapeDoubleMagic)) return frames;
  uint8 halved = (uint8)(frames >> 1);
  return halved != 0 ? halved : 1;
}

// ancilla.c Ancilla_CheckDamageToSprite_aggressive: whether an arrow gets promoted from the
// plain arrow damage class to the silver one. Restricted, the promotion is kept for the last
// fight's two sprite types and a silver arrow hits like an ordinary one everywhere else.
bool GameHook_SilverArrowsBite(int k) {
  if (!ItemPowerBit(kFeatures4_SilverArrowsBossOnly)) return true;
  return sprite_type[k] >= 0xd6;
}

// sprite.c Sprite_GiveDamage: what the magic powder turns an enemy into. Off, the lesser
// prize — a single heart — takes the fairy's place, which is the reference's own substitution.
uint8 GameHook_PowderTransmuteType(uint8 type) {
  return ItemPowerBit(kFeatures4_NoPowderFairy) ? 0xd8 : type;
}

// sprite_main.c BombosTablet / EtherTablet: may the tablet be woken right now? The vendored
// expression is the beam-blade test; the bit adds the hammer beside it.
bool GameHook_TabletActivator(void) {
  if (!sign8(link_sword_type) && link_sword_type >= 2) return true;
  return ItemPowerBit(kFeatures4_HammerWakesTablets) && link_item_hammer != 0;
}

// player.c LinkItem_Ether / _Bombos / _Quake: the "no blade in hand" half of the refusal those
// three share. The vendored sub-expression is returned untouched unless the bit lifts it.
bool GameHook_MedallionBlockedBySword(void) {
  if (ItemPowerBit(kFeatures4_SwordlessMedallions)) return false;
  return !((uint8)(link_sword_type + 1) & ~1);
}
