/* @layer renderer-app @kind logic */
import type { Placement } from '@rotp/randomizer';
import type { PlacementSummary } from '@drizztdourden08/brock-randomizer';

const describePlacement = (placement: Placement): PlacementSummary => ({
  seed: placement.seed,
  rows: [
    { label: 'Locations', value: String(Object.keys(placement.locations).length) },
    { label: 'Spheres', value: String(placement.spheres.length) },
    { label: 'Attempts', value: String(placement.stats.attempts) },
  ],
});

export { describePlacement };
