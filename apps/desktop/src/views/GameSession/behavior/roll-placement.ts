/* @layer renderer-appshell @kind logic */
import type { Placement } from '@rotp/randomizer';
import type { ProfileRandomizerConfig } from '@app/profiles/types';
import { generateFromSnapshot, normalizeRandomizerOptions } from '@rotp/randomizer';
import {
  probeDeliverablePondLocations, probeDeliverableNpcLocations, probeDeliverableWorldLocations,
} from '@app/game/randomizer-client';

const rollPlacement = (config: ProfileRandomizerConfig): Placement => {
  const snapshot = normalizeRandomizerOptions(config.options);
  return generateFromSnapshot({
    seed: config.seed,
    snapshot,
    deliverable: {
      npc: probeDeliverableNpcLocations(), capacity: probeDeliverablePondLocations(), world: probeDeliverableWorldLocations(),
    },
  });
};

export { rollPlacement };
