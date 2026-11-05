/* @layer shared-game @kind logic */
import { readTracker } from '@drizztdourden08/brock-randomizer/tracker';
import { assumedOfToggles } from './assumed-of-toggles';
import { placementReadingProvider } from './placement-reading-provider';
import type { TrackerReading } from '@drizztdourden08/brock-randomizer/tracker';
import type { PlacementReadRequest } from './placement-availability.type';

const readPlacement = (request: PlacementReadRequest): TrackerReading => {
  const { placement, completedLocations, completedCheckIds, heldItems = [] } = request;
  return readTracker(placementReadingProvider, {
    placement,
    checked: completedLocations,
    completed: new Set(completedCheckIds),
    held: [...heldItems],
    assumed: assumedOfToggles({
      darkRoomsNeedLight: request.darkRoomsNeedLight ?? true,
      bigKeyDoors: request.bigKeyDoors ?? true,
      smallKeyDoors: request.smallKeyDoors ?? true,
    }),
  });
};

export { readPlacement };
