/* @layer bridge-wasm @kind logic */
import { getModule } from '@rotp/game-core';
import { log } from '../../log-bus';
import { ROTP_CORE } from '../port';

const readCoreSram = (): Uint8Array | null => {
  const mod = getModule();
  if (!mod) return null;
  const { files, exports } = ROTP_CORE;
  try {
    if (exports.saveSram) mod.ccall(exports.saveSram, null, [], []);
    if (!mod.FS.analyzePath(files.sram).exists) {
      log.app(`[SRAM] ${files.sram} does not exist in MEMFS, skipping sync`);
      return null;
    }
    return mod.FS.readFile(files.sram);
  } catch {
    return null;
  }
};

export { readCoreSram };
