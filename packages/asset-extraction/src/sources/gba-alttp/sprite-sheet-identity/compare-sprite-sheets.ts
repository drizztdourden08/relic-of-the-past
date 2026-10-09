/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../../../rom/rom-types';
import { tileShapeMatches } from '../tile-shape-matches';
import { SOURCE_3BPP_TILE_BYTES, TILE_4BPP_BYTES, TILES_PER_SHEET } from '../tile-shape-matches.constants';
import type { CartridgeSpriteSheet, SheetMatch } from './sprite-sheet-identity.type';
import { SOURCE_SHEET_BYTES } from './sprite-sheet-identity.constants';
import { baseSpriteSheet } from './base-sprite-sheet';
import { toBaseSheetId } from './to-base-sheet-id';

const compareSpriteSheets = (
  snes: RomData,
  sheets: readonly CartridgeSpriteSheet[],
): SheetMatch[] => sheets.map(({ id, snes4bpp }) => {
  const baseId = toBaseSheetId(id);
  const source = baseSpriteSheet(snes, baseId);
  let matchingTiles = 0;
  if (source.length >= SOURCE_SHEET_BYTES) {
    for (let tile = 0; tile < TILES_PER_SHEET; tile++) {
      const cartridge = snes4bpp.subarray(tile * TILE_4BPP_BYTES, (tile + 1) * TILE_4BPP_BYTES);
      const sourceTile = source.subarray(tile * SOURCE_3BPP_TILE_BYTES, (tile + 1) * SOURCE_3BPP_TILE_BYTES);
      if (tileShapeMatches(cartridge, sourceTile)) matchingTiles++;
    }
  }
  return { cartridgeId: id, baseId, matchingTiles };
});

export { compareSpriteSheets };
