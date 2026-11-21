/* @layer shared-game @kind logic */
import { GLYPH_SLOTS } from '../../dialogue-charset/dialogue-charset.constants';
import { QUESTION } from '../latin-letters.constants';
import type { LetterFont, LetterGlyph } from '../latin-letters.type';
import { glyphMask } from '../mask/glyph-mask';
import { MAX_WIDTH } from '../mask/mask.constants';
import { maskTiles } from '../mask/mask-tiles';
import { letterShape } from './letter-shape';

const glyphOf = (font: LetterFont, char: string): number => {
  const glyph = font.alphabet.indexOf(char);
  if (glyph >= 0 && glyph < GLYPH_SLOTS) return glyph;
  return Math.max(0, font.alphabet.indexOf(QUESTION));
};

const composeLetter = (char: string, font: LetterFont): LetterGlyph => {
  const shape = letterShape(char, font);
  if (shape !== undefined) {
    const fallbackGlyph = glyphOf(font, shape.fallback);
    return { char, width: shape.width, fallbackGlyph, tiles: maskTiles(shape.mask, shape.width) };
  }
  const glyph = glyphOf(font, QUESTION);
  const width = font.widths[glyph] ?? MAX_WIDTH;
  return { char, width, fallbackGlyph: glyph, tiles: maskTiles(glyphMask(font.sheet, glyph), width) };
};

export { composeLetter };
