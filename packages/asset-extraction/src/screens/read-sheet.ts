/* @layer shared-asset-extraction @kind logic */
import { lzDecompressWithLen } from '../asset-builder';
import type { RomData } from '../rom/rom-types';
import { readSheetPointer } from './read-sheet-pointers';
import type { ScreenAddressTable, SheetKind, SheetOverride } from './screen-payload.type';
import { SPRITE_RAW_SHEET_BYTES, SPRITE_RAW_SHEET_COUNT } from './screens.constants';

const sheetLength = (rom: RomData, kind: SheetKind, index: number, address: number): number =>
  kind === 'spr' && index < SPRITE_RAW_SHEET_COUNT
    ? SPRITE_RAW_SHEET_BYTES
    : lzDecompressWithLen(rom, address).compressedLength;

const readSheet = (rom: RomData, table: ScreenAddressTable, kind: SheetKind, index: number): SheetOverride => {
  const address = readSheetPointer(rom, table.sheetPointers[kind], index);
  return { kind, index, data: Uint8Array.from(rom.getBytes(address, sheetLength(rom, kind, index, address))) };
};

export { readSheet };
