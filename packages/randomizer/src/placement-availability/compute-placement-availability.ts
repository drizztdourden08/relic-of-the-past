/* @layer shared-game @kind logic */
import { computePlacementReach } from './compute-placement-reach';
import type { PlacementAvailabilityArgs } from './placement-availability.type';

const computePlacementAvailability = (...args: PlacementAvailabilityArgs): Set<string> => {
  const [placement, completedLocations, darkRoomsNeedLight, heldItems, completedCheckIds] = args;
  return computePlacementReach({ placement, completedLocations, darkRoomsNeedLight, heldItems, completedCheckIds }).available;
};

export { computePlacementAvailability };
