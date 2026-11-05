/* @layer renderer-app @kind logic */
import { defineBootTask } from '@drizztdourden08/brock-react';
import { registerRandomizerGame } from '@drizztdourden08/brock-randomizer/renderer';
import { appRandomizerLog } from '@drizztdourden08/brock-randomizer/session';
import type { RandomizerLog } from '@drizztdourden08/brock-randomizer/session';
import { log } from '@app/log-bus';
import { rotpRandomizer } from '@app/randomizer/rotp-randomizer';

const rotpLog: RandomizerLog = (message, level, line) => {
  if (line === 'rerollFailed') log.error(message);
  else appRandomizerLog(message, level);
};

export default defineBootTask({
  label: 'Registering the randomizer',
  run: ({ report }) => {
    registerRandomizerGame(rotpRandomizer, { log: rotpLog });
    report(1);
  },
});
