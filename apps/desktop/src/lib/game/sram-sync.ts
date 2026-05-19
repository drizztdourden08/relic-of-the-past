/**
 * SRAM Sync — periodic persistence of SRAM from WASM MEMFS to disk.
 */

import { log } from '../log-bus';
import { getModule, getProfileId } from './wasm-bridge';

let sramSyncInterval: ReturnType<typeof setInterval> | null = null;
let lastSramHash: string | null = null;

function simpleHash(data: Uint8Array): string {
  let h = 0;
  for (let i = 0; i < data.length; i++) {
    h = ((h << 5) - h + data[i]) | 0;
  }
  return h.toString(36);
}

async function syncSramToDisk(): Promise<void> {
  const mod = getModule();
  const profileId = getProfileId();
  if (!mod || !profileId) return;
  try {
    mod.ccall('WasmSaveSram', null, [], []);
    const { exists } = mod.FS.analyzePath('/saves/sram.dat');
    if (!exists) {
      log.app('[SRAM] /saves/sram.dat does not exist in MEMFS — skipping sync');
      return;
    }
    const data = mod.FS.readFile('/saves/sram.dat');
    const hash = simpleHash(data);
    if (hash === lastSramHash) return;
    lastSramHash = hash;
    await window.api.writeSram(profileId, data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
    log.app(`[SRAM] Synced ${data.byteLength} bytes to disk (hash=${hash})`);
  } catch {
    // Silently ignore — may happen during shutdown
  }
}

function startSramSync(): void {
  stopSramSync();
  lastSramHash = null;
  sramSyncInterval = setInterval(syncSramToDisk, 5000);
}

function stopSramSync(): void {
  if (sramSyncInterval) {
    clearInterval(sramSyncInterval);
    sramSyncInterval = null;
  }
  syncSramToDisk();
}

export { startSramSync, stopSramSync };
