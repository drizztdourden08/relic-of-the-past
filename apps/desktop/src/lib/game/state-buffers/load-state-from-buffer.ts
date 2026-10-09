/* @layer bridge-wasm @kind logic */
import { checkLoadable, stripStamp } from '@shared/game/save-state';
import { log } from '../../log-bus';
import { getModule } from '../wasm-bridge';
import { isCoreReady } from '../core-ready';
import { pollInventoryState } from '../tracker';
import { reassertLiveFlagsAfterLoad } from '../live-settings';
import { requestLocationRebaseline } from '../randomizer-client/location-poller';
import { reassertAfterSaveLoad } from '../host-menu';
import { markStateLoaded } from '../state-load-signal';
import { resumeDialogAfterLoad } from '../state-dialog';
import { unlinkScratchFile } from './unlink-scratch-file';
import { SCRATCH_SLOT } from './state-buffers.constants';

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
