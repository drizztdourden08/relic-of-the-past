/* @layer bridge-wasm @kind logic */
/**
 * Save States — save/load game state snapshots + screenshot capture.
 */

import { log } from '../log-bus';
import * as savesStore from '../storage/saves-store';
import { getModule, getProfileId } from './wasm-bridge';
import { pollInventoryState } from './tracker';
import { reassertLiveFlagsAfterLoad } from './live-settings';
import { captureGameFrameBlob } from './capture-frame';

const saveState = async (slot: number): Promise<boolean> => {
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
    await savesStore.writeState(profileId, slot, ab);
    log.app(`[SaveState] Slot ${slot} persisted to disk ✓`);

    try {
      const blob = await captureGameFrameBlob();
      if (blob) {
        const screenshotAb = await blob.arrayBuffer();
        await savesStore.writeScreenshot(profileId, slot, screenshotAb);
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
};

const loadState = async (slot: number): Promise<boolean> => {
  const mod = getModule();
  const profileId = getProfileId();
  log.app(`[LoadState] loadState(${slot}) called — module=${!!mod}, profileId=${profileId}`);
  if (!mod || !profileId) {
    log.app('[LoadState] ABORT: no module or no profileId');
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

    const savePath = `/saves/save${slot}.sav`;
    const arr = new Uint8Array(buffer);
    log.app(`[LoadState] Writing ${arr.byteLength} bytes to MEMFS ${savePath}`);
    mod.FS.writeFile(savePath, arr);

    const { exists } = mod.FS.analyzePath(savePath);
    log.app(`[LoadState] MEMFS verify: ${savePath} exists=${exists}`);

    log.app(`[LoadState] Calling ccall('WasmLoadState', slot=${slot})...`);
    mod.ccall('WasmLoadState', null, ['number'], [slot]);
    log.app(`[LoadState] ccall returned — state loaded ✓`);

    // Re-assert all WASM flags that state load resets
    reassertLiveFlagsAfterLoad();

    // Force inventory poll so tracker reflects the loaded state
    pollInventoryState(true);

    return true;
  } catch (err) {
    log.error(`[LoadState] EXCEPTION: ${err instanceof Error ? err.message : String(err)}`);
    if (err instanceof Error && err.stack) log.error(`[LoadState] ${err.stack}`);
    return false;
  }
};

/**
 * Load a NORMAL (manual) save by its name rather than a quick-slot number.
 * Names are stable and quick-save can never overwrite them, so automation and
 * regression baselines pin to a name instead of a slot index. Matching is
 * case-insensitive; the newest save wins if two share a name.
 */
const loadNamedState = async (name: string): Promise<boolean> => {
  const profileId = getProfileId();
  if (!profileId) {
    log.app('[LoadState] ABORT: no profileId');
    return false;
  }
  const wanted = name.trim().toLowerCase();
  const saves = await savesStore.listNormalSaves(profileId);
  const match = saves.find((s) => s.name.toLowerCase() === wanted);
  if (!match) {
    log.error(`[LoadState] No manual save named "${name}". Available: ${saves.map((s) => s.name).join(', ') || 'none'}`);
    return false;
  }
  const buffer = await savesStore.loadNormalSave(profileId, match.id);
  if (!buffer) {
    log.error(`[LoadState] Manual save "${match.name}" (${match.id}) has no data on disk`);
    return false;
  }
  log.app(`[LoadState] Loading manual save "${match.name}" (${match.id}, ${buffer.byteLength} bytes)`);
  return loadStateFromBuffer(buffer);
};

/**
 * Load whichever the CLI asked for: a number is a quick-save slot, a string is
 * a manual save's name. One resolver so every automation flag behaves alike.
 */
const loadStateRef = (ref: number | string): Promise<boolean> =>
  typeof ref === 'number' ? loadState(ref) : loadNamedState(ref);

/**
 * Capture the current game state into a temp slot and return its raw bytes.
 * Encapsulates the WASM/MEMFS dance so views never touch the module directly.
 */
const captureStateBuffer = (slot = 98): ArrayBuffer | null => {
  const mod = getModule();
  if (!mod) return null;
  mod.ccall('WasmSaveState', null, ['number'], [slot]);
  const savePath = `/saves/save${slot}.sav`;
  if (!mod.FS.analyzePath(savePath).exists) return null;
  const data = mod.FS.readFile(savePath);
  const ab = (data.buffer as ArrayBuffer).slice(data.byteOffset, data.byteOffset + data.byteLength);
  try { mod.FS.unlink(savePath); } catch { /* ignore */ }
  return ab;
};

/**
 * Load a previously-captured state buffer, re-asserting live settings and
 * refreshing the tracker. Mirrors loadState() for buffers not on disk.
 */
const loadStateFromBuffer = (buffer: ArrayBuffer, slot = 98): boolean => {
  const mod = getModule();
  if (!mod) return false;
  const savePath = `/saves/save${slot}.sav`;
  mod.FS.writeFile(savePath, new Uint8Array(buffer));
  mod.ccall('WasmLoadState', null, ['number'], [slot]);
  reassertLiveFlagsAfterLoad();
  pollInventoryState(true);
  try { mod.FS.unlink(savePath); } catch { /* ignore */ }
  return true;
};

export { captureStateBuffer, loadNamedState, loadState, loadStateFromBuffer, loadStateRef, saveState };
