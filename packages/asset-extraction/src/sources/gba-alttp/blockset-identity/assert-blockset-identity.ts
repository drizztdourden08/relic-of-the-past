/* @layer shared-asset-extraction @kind logic */
import { lzDecompressWithLen } from '../../../asset-builder';
import type { RomData } from '../../../rom/rom-types';
import { tileShapeMatches } from '../tile-shape-matches';
import { SOURCE_3BPP_TILE_BYTES, TILE_4BPP_BYTES, TILES_PER_SHEET } from '../tile-shape-matches.constants';
import { AUX_TILE_THEME, MAIN_TILE_THEME, MIN_MATCHING_TILES, SHEET_PACKS } from './blockset-identity.constants';
import { bgSheetAddress } from '../../../data/bg-sheet-address';

const assertBlocksetIdentity = (snes: RomData, portSheet: Buffer): number => {
  const expected = SHEET_PACKS.length * TILES_PER_SHEET * TILE_4BPP_BYTES;
  if (portSheet.length !== expected) {
    throw new Error(`Expected ${expected} bytes of background tiles, found ${portSheet.length}`);
  }
  let matching = 0;
  SHEET_PACKS.forEach((pack, sheet) => {
    const { data } = lzDecompressWithLen(snes, bgSheetAddress(pack));
    for (let tile = 0; tile < TILES_PER_SHEET; tile++) {
      const at = (sheet * TILES_PER_SHEET + tile) * TILE_4BPP_BYTES;
      const source = data.subarray(tile * SOURCE_3BPP_TILE_BYTES, (tile + 1) * SOURCE_3BPP_TILE_BYTES);
      if (tileShapeMatches(portSheet.subarray(at, at + TILE_4BPP_BYTES), source)) matching++;
    }
  });
  if (matching < MIN_MATCHING_TILES) {
    throw new Error(`Only ${matching} background tiles match themes ${MAIN_TILE_THEME}/${AUX_TILE_THEME}; the blockset identity no longer holds`);
  }
  return matching;
};

export { assertBlocksetIdentity };
