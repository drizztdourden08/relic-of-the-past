/* @layer shared-game @kind logic */
import type { LocationKey } from '../../location-key';
import type { FillWorld } from '../fill-world.type';

const fillEligibleLocations = (fillWorld: FillWorld): LocationKey[] =>
  [...fillWorld.world.locationsByKey.values()]
    .filter((location) => !location.prize && !fillWorld.world.placedItems.has(location.key))
    .map((location) => location.key);

export { fillEligibleLocations };
