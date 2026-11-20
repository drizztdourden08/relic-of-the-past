/* @layer renderer-app @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Placement } from '@rotp/randomizer';
import type { PlacementSummary } from '@drizztdourden08/brock-randomizer';
import { textOf } from '@app/shell/text-bridge';

const describePlacement = (placement: Placement): PlacementSummary => ({
  seed: placement.seed,
  rows: [
    { label: textOf(msg('views-randomizer:describe.locations')), value: String(Object.keys(placement.locations).length) },
    { label: textOf(msg('views-randomizer:describe.spheres')), value: String(placement.spheres.length) },
    { label: textOf(msg('views-randomizer:describe.attempts')), value: String(placement.stats.attempts) },
  ],
});

export { describePlacement };
