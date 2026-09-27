/* @layer shared-game @kind logic */
/**
 * Verification sweep over a completed placement: from an empty inventory,
 * repeatedly collect every collectable location's item in sphere batches
 * until a fixpoint. What the sweep REPORTS is the same in every accessibility
 * contract: the spheres, and the locations it never reached; which of those
 * locations actually invalidate the seed is the contract's question, and the
 * caller asks it of accessibility/accessibility-check.ts. The batches double
 * as the placement's spoiler spheres.
 */
import { createCollectionState } from '../collection-state';
import { canCollectLocation } from '../rules/collect';
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
  beaten: boolean;
}

const sweepPlacementSpheres = (world: World): PlacementSweep => {
  const state = createCollectionState(world);
  const collected = new Set<LocationKey>();
  const spheres: PlacementSphere[] = [];
  for (;;) {
    const batch = [...world.locationsByKey.keys()]
      .filter((key) => !collected.has(key) && canCollectLocation(state, key));
    if (batch.length === 0) break;
    for (const key of batch) {
      collected.add(key);
      const item = world.placedItems.get(key);
      if (item !== undefined) state.collect(item);
    }
    spheres.push({ index: spheres.length, locations: batch });
  }
  const uncollected = [...world.locationsByKey.keys()].filter((key) => !collected.has(key));
  return { spheres, collected, uncollected, beaten: world.isBeaten(state) };
};

export { sweepPlacementSpheres };
export type { PlacementSphere, PlacementSweep };
