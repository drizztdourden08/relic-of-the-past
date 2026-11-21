/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';
import { SHEET_TABLE_STRIDE } from './screens.constants';

const readSheetPointer = (rom: RomData, tableStart: number, index: number): number => {
  const bank = rom.getByte(tableStart + index);
  const high = rom.getByte(tableStart + SHEET_TABLE_STRIDE + index);
  const low = rom.getByte(tableStart + SHEET_TABLE_STRIDE * 2 + index);
  return (bank << 16) | (high << 8) | low;
};

export { readSheetPointer };
