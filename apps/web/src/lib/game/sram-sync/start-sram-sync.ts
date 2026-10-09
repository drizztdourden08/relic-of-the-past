/* @layer bridge-wasm @kind logic */
import { armInterval } from './arm-interval';
import { stopSramSync } from './stop-sram-sync';

const startSramSync = (): void => {
  stopSramSync();
  armInterval();
};

export { startSramSync };
