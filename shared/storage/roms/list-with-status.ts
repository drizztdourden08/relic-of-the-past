/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { datName } from '../assets';
import { listRoms } from './list-roms';
import type { RomStatus } from './roms.type';

const listWithStatus = async (files: FileStore): Promise<RomStatus[]> => {
  const out: RomStatus[] = [];
  for (const romFile of await listRoms(files, 'snes-alttp')) {
    const stat = await files.stat(`assets/${datName(romFile)}`);
    const hasAssets = !!stat && stat.bytes > 0;
    out.push({ romFile, hasAssets, assetSize: hasAssets ? stat!.bytes : null });
  }
  return out;
};

export { listWithStatus };
