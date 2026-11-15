/* @layer shared-asset-extraction @kind logic */
import { decode2bppTile } from '../../../graphics/bitplane-decoder';
import { GLYPH_ROWS, TILE_BYTES, TILE_SIDE } from './font.constants';
import { glyphBytes } from './glyph-bytes';

const glyphShades = (tiles: Uint8Array, glyph: number): number[][] => {
  const bytes = glyphBytes(tiles, glyph);
  const top = decode2bppTile(bytes, 0);
  const bottom = decode2bppTile(bytes, TILE_BYTES);
  return Array.from({ length: GLYPH_ROWS }, (_, row) => {
    const tile = row < TILE_SIDE ? top : bottom;
    const start = (row % TILE_SIDE) * TILE_SIDE;
    return Array.from(tile.subarray(start, start + TILE_SIDE));
  });
};

const glyphPixelGrid = (tiles: Uint8Array, glyph: number): number[][] =>
  glyphShades(tiles, glyph).map((row) => row.map((shade) => (shade === 0 ? 0 : 1)));

export { glyphPixelGrid };
