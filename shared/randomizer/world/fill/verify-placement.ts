/* @layer shared-game @kind logic */
/**
 * Verification sweep over a completed placement: from an empty inventory,
 * repeatedly collect every collectable location's item in sphere batches
 * until a fixpoint. What the sweep REPORTS is the same in every accessibility
 * contract: the spheres, and the locations it never reached; which of those
 * locations actually invalidate the seed is the contract's question, and the
 * caller asks it of accessibility/accessibility-check.ts. The batches double
 * as the placement's spoiler spheres. The story events within reach of each
 * batch's state happen with it (events/event-sweep.ts); they are no location,
 * so no sphere lists them.
 */
import { createCollectionState } from '../collection-state';
import { canCollectLocation } from '../rules/collect';
import { reachableEvents } from '../events/event-sweep';
import type { CheckId } from '@shared/game/data/types/ids';
import type { LocationKey } from '../location-key';
import type { World } from '../world.type';

interface PlacementSphere {
  index: number;
  locations: LocationKey[];
}

interface PlacementSweep {
  spheres: PlacementSphere[];
  collected: Set<LocationKey>;
  /** Locations the sweep never reached; the accessibility contract judges them. */
  uncollected: LocationKey[];
  /** Story events the sweep never made happen; the accessibility contract judges them too. */
  missedEvents: CheckId[];
  beaten: boolean;
}

const sweepPlacementSpheres = (world: World): PlacementSweep => {
  const state = createCollectionState(world);
  const collected = new Set<LocationKey>();
  const spheres: PlacementSphere[] = [];
  for (;;) {
    const batch = [...world.locationsByKey.keys()]
      .filter((key) => !collected.has(key) && canCollectLocation(state, key));
    const events = reachableEvents(state);
    if (batch.length === 0 && events.length === 0) break;
    for (const key of batch) {
      collected.add(key);
      const item = world.placedItems.get(key);
      if (item !== undefined) state.collect(item);
    }
    for (const event of events) state.collect(event);
    // A round that only made story events happen holds no location, so it is no sphere.
    if (batch.length > 0) spheres.push({ index: spheres.length, locations: batch });
  }
  const uncollected = [...world.locationsByKey.keys()].filter((key) => !collected.has(key));
  const missedEvents = [...world.eventsByKey.keys()].filter((key) => !state.has(key));
  return { spheres, collected, uncollected, missedEvents, beaten: world.isBeaten(state) };
};

export { sweepPlacementSpheres };
export type { PlacementSphere, PlacementSweep };
