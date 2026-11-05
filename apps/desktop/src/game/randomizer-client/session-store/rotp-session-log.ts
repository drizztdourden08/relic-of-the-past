/* @layer bridge-wasm @kind logic */
import { appRandomizerLog } from '@drizztdourden08/brock-randomizer/session';
import type { RandomizerLog } from '@drizztdourden08/brock-randomizer/session';
import { log } from '../../../log-bus';
import { onlineSlotName } from './online-slot-name-slot';

const ARMED_LINE = '[Local] Session armed: ';
const GENERATION_FAILED = 'Randomizer generation failed: ';
const AUTO_ONLINE = /^(\[Boot\] Auto-starting online session for this profile) \(seed .*\)$/;

const rotpSessionLog: RandomizerLog = (message, level) => {
  if (message.startsWith(ARMED_LINE)) return;
  if (message.startsWith(GENERATION_FAILED)) {
    log.error(message);
    return;
  }
  const auto = AUTO_ONLINE.exec(message);
  appRandomizerLog(auto ? `${auto[1]} (slot ${onlineSlotName.current})` : message, level);
};

export { rotpSessionLog };
