/* @layer shared-asset-extraction @kind logic */
import { decompress } from '../../compression/lz-decompress';
import type { RomData } from '../../rom/rom-types';
import type { DropSheets } from './drop-sprite-assembly.type';
import { spriteSheetAddress } from '../../data/sprite-sheet-address';

const loadDropSheets = (rom: RomData): DropSheets => {
  const getByte = (addr: number) => rom.getByte(addr);
  const sheetIds = [0, 6, 7, 10, 27];
  const sheets = new Map<number, Buffer>();

  for (const si of sheetIds) {
    if (si < 12) {
      sheets.set(si, rom.getBytes(spriteSheetAddress(si), 0x600));
    } else {
      sheets.set(si, decompress(spriteSheetAddress(si), getByte, false));
    }
  }

  const sheet96 = decompress(spriteSheetAddress(96), getByte, false);

  return { sheets, sheet96 };
};

export { loadDropSheets };
