/**
 * Save States — save/load game state snapshots + screenshot capture.
 */

import { log } from '../log-bus';
import { getModule, getProfileId } from './wasm-bridge';
import { pollInventoryState } from './tracker';
import { reassertBackdropBlack } from './live-settings';

function captureScreenshot(): Promise<Blob | null> {
  const canvas = document.querySelector('.game-layer__canvas') as HTMLCanvasElement | null;
  if (!canvas) return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    } catch {
      resolve(null);
    }
  });
}

async function saveState(slot: number): Promise<boolean> {
  const mod = getModule();
  const profileId = getProfileId();
  log.app(`[SaveState] saveState(${slot}) called — module=${!!mod}, profileId=${profileId}`);
  if (!mod || !profileId) {
    log.app('[SaveState] ABORT: no module or no profileId');
    return false;
  }
  try {
    log.app(`[SaveState] Calling ccall('WasmSaveState', slot=${slot})...`);
    mod.ccall('WasmSaveState', null, ['number'], [slot]);
    log.app('[SaveState] ccall returned');

    const savePath = `/saves/save${slot}.sav`;
    const { exists } = mod.FS.analyzePath(savePath);
    log.app(`[SaveState] MEMFS ${savePath} exists=${exists}`);
    if (!exists) {
      log.app('[SaveState] ABORT: file not found in MEMFS after ccall');
      return false;
    }

    const data = mod.FS.readFile(savePath);
    log.app(`[SaveState] Read ${data.byteLength} bytes from MEMFS`);

    const ab = (data.buffer as ArrayBuffer).slice(data.byteOffset, data.byteOffset + data.byteLength);
    log.app(`[SaveState] Sending ${ab.byteLength} bytes to main process (profileId=${profileId}, slot=${slot})...`);
    await window.api.writeState(profileId, slot, ab);
    log.app(`[SaveState] Slot ${slot} persisted to disk ✓`);

    try {
      const blob = await captureScreenshot();
      if (blob) {
        const screenshotAb = await blob.arrayBuffer();
        await window.api.writeScreenshot(profileId, slot, screenshotAb);
        log.app(`[SaveState] Screenshot saved (${(screenshotAb.byteLength / 1024).toFixed(0)} KB)`);
      }
    } catch {
      // Screenshot is best-effort
    }

    return true;
  } catch (err) {
    log.error(`[SaveState] EXCEPTION: ${err instanceof Error ? err.message : String(err)}`);
    if (err instanceof Error && err.stack) log.error(`[SaveState] ${err.stack}`);
    return false;
  }
}

async function loadState(slot: number): Promise<boolean> {
  const mod = getModule();
  const profileId = getProfileId();
  log.app(`[LoadState] loadState(${slot}) called — module=${!!mod}, profileId=${profileId}`);
  if (!mod || !profileId) {
    log.app('[LoadState] ABORT: no module or no profileId');
    return false;
  }
  try {
    log.app(`[LoadState] Reading slot ${slot} from disk (profileId=${profileId})...`);
    const buffer = await window.api.readState(profileId, slot);
    if (!buffer) {
      log.app(`[LoadState] No save state file on disk for slot ${slot}`);
      return false;
    }
    log.app(`[LoadState] Got ${buffer.byteLength} bytes from disk`);

    const savePath = `/saves/save${slot}.sav`;
    const arr = new Uint8Array(buffer);
    log.app(`[LoadState] Writing ${arr.byteLength} bytes to MEMFS ${savePath}`);
    mod.FS.writeFile(savePath, arr);

    const { exists } = mod.FS.analyzePath(savePath);
    log.app(`[LoadState] MEMFS verify: ${savePath} exists=${exists}`);

    log.app(`[LoadState] Calling ccall('WasmLoadState', slot=${slot})...`);
    mod.ccall('WasmLoadState', null, ['number'], [slot]);
    log.app(`[LoadState] ccall returned — state loaded ✓`);

    // Re-assert backdrop black flag (defensive: ensures it's not lost after load)
    reassertBackdropBlack();

    // Force inventory poll so tracker reflects the loaded state
    pollInventoryState(true);

    return true;
  } catch (err) {
    log.error(`[LoadState] EXCEPTION: ${err instanceof Error ? err.message : String(err)}`);
    if (err instanceof Error && err.stack) log.error(`[LoadState] ${err.stack}`);
    return false;
  }
}

export { loadState, saveState };
