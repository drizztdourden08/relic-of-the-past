/* @layer shared-asset-extraction @kind logic */
import { convertGbaSheetToSnes4bpp } from '../../../graphics/gba-native';
import type { GbaRomReader } from '../../../rom/gba-rom';
import {
  ANIMATED_SLOT_6_FIRST_TILE, ANIMATED_SLOT_6_SHEET, ANIMATED_SLOT_7_FIRST_TILE, ANIMATED_SLOT_7_SHEET,
  ANIMATED_SOURCE_END_TILE, ANIMATED_SOURCE_FIRST_TILE, PALACE_TILE_COUNT, TILE_BYTES,
} from './graphics-source.constants';
import { PALACE_SHEETS } from './graphics-source.data';
import { loadPalaceSheet } from './load-palace-sheet';

const copyAnimatedTiles = (rom: GbaRomReader, packed: Buffer, sheetAddress: number, firstTile: number): void => {
  loadPalaceSheet(rom, sheetAddress).copy(
    packed,
    firstTile * TILE_BYTES,
    ANIMATED_SOURCE_FIRST_TILE * TILE_BYTES,
    ANIMATED_SOURCE_END_TILE * TILE_BYTES,
  );
};

const extractPalaceSnes4bppTiles = (rom: GbaRomReader): Buffer => {
  const packed = Buffer.alloc(PALACE_TILE_COUNT * TILE_BYTES);
  for (const source of PALACE_SHEETS) loadPalaceSheet(rom, source.address).copy(packed, source.firstTile * TILE_BYTES);
  copyAnimatedTiles(rom, packed, ANIMATED_SLOT_6_SHEET, ANIMATED_SLOT_6_FIRST_TILE);
  copyAnimatedTiles(rom, packed, ANIMATED_SLOT_7_SHEET, ANIMATED_SLOT_7_FIRST_TILE);
  return convertGbaSheetToSnes4bpp(packed);
};

export { extractPalaceSnes4bppTiles };
