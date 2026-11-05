/* @layer renderer-app @kind logic */
import { defineBootTask } from '@drizztdourden08/brock-react';
import { registerRandomizerGame } from '@drizztdourden08/brock-randomizer/renderer';
import { rotpRandomizer } from '@app/randomizer/rotp-randomizer';
import { rotpLog } from '@app/randomizer/rotp-randomizer/rotp-log';

export default defineBootTask({
  label: 'Registering the randomizer',
  run: ({ report }) => {
    registerRandomizerGame(rotpRandomizer, { log: rotpLog });
    report(1);
  },
});
