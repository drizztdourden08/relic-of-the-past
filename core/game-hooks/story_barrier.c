/* @layer core-game-hooks @kind native */
// The castle barrier under a story gate. The vendored barrier falls to a beam blade in two places:
// sprite_main.c Sprite_EvilBarrier decides whether a blow is thrown back (GameHook_TowerSealRepels,
// swordless_paths.c), and the damage table decides whether the blow that lands breaks it. A gate
// that names an event instead of a blade answers both: the seal parts for the event, and the blow
// that lands carries the beam blade's own table value when the event holds, nothing when it does
// not. With the field at zero the table value passes through untouched.
#include "game_hooks_internal.h"
#include "src/sprite.h"

// sprite.c kSprite_Func14_Damage[link_sword_type - 1]: the damage class of a plain beam-blade slash.
#define BEAM_BLADE_DAMAGE_CLASS 2
#define BARRIER_SPRITE 0x40

static uint32 BarrierMode(void) {
  return (enhanced_features5 & kFeatures5_BarrierGateMask) >> kFeatures5_BarrierGateShift;
}

// sprite.c Sprite_ApplyCalculatedDamage: |dmg| is what the table computed for this blow.
uint8 GameHook_BarrierDamage(int k, uint8 dmg) {
  if (sprite_type[k] != BARRIER_SPRITE || BarrierMode() == 0) return dmg;
  if (!GameHook_StoryGate(kGate_Barrier, false)) return 0;
  return kEnemyDamages[BEAM_BLADE_DAMAGE_CLASS * 8 | enemy_damage_data[BARRIER_SPRITE * 16 | BEAM_BLADE_DAMAGE_CLASS]];
}
