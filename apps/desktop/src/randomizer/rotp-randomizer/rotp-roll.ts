/* @layer renderer-app @kind logic */
import type { Placement } from '@rotp/randomizer';
import type { RandomizerProfileConfig } from '@drizztdourden08/brock-randomizer';
import { rollPlacement } from '../roll/roll-placement';

const rollRotpPlacement = (config: RandomizerProfileConfig): Placement => rollPlacement(config);

export { rollRotpPlacement };
