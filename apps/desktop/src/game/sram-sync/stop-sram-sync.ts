/* @layer bridge-wasm @kind logic */
import { sramSyncHolder } from './sram-sync-holder';

const stopSramSync = (): void => {
  const sync = sramSyncHolder.current;
  sramSyncHolder.current = null;
  void sync?.stop();
};

export { stopSramSync };
