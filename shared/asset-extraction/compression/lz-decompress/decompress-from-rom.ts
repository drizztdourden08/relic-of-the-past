/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../../rom/rom-types';
import { decompress } from './decompress';

const decompressFromRom = (rom: RomData, ea: number, offsetIsBe = true): Buffer => {
  return decompress(ea, (addr) => rom.getByte(addr), offsetIsBe);
};

export { decompressFromRom };
