/* @layer shared-asset-extraction @kind logic */
import type { GlyphRun } from './japanese-font.type';
import { GLYPH_BYTES, GLYPH_DATA_OFFSET, MASK_BITS } from './japanese-font.constants';

const maskBit = (mask: Uint8Array, bit: number): number => ((mask[bit >> 3] ?? 0) >> (7 - (bit & 7))) & 1;

const decompressGlyph = (mask: Uint8Array, data: Uint8Array, start: number): GlyphRun => {
  const bytes = new Uint8Array(GLYPH_BYTES);
  let read = start;
  for (let bit = 0; bit < MASK_BITS; bit += 1) {
    if (maskBit(mask, bit) === 1) {
      bytes[GLYPH_DATA_OFFSET + bit] = data[read] ?? 0;
      read += 1;
    }
  }
  return { bytes, next: read };
};

export { decompressGlyph };
