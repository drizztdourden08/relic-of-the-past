/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import * as savesStore from '../../storage/saves-store';
import { getModule, getProfileId, sramSyncState, SRAM_PATH } from '@rotp/game-core';

const simpleHash = (data: Uint8Array): string => {
  let h = 0;
  for (const byte of data) h = ((h << 5) - h + byte) | 0;
  return h.toString(36);
};

const syncSramToDisk = async (): Promise<void> => {
  const mod = getModule();
  const profileId = getProfileId();
  if (!mod || !profileId) return;
  try {
    mod.ccall('WasmSaveSram', null, [], []);
    const { exists } = mod.FS.analyzePath(SRAM_PATH);
    if (!exists) {
      log.app(`[SRAM] ${SRAM_PATH} does not exist in MEMFS, skipping sync`);
      return;
    }
    const data = mod.FS.readFile(SRAM_PATH);
    const hash = simpleHash(data);
    if (hash === sramSyncState.lastHash) return;
    sramSyncState.lastHash = hash;
    await savesStore.writeSram(profileId, (data.buffer as ArrayBuffer).slice(data.byteOffset, data.byteOffset + data.byteLength));
    log.app(`[SRAM] Synced ${data.byteLength} bytes to disk (hash=${hash})`);
  } catch {
    
  }
};

export { syncSramToDisk };
