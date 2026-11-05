/* @layer renderer-app @kind logic */
import { rescanShopCatchUp } from '@rotp/randomizer';
import { POLL_INTERVAL_MS } from '@drizztdourden08/brock-randomizer/session';
import { getCompletedChecks } from '@app/game/tracker';
import type { RandomizerGame } from '@drizztdourden08/brock-randomizer';

const rotpPoll: NonNullable<RandomizerGame['poll']> = {
  intervalMs: POLL_INTERVAL_MS,
  completed: getCompletedChecks,
  beforePoll: rescanShopCatchUp,
};

export { rotpPoll };
