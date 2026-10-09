/* @layer bridge-wasm @kind logic */
import { checkLoadable, stripStamp } from '@rotp/game-core';
import { log } from '../../log-bus';
import { getModule } from '@rotp/game-core';
import { isCoreReady } from '@rotp/game-core';
import { pollInventoryState } from '../tracker';
import { reassertLiveFlagsAfterLoad } from '../live-settings';
import { requestLocationRebaseline } from '../randomizer-client/location-poller';
import { reassertAfterSaveLoad } from '@rotp/game-core';
import { markStateLoaded } from '@rotp/game-core';
import { resumeDialogAfterLoad } from '../state-dialog';
import { unlinkScratchFile } from '@rotp/game-core';
import { SCRATCH_SLOT } from '@rotp/game-core';

const loadStateFromBuffer = (buffer: ArrayBuffer, slot = SCRATCH_SLOT): boolean => {
  if (!isCoreReady()) {
    log.error('[LoadState] Refusing buffer: the core is not running yet');
    return false;
  }
  const mod = getModule();
  if (!mod) return false;

  const verdict = checkLoadable(buffer);
  if (!verdict.ok) {
    log.error(`[LoadState] Refusing buffer: ${verdict.message}`);
    return false;
  }

  const savePath = `/saves/save${slot}.sav`;
  mod.FS.writeFile(savePath, new Uint8Array(stripStamp(buffer)));
  mod.ccall('WasmLoadState', null, ['number'], [slot]);
  reassertLiveFlagsAfterLoad();
  resumeDialogAfterLoad(mod, verdict.stamp);
  requestLocationRebaseline();
  reassertAfterSaveLoad();
  markStateLoaded();
  pollInventoryState(true);
  unlinkScratchFile(mod, savePath);
  return true;
};

export { loadStateFromBuffer };
