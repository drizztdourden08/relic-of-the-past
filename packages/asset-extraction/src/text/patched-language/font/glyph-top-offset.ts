/* @layer shared-asset-extraction @kind logic */
import { GLYPHS_PER_ROW, TILES_PER_GLYPH_ROW, TILE_BYTES } from './font.constants';

const glyphTopOffset = (glyph: number): number =>
  (Math.floor(glyph / GLYPHS_PER_ROW) * TILES_PER_GLYPH_ROW + (glyph % GLYPHS_PER_ROW)) * TILE_BYTES;

export { glyphTopOffset };
