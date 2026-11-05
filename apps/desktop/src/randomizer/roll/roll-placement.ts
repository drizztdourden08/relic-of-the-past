/* @layer renderer-app @kind logic */
import type { Placement } from '@rotp/randomizer';
import type { ProfileRandomizerConfig } from '@app/profiles/types';
import { generateFromSnapshot, normalizeRandomizerOptions } from '@rotp/randomizer';
import {
  probeDeliverablePondLocations, probeDeliverableNpcLocations, probeDeliverableWorldLocations,
} from '@app/game/randomizer-client';

const rollPlacement = (config: ProfileRandomizerConfig): Placement =>
  generateFromSnapshot({
    seed: config.seed,
    snapshot: normalizeRandomizerOptions(config.options),
    deliverable: {
      npc: probeDeliverableNpcLocations(), capacity: probeDeliverablePondLocations(), world: probeDeliverableWorldLocations(),
    },
  });

export { rollPlacement };
