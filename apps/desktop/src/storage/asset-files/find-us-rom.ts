/* @layer renderer-lib @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { GAME_ROM_LANGUAGE } from '@rotp/asset-extraction';
import { assets, roms } from '@rotp/roms';
import { romRelease } from './rom-release';

const findUsRom = async (files: FileStore): Promise<Uint8Array | null> => {
  for (const romFile of await roms.listRoms(files)) {
    const bytes = await assets.readRomBytes(files, romFile);
    if (bytes && (await romRelease(bytes))?.language === GAME_ROM_LANGUAGE) return bytes;
  }
  return null;
};

export { findUsRom };
