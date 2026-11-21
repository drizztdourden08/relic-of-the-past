/* @layer shared-asset-extraction @kind logic */
import { lzDecompressWithLen } from '../asset-builder';
import type { RomData } from '../rom/rom-types';
import { readSheetPointer } from './read-sheet-pointers';
import type { ScreenAddressTable, SheetPatch, SheetPatchSource } from './screen-payload.type';
import { SHEET_TILE_BYTES, SPRITE_RAW_SHEET_BYTES, SPRITE_RAW_SHEET_COUNT } from './screens.constants';

const readSheetPatch = (
  rom: RomData,
  table: Pick<ScreenAddressTable, 'sheetPointers'>,
  source: SheetPatchSource,
): SheetPatch => {
  const address = readSheetPointer(rom, table.sheetPointers.spr, source.index);
  const sheet = source.index < SPRITE_RAW_SHEET_COUNT
    ? rom.getBytes(address, SPRITE_RAW_SHEET_BYTES)
    : lzDecompressWithLen(rom, address).data;
  const data = Uint8Array.from(
    source.tiles.flatMap((tile) => [...sheet.subarray(tile * SHEET_TILE_BYTES, (tile + 1) * SHEET_TILE_BYTES)]),
  );
  return { index: source.index, tiles: source.tiles, data };
};

export { readSheetPatch };
