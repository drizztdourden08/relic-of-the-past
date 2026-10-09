/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../../rom/rom-types';
import { decompress } from './decompress';

const decompressFromRomWithLength = (rom: RomData, ea: number, offsetIsBe = true): [Buffer, number] => {
  return decompress(ea, (addr) => rom.getByte(addr), offsetIsBe, true);
};

export { decompressFromRomWithLength };
