/* @layer renderer-app @kind logic */
import { GOAL_CHECK, detectionOf } from '@rotp/randomizer';
import type { PollEntry } from '@drizztdourden08/brock-randomizer/session';
import { probeOfDetection } from './probe-of-detection';

const rotpApGoal = (): PollEntry => {
  const detection = detectionOf(GOAL_CHECK);
  return detection === null
    ? { key: GOAL_CHECK, checkId: GOAL_CHECK }
    : { key: GOAL_CHECK, checkId: GOAL_CHECK, probe: probeOfDetection(detection) };
};

export { rotpApGoal };
