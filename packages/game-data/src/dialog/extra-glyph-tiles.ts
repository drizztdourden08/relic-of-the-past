/* @layer shared-game @kind logic */
import type { ExtraGlyph } from './extra-glyph.type';
import { COLUMNS, PALETTE_ENTRY_OF_PIXEL, ROWS, TILE_BYTES } from './extra-glyph-tiles.constants';

const extraGlyphTiles = (glyph: ExtraGlyph): Uint8Array => {
  const { rows } = glyph;
  const bytes = new Uint8Array(TILE_BYTES * 2);
  for (let y = 0; y < ROWS; y++) {
    let plane0 = 0;
    let plane1 = 0;
    for (let x = 0; x < COLUMNS; x++) {
      const value = PALETTE_ENTRY_OF_PIXEL[rows[y]?.[x] ?? ' '] ?? 0;
      plane0 |= (value & 1) << (7 - x);
      plane1 |= (value >> 1) << (7 - x);
    }
    const at = (y >> 3) * TILE_BYTES + (y & 7) * 2;
    bytes[at] = plane0;
    bytes[at + 1] = plane1;
  }
  return bytes;
};

export { extraGlyphTiles };
