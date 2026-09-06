/* @layer shared-game @kind logic */
/**
 * Which starting weapons the escape can actually be fought with. A family
 * standing on its empty rung when the file starts makes its weapon dead on
 * arrival: no bombs to hold, no arrows to fire, no meter for the rod and the
 * canes. The assurance scan (uncle-weapon.ts) and the stored-placement check
 * (fill/verify-standard.ts) both filter through this, so a weapon that cannot
 * be used is never the one handed over.
 *
 * Retro takes the bow out on its own terms. There, arrows are not a capacity
 * at all: the bow fires only once the quiver has been bought, and the escape
 * happens before any shop can be reached. So a bow handed over at the start of
 * a retro seed can never be fired, whatever the arrow capacity says, and the
 * file is left at the first guard with nothing that hurts it.
 *
 * Vanilla start rungs with retro off admit every candidate, so the reference
 * scan is unchanged there.
 */
import { familyById } from '../capacity/capacity-family';
import { startTierOf } from '../capacity/family-plan';
import { UNCLE_BOW_CANDIDATES } from './standard-escape.data';
import type { CapacityFamilyId, CapacityProfile } from '../capacity/capacity-profile.type';

/** The family a starting weapon draws on; absent means it needs no capacity. */
const START_FAMILY_OF_WEAPON: ReadonlyMap<string, CapacityFamilyId> = new Map([
  ['Bombs (10)', 'explosives'],
  ['Progressive Bow', 'projectiles'],
  ['Bow', 'projectiles'],
  ['Fire Rod', 'meter'],
  ['Cane of Somaria', 'meter'],
  ['Cane of Byrna', 'meter'],
]);

/** |retroBow| is the switch, not the whole setting: only whether shots are bought. */
const uncleWeaponUsableAtStart = (
  profile: CapacityProfile, retroBow = false,
) => (itemName: string): boolean => {
  if (retroBow && UNCLE_BOW_CANDIDATES.includes(itemName)) return false;
  const family = START_FAMILY_OF_WEAPON.get(itemName);
  return family === undefined || startTierOf(familyById(family), profile[family]) > 0;
};

export { uncleWeaponUsableAtStart };
