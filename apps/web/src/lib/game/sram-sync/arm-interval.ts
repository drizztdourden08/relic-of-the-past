/* @layer bridge-wasm @kind logic */
import { sramSyncState } from './sram-sync-state';
import { syncSramToDisk } from './sync-sram-to-disk';
import { SYNC_INTERVAL_MS } from './sram-sync.constants';

const armInterval = (): void => {
  sramSyncState.lastHash = null;
  sramSyncState.interval = setInterval(syncSramToDisk, SYNC_INTERVAL_MS);
};

export { armInterval };
