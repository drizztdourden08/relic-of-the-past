/* @layer bridge-wasm @kind logic */
import type { RandomizerLog } from '@drizztdourden08/brock-randomizer';
import { logSlot, sharedEngine } from './shared-engine';

const startProcessing = (log: RandomizerLog): void => {
  logSlot.current = log;
  sharedEngine.start();
};

export { startProcessing };
