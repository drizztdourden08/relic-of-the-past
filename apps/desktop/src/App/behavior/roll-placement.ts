/* @layer renderer-appshell @kind logic */
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import type { ProfileRandomizerConfig } from '@shared/types/profile';
import { generateFromSnapshot } from '@shared/randomizer/generate';
import { normalizeRandomizerOptions } from '@shared/randomizer/options-snapshot';
import {
  probeDeliverablePondLocations, probeDeliverableNpcLocations, probeDeliverableWorldLocations,
} from '../../lib/game/randomizer-client';

const rollPlacement = (config: ProfileRandomizerConfig): Placement => {
  const snapshot = normalizeRandomizerOptions(config.options);
  return generateFromSnapshot(config.seed, snapshot,
    probeDeliverableNpcLocations(), probeDeliverablePondLocations(),
    probeDeliverableWorldLocations());
};

export { rollPlacement };
