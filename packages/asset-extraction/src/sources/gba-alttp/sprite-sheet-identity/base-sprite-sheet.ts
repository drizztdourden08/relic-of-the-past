/* @layer shared-asset-extraction @kind logic */
import { lzDecompressWithLen } from '../../../asset-builder';
import type { RomData } from '../../../rom/rom-types';
import { FIRST_COMPRESSED_SHEET, SOURCE_SHEET_BYTES } from './sprite-sheet-identity.constants';
import { spriteSheetAddress } from '../../../data/sprite-sheet-address';

const baseSpriteSheet = (snes: RomData, id: number): Buffer => {
  const address = spriteSheetAddress(id);
  if (id < FIRST_COMPRESSED_SHEET) return Buffer.from(snes.getBytes(address, SOURCE_SHEET_BYTES));
  return lzDecompressWithLen(snes, address).data;
};

export { baseSpriteSheet };
