/* @layer bridge-wasm @kind logic */
import { sramSyncState } from './sram-sync-state';

const pauseSramSync = (): void => {
  if (sramSyncState.interval) {
    clearInterval(sramSyncState.interval);
    sramSyncState.interval = null;
  }
};

export { pauseSramSync };
