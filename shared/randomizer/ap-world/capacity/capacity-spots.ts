/* @layer shared-game @kind logic */
/**
 * The family spots as locations. The two fairy slots exist in the world only
 * while their family is not vanilla, and enter the shuffle only when the
 * caller proved them physically deliverable (otherwise they sit locked to
 * their vanilla one-tier upgrade). The meter's spot is an NPC-scope row:
 * a vanilla meter locks it explicitly, the other modes leave it to that
 * scope switch, so it is never part of the fairy-slot sets here.
 */
import { CAPACITY_UPGRADE_LOCATIONS } from '../special-locations.data';
import { CAPACITY_SPOTS } from './capacity-spots.data';
import type { CapacityFamilyId, CapacityProfile } from './capacity-profile.type';

const familyOfSpot = (location: string): CapacityFamilyId | undefined => {
  for (const [family, spot] of CAPACITY_SPOTS) if (spot === location) return family;
  return undefined;
};

const spotOfFamily = (family: CapacityFamilyId): string | undefined => CAPACITY_SPOTS.get(family);

/** A fairy slot is a location while its family is not vanilla. */
const isCapacitySpotPresent = (profile: CapacityProfile, location: string): boolean => {
  const family = familyOfSpot(location);
  return family !== undefined && CAPACITY_UPGRADE_LOCATIONS.has(location) && profile[family].mode !== 'vanilla';
};

/** The fairy slots that exist in this profile's world. */
const presentCapacitySpots = (profile: CapacityProfile): string[] =>
  [...CAPACITY_UPGRADE_LOCATIONS.keys()].filter((location) => isCapacitySpotPresent(profile, location));

/**
 * Present fairy slots the fill locks to their vanilla upgrade: every one the
 * caller did not prove deliverable (an absent set locks them all).
 */
const lockedCapacitySpotsOf = (
  profile: CapacityProfile, deliverable: ReadonlySet<string> | undefined,
): ReadonlySet<string> =>
  new Set(presentCapacitySpots(profile).filter((location) => deliverable?.has(location) !== true));

export { familyOfSpot, isCapacitySpotPresent, lockedCapacitySpotsOf, presentCapacitySpots, spotOfFamily };
