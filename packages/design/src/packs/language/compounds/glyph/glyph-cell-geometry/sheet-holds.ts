/* @layer renderer-components @kind logic */
import { BOTTOM_TILE_STEP, MAX_GLYPH } from '../glyph.constants';
import { topTileOf } from './top-tile-of';

const sheetHolds = (glyph: number, tileCount: number): boolean => (
  Number.isInteger(glyph)
  && glyph >= 0
  && glyph <= MAX_GLYPH
  && topTileOf(glyph) + BOTTOM_TILE_STEP < tileCount
);

export { sheetHolds };
