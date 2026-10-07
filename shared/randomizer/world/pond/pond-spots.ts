/* @layer shared-game @kind logic */
/**
 * Which pond slots exist as locations, and which of them are prize slots.
 *
 * A wish pond's own pair IS rungs 1 and 2 of its ladder, so her two names are locations
 * whatever she sells: her grants while she keeps her native economy, prizes 1 and 2 once a
 * Custom setting gives her a ladder. The capacity pond's pair is named for the families it
 * grows and follows capacity-spots.ts, exactly as it always has: present while the family is
 * not vanilla and the pond is at Vanilla grants, replaced by the pond's own prize rungs
 * otherwise.
 *
 * The two answers are not the same list. `presentPondSlots` is every pond location the world
 * holds. `pondPrizeLocations` is the narrower set the pool counts and `pondPrizeCount` reports:
 * the prize rungs a seed sells, plus the capacity pond's fairy spots under Vanilla grants. A
 * wish pond's own pair is not counted there, because the npc scope has always counted it.
 *
 * A prize ladder needs that pond's physical seam proven deliverable first, because a rung past
 * her pair has no vanilla item to fall back to and so cannot be locked the way a fairy slot is.
 */
import type { LocationKey } from '../location-key';
import { presentCapacitySpots } from '../capacity/capacity-spots';
import { CAPACITY_POND, POND_INSTANCES } from './pond-instances';
import { POND_EXTRA_LOCATIONS } from './pond-rungs';
import { pondPlanOf } from './pond-plan';
import type { CapacityProfile } from '../capacity/capacity-profile.type';
import type { PondInstance } from './pond-instance.type';
import type { PondSetting } from './pond-profile.type';
import type { PondProfiles } from './pond-profiles.type';

const POND_EXTRA_SET: ReadonlySet<LocationKey> = new Set(POND_EXTRA_LOCATIONS);

// A pond's own pair: what the capability probe can actually certify, because they are the only
// grants with a physical seam of their own (at the capacity pond, the bomb answer and the arrow
// answer; at each water, the two the fairy hands over). A prize rung past them rides that same
// seam, so certifying the two certifies the ladder.
const pondCertifiedSpotsOf = (pond: PondInstance): readonly LocationKey[] =>
  pond.slots.map((slot) => slot.key);

/**
 * The capacity pond's pair. The probe certifies all three ponds' pairs into one
 * set (randomizer-client/npc-capability.ts), so this is the capacity pond's
 * slice of it and never the whole set.
 */
const POND_CERTIFIED_SPOTS: readonly LocationKey[] = pondCertifiedSpotsOf(CAPACITY_POND);

/** True when the probe proved this pond's substitution seam on both its slots. */
const isPondDeliverable = (
  deliverable: ReadonlySet<LocationKey> | undefined, pond: PondInstance = CAPACITY_POND,
): boolean => pondCertifiedSpotsOf(pond).every((name) => deliverable?.has(name) === true);

/** Whether this pond sells a ladder of its own instead of handing over its native pair. */
const sellsALadder = (setting: PondSetting, pond: PondInstance): boolean =>
  (pond.id === CAPACITY_POND.id ? setting.mode !== 'capacity' : setting.mode === 'custom');

/**
 * The prize rungs one pond sells, none at all until its seam is proven. A wish pond at her
 * native economy sells her own pair, which is not a prize rung, so she sells none.
 */
const presentRungsOf = (
  setting: PondSetting, pond: PondInstance, deliverable: ReadonlySet<LocationKey> | undefined,
): LocationKey[] => {
  if (!sellsALadder(setting, pond) || !isPondDeliverable(deliverable, pond)) return [];
  return [...pondPlanOf(setting, pond).locations];
};

/** One pond's locations in this world: its prize rungs while it sells a ladder, else its pair. */
const pondSlotsOf = (
  setting: PondSetting, pond: PondInstance, capacity: CapacityProfile,
  deliverable: ReadonlySet<LocationKey> | undefined,
): readonly LocationKey[] => {
  const rungs = presentRungsOf(setting, pond, deliverable);
  if (pond.id === CAPACITY_POND.id) {
    return setting.mode === 'capacity' ? presentCapacitySpots(capacity) : rungs;
  }
  return rungs.length > 0 ? rungs : pondCertifiedSpotsOf(pond);
};

/** Every pond location this world holds, in pond order. */
const presentPondSlots = (
  profiles: PondProfiles, capacity: CapacityProfile, deliverable: ReadonlySet<LocationKey> | undefined,
): LocationKey[] =>
  POND_INSTANCES.flatMap((pond) => [...pondSlotsOf(profiles[pond.id], pond, capacity, deliverable)]);

/**
 * The pond locations the pool counts: the prize rungs a seed sells, plus the capacity pond's
 * present fairy spots while it is at Vanilla grants.
 */
const pondPrizeLocations = (
  profiles: PondProfiles, capacity: CapacityProfile, deliverable: ReadonlySet<LocationKey> | undefined,
): LocationKey[] => {
  const legacyCapacityPond = profiles[CAPACITY_POND.id].mode === 'capacity';
  const rungs = POND_INSTANCES.flatMap((pond) => presentRungsOf(profiles[pond.id], pond, deliverable));
  return legacyCapacityPond ? [...presentCapacitySpots(capacity), ...rungs] : rungs;
};

/** A slot of a pond's numbered ladder, which is every rung and a wish pond's own pair. */
const isPondExtraLocation = (key: LocationKey): boolean => POND_EXTRA_SET.has(key);

export {
  POND_CERTIFIED_SPOTS, isPondDeliverable, isPondExtraLocation, pondCertifiedSpotsOf, pondPrizeLocations,
  presentPondSlots, presentRungsOf,
};
