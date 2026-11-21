/* @layer shared-game @kind logic */
import { GLYPH_SLOTS } from '../../dialogue-charset/dialogue-charset.constants';
import { extraGlyphTiles } from '../../extra-glyph-tiles';
import { composeLetter } from '../compose/compose-letter';
import { QUESTION } from '../latin-letters.constants';
import type { LetterFont, LetterGlyph } from '../latin-letters.type';
import { SYMBOL_OF } from './letter-table.constants';

const questionGlyph = (font: LetterFont): number => {
  const glyph = font.alphabet.indexOf(QUESTION);
  return glyph >= 0 && glyph < GLYPH_SLOTS ? glyph : 0;
};

const bankGlyphOf = (char: string, font: LetterFont): LetterGlyph => {
  const symbol = SYMBOL_OF.get(char);
  if (symbol === undefined) return composeLetter(char, font);
  return { char, width: symbol.width, fallbackGlyph: questionGlyph(font), tiles: extraGlyphTiles(symbol) };
};

export { bankGlyphOf };
