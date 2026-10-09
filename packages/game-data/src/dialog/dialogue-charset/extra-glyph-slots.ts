/* @layer shared-game @kind logic */
import { EXTRA_GLYPHS } from '../extra-glyphs.constants';
import type { ExtraGlyphSlot } from './dialogue-charset.type';
import { GLYPH_SLOTS } from './dialogue-charset.constants';
import { alphabetChars } from './alphabet-chars';

const extraGlyphSlots = (alphabet: readonly string[], widthCount: number): ExtraGlyphSlot[] => {
  const first = Math.max(alphabet.length, widthCount);
  const drawn = alphabetChars(alphabet);
  return EXTRA_GLYPHS.filter((glyph) => !drawn.has(glyph.char))
    .slice(0, Math.max(0, GLYPH_SLOTS - first))
    .map((glyph, index) => ({ char: glyph.char, slot: first + index, width: glyph.width }));
};

export { extraGlyphSlots };
