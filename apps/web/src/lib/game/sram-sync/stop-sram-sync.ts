/* @layer bridge-wasm @kind logic */
import { pauseSramSync } from './pause-sram-sync';
import { syncSramToDisk } from './sync-sram-to-disk';

const stopSramSync = (): void => {
  pauseSramSync();
  syncSramToDisk();
};

export { stopSramSync };
