/* @layer shared-asset-extraction @kind logic */
import {
  COLUMN_PAIRS_OFFSET, GLYPH_HEIGHT, GLYPH_PIXELS, GLYPH_WIDTH, HALF_BYTES, TILE_SIZE,
} from './japanese-font.constants';

const bitOf = (byte: number, bit: number): number => (byte >> bit) & 1;

const pixelAt = (glyph: Uint8Array, half: number, x: number, y: number): number => {
  const base = half * HALF_BYTES;
  if (x < TILE_SIZE) {
    const lo = glyph[base + y * 2] ?? 0;
    const hi = glyph[base + y * 2 + 1] ?? 0;
    return bitOf(lo, 7 - x) | (bitOf(hi, 7 - x) << 1);
  }
  const pair = base + COLUMN_PAIRS_OFFSET + (x - TILE_SIZE) * 2;
  return bitOf(glyph[pair] ?? 0, 7 - y) | (bitOf(glyph[pair + 1] ?? 0, 7 - y) << 1);
};

const decodeGlyph11x16 = (glyph: Uint8Array): Uint8Array => {
  const pixels = new Uint8Array(GLYPH_PIXELS);
  for (let y = 0; y < GLYPH_HEIGHT; y += 1) {
    for (let x = 0; x < GLYPH_WIDTH; x += 1) {
      pixels[y * GLYPH_WIDTH + x] = pixelAt(glyph, y >> 3, x, y & 7);
    }
  }
  return pixels;
};

export { decodeGlyph11x16 };
