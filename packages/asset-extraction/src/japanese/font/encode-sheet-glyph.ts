/* @layer shared-asset-extraction @kind logic */
import { GLYPH_WIDTH, SHEET_GLYPH_BYTES, TILE_BYTES, TILE_ORIGINS, TILE_SIZE } from './japanese-font.constants';

const pixelOf = (pixels: Uint8Array, x: number, y: number): number => (
  x < GLYPH_WIDTH ? pixels[y * GLYPH_WIDTH + x] ?? 0 : 0
);

const writeTile = (out: Uint8Array, at: number, pixels: Uint8Array, origin: readonly [number, number]): void => {
  const [ox, oy] = origin;
  for (let row = 0; row < TILE_SIZE; row += 1) {
    let lo = 0;
    let hi = 0;
    for (let col = 0; col < TILE_SIZE; col += 1) {
      const value = pixelOf(pixels, ox + col, oy + row);
      lo |= (value & 1) << (7 - col);
      hi |= ((value >> 1) & 1) << (7 - col);
    }
    out[at + row * 2] = lo;
    out[at + row * 2 + 1] = hi;
  }
};

const encodeSheetGlyph = (pixels: Uint8Array): Uint8Array => {
  const out = new Uint8Array(SHEET_GLYPH_BYTES);
  TILE_ORIGINS.forEach((origin, tile) => writeTile(out, tile * TILE_BYTES, pixels, origin));
  return out;
};

export { encodeSheetGlyph };
