/* @layer shared-game @kind logic */
/**
 * Which pond prize slots exist as locations. In the legacy mode nothing
 * changes: the capacity pond's two slots are the capacity families' own spots
 * and capacity-spots.ts decides, exactly as before, while a wish pond's two
 * are ordinary rows of the npc scope and that switch decides. In the other
 * two modes the pond's plan decides (one location per prize it carries), and
 * the whole set needs that pond's physical seam proven deliverable first,
 * because a prize slot past its vanilla pair has no vanilla item to fall back
 * to and so cannot be locked the way a fairy slot is.
 *
 * A plan whose prizes ARE the pond's vanilla pair (a wish pond at its native
 * economy) adds nothing here: those two are already locations of the npc
 * scope, and counting them again would count the same check twice.
 */
import { presentCapacitySpots } from '../capacity/capacity-spots';
import { CAPACITY_POND, POND_INSTANCES } from './pond-instances.data';
import { POND_EXTRA_LOCATIONS } from './pond-locations.data';
import { pondPlanOf } from './pond-plan';
import type { CapacityProfile } from '../capacity/capacity-profile.type';
import type { PondInstance } from './pond-instance.type';
import type { PondSetting } from './pond-profile.type';
import type { PondProfiles } from './pond-profiles.type';

const POND_EXTRA_SET: ReadonlySet<string> = new Set(POND_EXTRA_LOCATIONS);

// A pond's two vanilla slots: what the capability probe can actually certify, because they
// are the only grants with a physical seam of their own (at the capacity pond, the bomb
// answer and the arrow answer; at each water, the two the fairy hands over). A prize rung
// past them rides that same seam, so certifying the two certifies the ladder.
const pondCertifiedSpotsOf = (pond: PondInstance): readonly string[] =>
  pond.slots.map((slot) => slot.location);

/**
 * The capacity pond's pair. The probe certifies all three ponds' pairs into one
 * set (randomizer-client/npc-capability.ts), so this is the capacity pond's
 * slice of it and never the whole set.
 */
const POND_CERTIFIED_SPOTS: readonly string[] = pondCertifiedSpotsOf(CAPACITY_POND);

/** True when the probe proved this pond's substitution seam on both its slots. */
const isPondDeliverable = (
  deliverable: ReadonlySet<string> | undefined, pond: PondInstance = CAPACITY_POND,
): boolean => pondCertifiedSpotsOf(pond).every((name) => deliverable?.has(name) === true);

/** One pond's own prize rungs, none at all until its seam is proven. */
const presentRungsOf = (
  setting: PondSetting, pond: PondInstance, deliverable: ReadonlySet<string> | undefined,
): string[] => {
  if (setting.mode === 'capacity' || !isPondDeliverable(deliverable, pond)) return [];
  return pondPlanOf(setting, pond).locations.filter((name) => POND_EXTRA_SET.has(name));
};

/**
 * The pond locations of one set of settings: the capacity families' present
 * spots while the capacity pond is legacy, plus every pond's own prize rungs
 * under an active setting.
 */
const presentPondLocations = (
  profiles: PondProfiles, capacity: CapacityProfile, deliverable: ReadonlySet<string> | undefined,
): string[] => {
  const legacyCapacityPond = profiles[CAPACITY_POND.id].mode === 'capacity';
  const rungs = POND_INSTANCES.flatMap((pond) => presentRungsOf(profiles[pond.id], pond, deliverable));
  return legacyCapacityPond ? [...presentCapacitySpots(capacity), ...rungs] : rungs;
};

/** A prize slot the reference does not name, present only under a non-legacy pond. */
const isPondExtraLocation = (name: string): boolean => POND_EXTRA_SET.has(name);

export {
  POND_CERTIFIED_SPOTS, isPondDeliverable, isPondExtraLocation, pondCertifiedSpotsOf, presentPondLocations,
  presentRungsOf,
};
