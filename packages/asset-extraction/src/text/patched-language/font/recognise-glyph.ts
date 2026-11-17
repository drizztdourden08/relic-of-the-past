/* @layer shared-asset-extraction @kind logic */
import { composeLetter, flippedLetter } from './accents';
import type { ComposedLetter } from './accents';
import type { GlyphIdentify, GlyphPass } from './font.type';

const recogniseGlyph = (input: GlyphIdentify, pass: GlyphPass, glyph: number, match: string | undefined): ComposedLetter | null => {
  if (match !== undefined) return { token: match, how: 'font', detail: 'matches a known font' };
  const look = { tiles: input.tiles, alphabet: input.alphabet, glyph };
  return composeLetter({ ...look, marks: pass.marks }) ?? flippedLetter(look);
};

export { recogniseGlyph };
