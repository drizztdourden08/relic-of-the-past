/* @layer bridge-wasm @kind logic */
import type { SramStore } from '@drizztdourden08/brock-port-kit';
import { log } from '../../log-bus';
import { errorMessage } from '../../storage/error-message';

const loggedSramStore = (sram: SramStore): SramStore => ({
  read: (profileId) => sram.read(profileId),
  write: async (profileId, bytes) => {
    try {
      await sram.write(profileId, bytes);
      log.app(`[SRAM] Synced ${bytes.byteLength} bytes to disk`);
    } catch (err) {
      log.app(`[SRAM] Sync failed: ${errorMessage(err)}`, 'warn');
    }
  },
});

export { loggedSramStore };
