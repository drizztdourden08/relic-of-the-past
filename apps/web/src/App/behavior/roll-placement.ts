/* @layer renderer-appshell @kind logic */
/**
 * Rolls a local seed's placement from its seed and frozen options. The ported pipeline
 * consumes the frozen snapshot directly. The capability probes name the npc-scope locations
 * and capacity slots the app can physically deliver; the rest stay locked vanilla so the
 * plan can never carry errors. The same seed and options always roll the same placement.
 */
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
