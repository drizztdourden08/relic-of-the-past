/* @layer bridge-wasm @kind logic */
import { pauseSramSync } from '@rotp/game-core';
import { syncSramToDisk } from './sync-sram-to-disk';

const stopSramSync = (): void => {
  pauseSramSync();
  syncSramToDisk();
};

export { stopSramSync };
