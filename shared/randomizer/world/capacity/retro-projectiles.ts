/* @layer shared-game @kind logic */
/**
 * Retro bow takes the projectiles family out of the player's hands.
 *
 * With every shot paid for in rupees a carried count means nothing, so an
 * arrow capacity upgrade has nothing to upgrade: in the pool it is dead
 * weight, at the pond it is a purchase that changes nothing. The family is
 * therefore read as Vanilla the moment retro is on, wherever a profile is
 * read: the capacity/pond rule masks it before the snapshot is written, and
 * the snapshot reader masks it again so a profile frozen with both on rolls
 * the same way. A MASK, not a rewrite: the stored setting is kept underneath,
 * so switching retro off hands the row straight back.
 */
import type { CapacityFamilyId, CapacityProfile } from './capacity-profile.type';

/** The families retro pins to Vanilla. */
const RETRO_PINNED_FAMILIES: readonly CapacityFamilyId[] = ['projectiles'];

const isPinnedUnderRetro = (family: CapacityFamilyId, retroBow: boolean): boolean =>
  retroBow && RETRO_PINNED_FAMILIES.includes(family);

/** The profile as the seed reads it under this retro switch: every pinned family Vanilla. */
const withRetroBow = (profile: CapacityProfile, retroBow: boolean): CapacityProfile => {
  if (!retroBow) return profile;
  const next = { ...profile };
  for (const family of RETRO_PINNED_FAMILIES) {
    if (next[family].mode !== 'vanilla') next[family] = { mode: 'vanilla' };
  }
  return next;
};

export { RETRO_PINNED_FAMILIES, isPinnedUnderRetro, withRetroBow };
