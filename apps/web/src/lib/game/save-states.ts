/* @layer bridge-wasm @kind logic */
/**
 * Save States — save/load game state snapshots + screenshot capture.
 */

import { checkLoadable, stripStamp } from '@shared/game/save-state';
import { log } from '../log-bus';
import * as savesStore from '../storage/saves-store';
import { getModule, getProfileId } from './wasm-bridge';
import { isCoreReady, whenCoreReady } from './core-ready';
import { loadStateFromBuffer } from './state-buffers';
import { pollInventoryState } from './tracker';
import { reassertLiveFlagsAfterLoad } from './live-settings';
import { captureGameFrameBlob } from './capture-frame';

const saveState = async (slot: number): Promise<boolean> => {
  const mod = getModule();
  const profileId = getProfileId();
  log.app(`[SaveState] saveState(${slot}) called — module=${!!mod}, profileId=${profileId}`);
  // Unlike a load, a save is not worth waiting a boot out for: what it would capture once the
  // core came up is the boot screen, written over whatever the slot already held.
  if (!isCoreReady() || !mod || !profileId) {
    log.error(`[SaveState] Slot ${slot} not saved: the core is not running yet`);
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
  log.app(`[LoadState] loadState(${slot}) called`);
  // The shortcuts and the overlay arm with the game VIEW, which is up about two seconds before
  // the core is. A request from that window is early, not wrong — so it waits for the core
  // rather than being dropped, which is what made a load right after boot silently do nothing.
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

    // Before the core sees it: a snapshot from a different layout would read off the end
    // of the buffer, and the assert that would have caught it is compiled out of a
    // release build.
    const verdict = checkLoadable(buffer);
    if (!verdict.ok) {
      log.error(`[LoadState] Refusing slot ${slot}: ${verdict.message}`);
      return false;
    }

    const savePath = `/saves/save${slot}.sav`;
    const arr = new Uint8Array(stripStamp(buffer));
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
  // Same reason as loadState: a named load can be asked for while the core is still coming up.
  if (!(await whenCoreReady())) {
    log.error(`[LoadState] "${name}" not loaded: the core never became ready`);
    return false;
  }
  const profileId = getProfileId();
  if (!profileId) {
    log.error('[LoadState] ABORT: no profileId');
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

export { loadNamedState, loadState, loadStateRef, saveState };
