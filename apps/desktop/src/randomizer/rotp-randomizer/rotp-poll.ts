/* @layer renderer-app @kind logic */
import { POLL_INTERVAL_MS, rescanShopCatchUp } from '@rotp/randomizer';
import { getCompletedChecks } from '@app/game/tracker';
import type { RandomizerGame } from '@drizztdourden08/brock-randomizer';

const rotpPoll: NonNullable<RandomizerGame['poll']> = {
  intervalMs: POLL_INTERVAL_MS,
  completed: getCompletedChecks,
  beforePoll: rescanShopCatchUp,
};

export { rotpPoll };
