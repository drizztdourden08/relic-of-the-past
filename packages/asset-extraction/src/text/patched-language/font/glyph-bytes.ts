/* @layer shared-asset-extraction @kind logic */
import { GLYPHS_PER_ROW, TILE_BYTES } from './font.constants';
import { glyphTopOffset } from './glyph-top-offset';

const glyphBytes = (tiles: Uint8Array, glyph: number): Uint8Array => {
  const top = glyphTopOffset(glyph);
  const bottom = top + GLYPHS_PER_ROW * TILE_BYTES;
  const out = new Uint8Array(TILE_BYTES * 2);
  out.set(tiles.subarray(top, top + TILE_BYTES), 0);
  out.set(tiles.subarray(bottom, bottom + TILE_BYTES), TILE_BYTES);
  return out;
};

export { glyphBytes };
