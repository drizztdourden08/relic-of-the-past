/* @layer bridge-wasm @kind logic */
/**
 * Periodic persistence of SRAM from WASM MEMFS to disk.
 */

import { log } from '../log-bus';
import * as savesStore from '../storage/saves-store';
import { getModule, getProfileId } from './wasm-bridge';

let sramSyncInterval: ReturnType<typeof setInterval> | null = null;
let lastSramHash: string | null = null;

const simpleHash = (data: Uint8Array): string => {
  let h = 0;
  for (let i = 0; i < data.length; i++) {
    h = ((h << 5) - h + data[i]) | 0;
  }
  return h.toString(36);
};

const syncSramToDisk = async (): Promise<void> => {
  const mod = getModule();
  const profileId = getProfileId();
  if (!mod || !profileId) return;
  try {
    mod.ccall('WasmSaveSram', null, [], []);
    const { exists } = mod.FS.analyzePath('/saves/sram.dat');
    if (!exists) {
      log.app('[SRAM] /saves/sram.dat does not exist in MEMFS, skipping sync');
      return;
    }
    const data = mod.FS.readFile('/saves/sram.dat');
    const hash = simpleHash(data);
    if (hash === lastSramHash) return;
    lastSramHash = hash;
    await savesStore.writeSram(profileId, (data.buffer as ArrayBuffer).slice(data.byteOffset, data.byteOffset + data.byteLength));
    log.app(`[SRAM] Synced ${data.byteLength} bytes to disk (hash=${hash})`);
  } catch {
    // Silently ignore, may happen during shutdown
  }
};

const armInterval = (): void => {
  lastSramHash = null;
  sramSyncInterval = setInterval(syncSramToDisk, 5000);
};

const startSramSync = (): void => {
  stopSramSync();
  armInterval();
};

const stopSramSync = (): void => {
  if (sramSyncInterval) {
    clearInterval(sramSyncInterval);
    sramSyncInterval = null;
  }
  syncSramToDisk();
};

/**
 * Pause the periodic flush WITHOUT the final flush stopSramSync performs. Used by
 * the gameplay simulator so a mid-run 5s tick never persists half-simulated SRAM
 * to the profile's sram.dat. Resume restarts the interval (also without a flush).
 */
const pauseSramSync = (): void => {
  if (sramSyncInterval) {
    clearInterval(sramSyncInterval);
    sramSyncInterval = null;
  }
};

const resumeSramSync = (): void => {
  if (sramSyncInterval) return; // already running, nothing to restart
  armInterval();
};

export { startSramSync, stopSramSync, pauseSramSync, resumeSramSync };
