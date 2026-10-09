/* @layer shared-game @kind logic */
import type { LocationKey } from '../../location-key';
import type { World } from '../../world.type';

const openCapacitySpots = (world: World, lockedCapacityLocations: ReadonlySet<LocationKey>): number =>
  world.options.pondPrizeLocations.filter((key) => !lockedCapacityLocations.has(key)).length;

export { openCapacitySpots };
