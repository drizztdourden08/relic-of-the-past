/* @layer shared-game @kind logic */
/**
 * The family spots as locations. The two fairy slots exist in the world only
 * while their family is not vanilla, and enter the shuffle only when the
 * caller proved them physically deliverable (otherwise they sit locked to
 * their vanilla one-tier upgrade). The meter's spot is an NPC-scope row:
 * a vanilla meter locks it explicitly, the other modes leave it to that
 * scope switch, so it is never part of the fairy-slot sets here.
 */
import { all, getCheck, getItem } from '@shared/game/data';
import { capacityFamilyOfItemName } from '@shared/game/data/capacity-upgrade-item';
import { CAPACITY_UPGRADE_LOCATIONS } from '../scope-tables';
import type { CheckRecord } from '@shared/game/data/types';
import type { LocationKey } from '../location-key';
import type { CapacityFamilyId, CapacityProfile } from './capacity-profile.type';

/**
 * The spots, read off the records instead of listed.
 *
 * A spot is the row that grows a family's ladder from its bottom: the one check whose single
 * vanilla item is that family's own upgrade and which stands at rung 1, which is the pond's
 * first purchase for the two counted families and the meter giver's only row. The pond's
 * later rungs carry the same upgrade item, so the rung is what picks the spot out of them.
 * The wallet has no spot, and answers undefined.
 */
const familyOfCheck = (check: CheckRecord): CapacityFamilyId | undefined => {
  if (check.vanillaItemIds.length !== 1 || (check.pond?.rung ?? 1) !== 1) return undefined;
  return capacityFamilyOfItemName(getItem(check.vanillaItemIds[0]).name);
};

const spotsByFamily = (): ReadonlyMap<CapacityFamilyId, LocationKey> => {
  const spots = new Map<CapacityFamilyId, LocationKey>();
  for (const check of [...all('check')].sort((a, b) => a.id.localeCompare(b.id))) {
    const family = familyOfCheck(check);
    if (family !== undefined && !spots.has(family)) spots.set(family, check.id);
  }
  return spots;
};

/** Read once: the registry is seeded before any rule runs and never changes under one. */
let spots: ReadonlyMap<CapacityFamilyId, LocationKey> | null = null;

const capacitySpots = (): ReadonlyMap<CapacityFamilyId, LocationKey> => {
  spots ??= spotsByFamily();
  return spots;
};

/** The fairy slots among them, in the order the pond hands them over: the meter's giver is not one. */
const capacityPondSpots = (): readonly LocationKey[] =>
  [...capacitySpots().values()]
    .filter((id) => getCheck(id).pond !== undefined)
    .sort((a, b) => a.localeCompare(b));

const familyOfSpot = (location: LocationKey): CapacityFamilyId | undefined => {
  for (const [family, spot] of capacitySpots()) if (spot === location) return family;
  return undefined;
};

const spotOfFamily = (family: CapacityFamilyId): LocationKey | undefined => capacitySpots().get(family);

/** A fairy slot is a location while its family is not vanilla. */
const isCapacitySpotPresent = (profile: CapacityProfile, location: LocationKey): boolean => {
  const family = familyOfSpot(location);
  return family !== undefined && CAPACITY_UPGRADE_LOCATIONS.has(location)
    && profile[family].mode !== 'vanilla';
};

/** The fairy slots that exist in this profile's world. */
const presentCapacitySpots = (profile: CapacityProfile): LocationKey[] =>
  [...CAPACITY_UPGRADE_LOCATIONS.keys()].filter((location) => isCapacitySpotPresent(profile, location));

/**
 * Present fairy slots the fill locks to their vanilla upgrade: every one the
 * caller did not prove deliverable (an absent set locks them all).
 */
const lockedCapacitySpotsOf = (
  profile: CapacityProfile, deliverable: ReadonlySet<LocationKey> | undefined,
): ReadonlySet<LocationKey> =>
  new Set(presentCapacitySpots(profile).filter((location) => deliverable?.has(location) !== true));

export {
  capacityPondSpots, capacitySpots, familyOfSpot, isCapacitySpotPresent, lockedCapacitySpotsOf,
  presentCapacitySpots, spotOfFamily,
};
