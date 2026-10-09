/* @layer shared-game @kind logic */
import { accessibilityFailures } from '../accessibility/accessibility-check';
import { FillError } from './fill-error';
import { verifyStandardEscape } from './verify-standard';
import type { ItemKey } from '../item-ids';
import type { LocationKey } from '../location-key';
import type { FillWorld } from './fill-world.type';
import type { PlacementSweep } from './fill.type';

const verifiedLocationsOf = (fillWorld: FillWorld, sweep: PlacementSweep): Record<LocationKey, ItemKey> => {
  const { world, capacity, retroBow, accessibility } = fillWorld;
  const unreachable = accessibilityFailures({
    mode: accessibility, capacity, uncollected: sweep.uncollected, missedEvents: sweep.missedEvents,
    placedItems: world.placedItems,
  });
  if (unreachable.length > 0) {
    throw new FillError(`${accessibility} accessibility`,
      `${unreachable.length} uncollectable: ${unreachable.slice(0, 5).join('; ')}`);
  }
  if (!sweep.beaten) throw new FillError('completion', 'goal not reachable at fill end');
  const locations = Object.fromEntries(
    [...world.locationsByKey.keys()].map((key) => [key, world.placedItems.get(key) as ItemKey]),
  ) as Record<LocationKey, ItemKey>;
  const escapeProblems = verifyStandardEscape(locations, capacity, retroBow.enabled);
  if (escapeProblems.length > 0) throw new FillError('standard escape', escapeProblems.join('; '));
  return locations;
};

export { verifiedLocationsOf };
