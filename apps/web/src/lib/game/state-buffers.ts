/* @layer bridge-wasm @kind logic */
/**
 * Save states held in memory rather than on disk — capture the live state into a buffer, and
 * push a buffer back into the core. The simulator and the manual/auto save flows work this way;
 * quick slots go through save-states.ts.
 */

import { checkLoadable, stripStamp } from '@shared/game/save-state';
import { log } from '../log-bus';
import { getModule } from './wasm-bridge';
import { isCoreReady } from './core-ready';
import { pollInventoryState } from './tracker';
import { reassertLiveFlagsAfterLoad } from './live-settings';

/** Scratch slot for buffers that never touch disk. Written, read by the core, then unlinked. */
const SCRATCH_SLOT = 98;

/**
 * Capture the current game state into a temp slot and return its raw bytes.
 * Encapsulates the WASM/MEMFS dance so views never touch the module directly.
 */
const captureStateBuffer = (slot = SCRATCH_SLOT): ArrayBuffer | null => {
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
 * Load a previously-captured state buffer, re-asserting live settings and refreshing the
 * tracker. Mirrors loadState() for buffers not on disk — synchronous, so unlike loadState it
 * cannot wait out a boot: callers reach it through ensureGameRunning() or already hold a live
 * core. A core that is not ready says so rather than returning a quiet false.
 */
const loadStateFromBuffer = (buffer: ArrayBuffer, slot = SCRATCH_SLOT): boolean => {
  if (!isCoreReady()) {
    log.error('[LoadState] Refusing buffer: the core is not running yet');
    return false;
  }
  const mod = getModule();
  if (!mod) return false;

  // Same guard as loadState. Buffers captured in-session are unstamped and pass
  // straight through; the check matters for the ones that came off disk.
  const verdict = checkLoadable(buffer);
  if (!verdict.ok) {
    log.error(`[LoadState] Refusing buffer: ${verdict.message}`);
    return false;
  }

  const savePath = `/saves/save${slot}.sav`;
  mod.FS.writeFile(savePath, new Uint8Array(stripStamp(buffer)));
  mod.ccall('WasmLoadState', null, ['number'], [slot]);
  reassertLiveFlagsAfterLoad();
  pollInventoryState(true);
  try { mod.FS.unlink(savePath); } catch { /* ignore */ }
  return true;
};

export { captureStateBuffer, loadStateFromBuffer };
