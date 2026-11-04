/* @layer renderer-app @kind logic */
import { normalizeRandomizerOptions } from '@rotp/randomizer';
import type { Placement } from '@rotp/randomizer';
import type { RandomizerProfileConfig } from '@drizztdourden08/brock-randomizer';
import { rollPlacement } from '@app/views/GameSession/behavior/roll-placement';

const rollRotpPlacement = (config: RandomizerProfileConfig): Placement =>
  rollPlacement({ mode: 'local', seed: config.seed, options: normalizeRandomizerOptions(config.options) });

export { rollRotpPlacement };
