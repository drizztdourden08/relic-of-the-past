/* @layer shared-asset-extraction @kind logic */
import { lzDecompressWithLen } from '../asset-builder';
import type { RomData } from '../rom/rom-types';
import { readSheetPointer } from './read-sheet-pointers';
import type { ScreenAddressTable, SheetPatch, SheetPatchSource } from './screen-payload.type';
import { SHEET_TILE_BYTES } from './screens.constants';

const readSheetPatch = (rom: RomData, table: ScreenAddressTable, source: SheetPatchSource): SheetPatch => {
  const sheet = lzDecompressWithLen(rom, readSheetPointer(rom, table.sheetPointers.spr, source.index)).data;
  const data = Uint8Array.from(
    source.tiles.flatMap((tile) => [...sheet.subarray(tile * SHEET_TILE_BYTES, (tile + 1) * SHEET_TILE_BYTES)]),
  );
  return { index: source.index, tiles: source.tiles, data };
};

export { readSheetPatch };
