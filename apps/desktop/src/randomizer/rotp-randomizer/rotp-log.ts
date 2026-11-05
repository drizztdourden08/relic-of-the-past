/* @layer renderer-app @kind logic */
import { appRandomizerLog } from '@drizztdourden08/brock-randomizer/session';
import type { RandomizerLog } from '@drizztdourden08/brock-randomizer/session';
import { log } from '@app/log-bus';

const rotpLog: RandomizerLog = (message, level, line) => {
  if (line === 'rerollFailed') log.error(message);
  else appRandomizerLog(message, level);
};

export { rotpLog };
