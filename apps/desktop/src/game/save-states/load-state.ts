/* @layer bridge-wasm @kind logic */
import { checkLoadable, stripStamp } from '@rotp/game-core';
import { log } from '../../log-bus';
import * as savesStore from '../../storage/saves-store';
import { getModule, getProfileId } from '@rotp/game-core';
import { whenCoreReady } from '@rotp/game-core';
import { markStateLoaded } from '@rotp/game-core';
import { pollInventoryState } from '../tracker';
import { reassertLiveFlagsAfterLoad } from '../live-settings';
import { requestLocationRebaseline } from '../randomizer-client/location-poller';
import { reassertAfterSaveLoad } from '@rotp/game-core';
import { restoreMusicPosition } from '../msu-save-glue';
import { resumeDialogAfterLoad } from '../state-dialog';
import { memfsSavePath } from '@rotp/game-core';

const loadState = async (slot: number): Promise<boolean> => {
  log.app(`[LoadState] loadState(${slot}) called`);
  if (!(await whenCoreReady())) {
    log.error(`[LoadState] Slot ${slot} not loaded: the core never became ready`);
    return false;
  }
  const mod = getModule();
  const profileId = getProfileId();
  if (!mod || !profileId) {
    log.error(`[LoadState] Slot ${slot} not loaded: no module or no profileId`);
    return false;
  }
  try {
    log.app(`[LoadState] Reading slot ${slot} from disk (profileId=${profileId})...`);
    const buffer = await savesStore.readState(profileId, slot);
    if (!buffer) {
      log.app(`[LoadState] No save state file on disk for slot ${slot}`);
      return false;
    }
    log.app(`[LoadState] Got ${buffer.byteLength} bytes from disk`);

    const verdict = checkLoadable(buffer);
    if (!verdict.ok) {
      log.error(`[LoadState] Refusing slot ${slot}: ${verdict.message}`);
      return false;
    }

    const savePath = memfsSavePath(slot);
    const arr = new Uint8Array(stripStamp(buffer));
    log.app(`[LoadState] Writing ${arr.byteLength} bytes to MEMFS ${savePath}`);
    mod.FS.writeFile(savePath, arr);

    const { exists } = mod.FS.analyzePath(savePath);
    log.app(`[LoadState] MEMFS verify: ${savePath} exists=${exists}`);

    log.app(`[LoadState] Calling ccall('WasmLoadState', slot=${slot})...`);
    mod.ccall('WasmLoadState', null, ['number'], [slot]);
    log.app(`[LoadState] ccall returned; state loaded`);

    reassertLiveFlagsAfterLoad();
    resumeDialogAfterLoad(mod, verdict.stamp);
    requestLocationRebaseline();
    reassertAfterSaveLoad();
    markStateLoaded();

    await restoreMusicPosition(profileId, 'quick', slot);

    pollInventoryState(true);

    return true;
  } catch (err) {
    log.error(`[LoadState] EXCEPTION: ${err instanceof Error ? err.message : String(err)}`);
    if (err instanceof Error && err.stack) log.error(`[LoadState] ${err.stack}`);
    return false;
  }
};

export { loadState };
