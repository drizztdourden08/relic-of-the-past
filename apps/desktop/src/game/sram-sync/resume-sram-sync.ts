/* @layer bridge-wasm @kind logic */
import { armInterval } from './arm-interval';
import { sramSyncState } from '@rotp/game-core';

const resumeSramSync = (): void => {
  const alreadyRunning = Boolean(sramSyncState.interval);
  if (alreadyRunning) return;
  armInterval();
};

export { resumeSramSync };
