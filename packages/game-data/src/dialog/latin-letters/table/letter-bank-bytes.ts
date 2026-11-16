/* @layer shared-game @kind logic */
import type { LetterGlyph } from '../latin-letters.type';
import { LETTER_ENTRY_BYTES, LETTER_TILE_OFFSET } from './letter-table.constants';

const letterBankBytes = (glyphs: readonly LetterGlyph[]): Uint8Array => {
  const bytes = new Uint8Array(glyphs.length * LETTER_ENTRY_BYTES);
  glyphs.forEach((glyph, index) => {
    const at = index * LETTER_ENTRY_BYTES;
    bytes[at] = glyph.width;
    bytes[at + 1] = glyph.fallbackGlyph;
    bytes.set(glyph.tiles, at + LETTER_TILE_OFFSET);
  });
  return bytes;
};

export { letterBankBytes };
