/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import * as savesStore from '../../storage/saves-store';
import { getModule, getProfileId } from '../wasm-bridge';
import { isCoreReady } from '../core-ready';
import { captureGameFrameBlob } from '../capture-frame';
import { saveMusicPosition } from '../msu-save-glue';
import { withDialogState } from '../state-dialog';
import { memfsSavePath } from './memfs-save-path';

const saveScreenshotBestEffort = async (profileId: string, slot: number): Promise<void> => {
  try {
    const blob = await captureGameFrameBlob();
    if (blob) {
      const screenshotAb = await blob.arrayBuffer();
      await savesStore.writeScreenshot(profileId, slot, screenshotAb);
      log.app(`[SaveState] Screenshot saved (${(screenshotAb.byteLength / 1024).toFixed(0)} KB)`);
    }
  } catch {
    return;
  }
};

const saveState = async (slot: number): Promise<boolean> => {
  const mod = getModule();
  const profileId = getProfileId();
  log.app(`[SaveState] saveState(${slot}) called with module=${!!mod}, profileId=${profileId}`);
  if (!isCoreReady() || !mod || !profileId) {
    log.error(`[SaveState] Slot ${slot} not saved: the core is not running yet`);
    return false;
  }
  try {
    log.app(`[SaveState] Calling ccall('WasmSaveState', slot=${slot})...`);
    mod.ccall('WasmSaveState', null, ['number'], [slot]);
    log.app('[SaveState] ccall returned');

    const savePath = memfsSavePath(slot);
    const { exists } = mod.FS.analyzePath(savePath);
    log.app(`[SaveState] MEMFS ${savePath} exists=${exists}`);
    if (!exists) {
      log.app('[SaveState] ABORT: file not found in MEMFS after ccall');
      return false;
    }

    const data = mod.FS.readFile(savePath);
    log.app(`[SaveState] Read ${data.byteLength} bytes from MEMFS`);

    const ab = withDialogState(mod, (data.buffer as ArrayBuffer).slice(data.byteOffset, data.byteOffset + data.byteLength));
    log.app(`[SaveState] Sending ${ab.byteLength} bytes to main process (profileId=${profileId}, slot=${slot})...`);
    await savesStore.writeState(profileId, slot, ab);
    log.app(`[SaveState] Slot ${slot} persisted to disk ✓`);

    await saveMusicPosition(profileId, 'quick', slot);
    await saveScreenshotBestEffort(profileId, slot);

    return true;
  } catch (err) {
    log.error(`[SaveState] EXCEPTION: ${err instanceof Error ? err.message : String(err)}`);
    if (err instanceof Error && err.stack) log.error(`[SaveState] ${err.stack}`);
    return false;
  }
};

export { saveState };
