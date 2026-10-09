/* @layer bridge-wasm @kind logic */
import { sramSyncState } from '@rotp/game-core';
import { syncSramToDisk } from './sync-sram-to-disk';
import { SYNC_INTERVAL_MS } from '@rotp/game-core';

const armInterval = (): void => {
  sramSyncState.lastHash = null;
  sramSyncState.interval = setInterval(syncSramToDisk, SYNC_INTERVAL_MS);
};

export { armInterval };
