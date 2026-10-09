/* @layer shared-game @kind logic */
import type { LocationKey } from './world/location-key';
import { generatePlacement } from './world/fill/generate';
import type { RandomizerOptionsSnapshot } from './world/options.type';
import type { Placement } from './world/fill/placement.type';

const generateFromSnapshot = (
  seed: string, snapshot: RandomizerOptionsSnapshot, deliverableNpcLocations?: ReadonlySet<LocationKey>,
  deliverableCapacityLocations?: ReadonlySet<LocationKey>,
  deliverableWorldLocations?: ReadonlySet<LocationKey>,
): Placement =>
  generatePlacement(seed, snapshot, deliverableNpcLocations, deliverableCapacityLocations,
    deliverableWorldLocations);

export { generateFromSnapshot };
