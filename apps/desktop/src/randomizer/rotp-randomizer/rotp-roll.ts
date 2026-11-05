/* @layer renderer-app @kind logic */
import type { Placement } from '@rotp/randomizer';
import type { RandomizerProfileConfig, RollContext, RollOutcome } from '@drizztdourden08/brock-randomizer';
import { rollPlacement } from '../roll/roll-placement';
import { rollArchipelia } from './rotp-roll-archipelia';

const rollRotpPlacement = (config: RandomizerProfileConfig, ctx: RollContext): RollOutcome<Placement> | Promise<RollOutcome<Placement>> =>
  ctx.mode === 'archipelia' ? rollArchipelia(config, ctx) : rollPlacement(config);

export { rollRotpPlacement };
