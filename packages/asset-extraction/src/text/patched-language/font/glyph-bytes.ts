/* @layer shared-asset-extraction @kind logic */
import { GLYPHS_PER_ROW, TILES_PER_GLYPH_ROW, TILE_BYTES } from './font.constants';

const glyphTopOffset = (glyph: number): number =>
  (Math.floor(glyph / GLYPHS_PER_ROW) * TILES_PER_GLYPH_ROW + (glyph % GLYPHS_PER_ROW)) * TILE_BYTES;

const glyphBytes = (tiles: Uint8Array, glyph: number): Uint8Array => {
  const top = glyphTopOffset(glyph);
  const bottom = top + GLYPHS_PER_ROW * TILE_BYTES;
  const out = new Uint8Array(TILE_BYTES * 2);
  out.set(tiles.subarray(top, top + TILE_BYTES), 0);
  out.set(tiles.subarray(bottom, bottom + TILE_BYTES), TILE_BYTES);
  return out;
};

const glyphKey = (tiles: Uint8Array, glyph: number): string => Buffer.from(glyphBytes(tiles, glyph)).toString('hex');

const isBlankGlyph = (tiles: Uint8Array, glyph: number): boolean => glyphBytes(tiles, glyph).every((byte) => byte === 0);

export { glyphBytes, glyphKey, glyphTopOffset, isBlankGlyph };
