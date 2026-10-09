/* @layer shared-asset-extraction @kind logic */
import { decompress } from '../../compression/lz-decompress';
import { kCompSpritePtrs } from '../../data/tables';
import type { RomData } from '../../rom/rom-types';
import type { ReceiptSheets } from './receipt-decoder.type';

const loadReceiptSheets = (rom: RomData): ReceiptSheets => {
  const getByte = (addr: number) => rom.getByte(addr);
  return {
    base: decompress(kCompSpritePtrs[0x5a], getByte, false),
    sheet5B: decompress(kCompSpritePtrs[0x5b], getByte, false),
    sheet5C: decompress(kCompSpritePtrs[0x5c], getByte, false),
    sheet5D: decompress(kCompSpritePtrs[0x5d], getByte, false),
  };
};

export { loadReceiptSheets };
