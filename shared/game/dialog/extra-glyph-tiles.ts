/* @layer shared-game @kind logic */
/**
 * An extra glyph's pixel rows (extra-glyphs.data.ts) as the font sheet stores a glyph: two 8x8
 * 2bpp tiles, the top 8 rows then the bottom 8. Each pixel row is two bytes, bit plane 0 then bit
 * plane 1, leftmost pixel in bit 7, the SNES layout the engine reads (messaging.c VWF_RenderSingle).
 */
import type { ExtraGlyph } from './extra-glyphs.data';

const ROWS = 16;
const COLUMNS = 8;
const TILE_BYTES = 16;
/** Pixel symbol to palette entry: ground, edge, body. */
const ENTRY: Readonly<Record<string, number>> = { ' ': 0, '.': 1, '#': 2 };

/** The glyph's 32 bytes, top tile then bottom tile. */
const extraGlyphTiles = (glyph: ExtraGlyph): Uint8Array => {
  const { rows } = glyph;
  const bytes = new Uint8Array(TILE_BYTES * 2);
  for (let y = 0; y < ROWS; y++) {
    let plane0 = 0;
    let plane1 = 0;
    for (let x = 0; x < COLUMNS; x++) {
      const value = ENTRY[rows[y]?.[x] ?? ' '] ?? 0;
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
