/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { datName } from '../assets';
import { listRoms } from './list-roms';
import type { RomStatus } from './roms.type';

const listWithStatus = async (files: FileStore): Promise<RomStatus[]> => {
  const out: RomStatus[] = [];
  for (const romFile of await listRoms(files, 'snes-alttp')) {
    const stat = await files.stat(`assets/${datName(romFile)}`);
    const bytes = stat?.bytes ?? 0;
    const assetSize = bytes > 0 ? bytes : null;
    out.push({ romFile, hasAssets: assetSize !== null, assetSize });
  }
  return out;
};

export { listWithStatus };
