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
import type { ApWorld } from '../world.type';

interface PlacementSphere {
  index: number;
  locations: string[];
}

interface PlacementSweep {
  spheres: PlacementSphere[];
  collected: Set<string>;
  /** Locations the sweep never reached; the accessibility contract judges them. */
  uncollected: string[];
  beaten: boolean;
}

const sweepPlacementSpheres = (world: ApWorld): PlacementSweep => {
  const state = createCollectionState(world);
  const collected = new Set<string>();
  const spheres: PlacementSphere[] = [];
  for (;;) {
    const batch = [...world.locationsByName.keys()]
      .filter((name) => !collected.has(name) && canCollectLocation(state, name));
    if (batch.length === 0) break;
    for (const name of batch) {
      collected.add(name);
      const item = world.placedItems.get(name);
      if (item !== undefined) state.collect(item);
    }
    spheres.push({ index: spheres.length, locations: batch });
  }
  const uncollected = [...world.locationsByName.keys()].filter((name) => !collected.has(name));
  return { spheres, collected, uncollected, beaten: world.isBeaten(state) };
};

export { sweepPlacementSpheres };
export type { PlacementSphere, PlacementSweep };
