/* @layer renderer-appshell @kind logic */
import type { Placement } from '@rotp/randomizer';
import type { ProfileRandomizerConfig } from '@shared/types/profile';
import { generateFromSnapshot } from '@rotp/randomizer';
import { normalizeRandomizerOptions } from '@rotp/randomizer';
import {
  probeDeliverablePondLocations, probeDeliverableNpcLocations, probeDeliverableWorldLocations,
} from '@app/lib/game/randomizer-client';

const rollPlacement = (config: ProfileRandomizerConfig): Placement => {
  const snapshot = normalizeRandomizerOptions(config.options);
  return generateFromSnapshot(config.seed, snapshot,
    probeDeliverableNpcLocations(), probeDeliverablePondLocations(),
    probeDeliverableWorldLocations());
};

export { rollPlacement };
