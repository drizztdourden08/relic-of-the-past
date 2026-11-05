/* @layer shared-game @kind logic */
import { readPlacement } from './read-placement';
import type { PlacementAvailabilityArgs } from './placement-availability.type';

const computePlacementAvailability = (...args: PlacementAvailabilityArgs): Set<string> => {
  const [placement, completedLocations, darkRoomsNeedLight, heldItems, completedCheckIds] = args;
  const { statuses } = readPlacement({
    placement, completedLocations, darkRoomsNeedLight, heldItems, completedCheckIds,
  });
  const available = new Set<string>();
  for (const [location, status] of statuses) if (status === 'available') available.add(location);
  return available;
};

export { computePlacementAvailability };
