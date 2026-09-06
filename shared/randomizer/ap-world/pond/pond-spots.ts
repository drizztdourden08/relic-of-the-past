/* @layer shared-game @kind logic */
/**
 * Which pond prize slots exist as locations. In the legacy mode nothing
 * changes: the pond's two slots are the capacity families' own spots and
 * capacity-spots.ts decides, exactly as before. In the other three modes the
 * pond's plan decides — one location per prize it carries — and the whole set
 * needs the pond's physical seam proven deliverable first, because a prize
 * slot past the reference's two has no vanilla item to fall back to and so
 * cannot be locked the way a fairy slot is.
 */
import { presentCapacitySpots } from '../capacity/capacity-spots';
import { POND_EXTRA_LOCATIONS, POND_PRIZE_LOCATIONS } from './pond-locations.data';
import { pondPlanOf } from './pond-plan';
import type { CapacityProfile } from '../capacity/capacity-profile.type';
import type { PondSetting } from './pond-profile.type';

const POND_EXTRA_SET: ReadonlySet<string> = new Set(POND_EXTRA_LOCATIONS);

/** The reference's own two names — what the capability probe can actually certify. */
const POND_CERTIFIED_SPOTS: readonly string[] = POND_PRIZE_LOCATIONS.slice(0, 2);

/** True when the probe proved the pond's substitution seam on both reference slots. */
const isPondDeliverable = (deliverable: ReadonlySet<string> | undefined): boolean =>
  POND_CERTIFIED_SPOTS.every((name) => deliverable?.has(name) === true);

/**
 * The pond locations of one setting: the capacity families' present spots in
 * the legacy mode, the plan's prize slots otherwise (none at all until the
 * seam is proven).
 */
const presentPondLocations = (
  setting: PondSetting, capacity: CapacityProfile, seed: string, deliverable: ReadonlySet<string> | undefined,
): string[] => {
  if (setting.mode === 'capacity') return presentCapacitySpots(capacity);
  if (!isPondDeliverable(deliverable)) return [];
  return [...pondPlanOf(setting, seed).locations];
};

/** A prize slot the reference does not name — present only under a non-legacy pond. */
const isPondExtraLocation = (name: string): boolean => POND_EXTRA_SET.has(name);

export { POND_CERTIFIED_SPOTS, isPondDeliverable, isPondExtraLocation, presentPondLocations };
