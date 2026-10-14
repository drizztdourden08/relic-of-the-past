/* @layer bridge-wasm @kind logic */
import { createSramSync } from '@drizztdourden08/brock-port-kit/renderer';
import { getProfileId } from '@rotp/game-core';
import { portSaveStore } from '../../storage/saves-store/port-save-store';
import { SRAM_SYNC_MS } from '../port';
import { loggedSramStore } from './logged-sram-store';
import { readCoreSram } from './read-core-sram';
import { sramSyncHolder } from './sram-sync-holder';
import { stopSramSync } from './stop-sram-sync';

const startSramSync = (): void => {
  stopSramSync();
  const profileId = getProfileId();
  if (!profileId) return;
  const sync = createSramSync({ read: readCoreSram, store: loggedSramStore(portSaveStore.store().sram), profileId, intervalMs: SRAM_SYNC_MS });
  sramSyncHolder.current = sync;
  sync.start();
};

export { startSramSync };
