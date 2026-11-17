/* @layer shared-asset-extraction @kind logic */
import type { FontReference, GlyphIdentify } from './font.type';
import { glyphKey } from './glyph-key';
import { isBlankGlyph } from './is-blank-glyph';

const holdsSameLetter = (reference: FontReference, alphabet: readonly string[], glyph: number): boolean => {
  const token = alphabet[glyph];
  return token !== undefined && reference.alphabet[glyph] === token && !isBlankGlyph(reference.tiles, glyph);
};

const comparedFonts = (input: GlyphIdentify, glyph: number): FontReference[] => {
  const base = input.references.find((reference) => reference.isBase);
  if (base) return [base];
  return input.references.filter((reference) => holdsSameLetter(reference, input.alphabet, glyph));
};

const looksChanged = (input: GlyphIdentify, glyph: number, match: string | undefined): boolean => {
  if (isBlankGlyph(input.tiles, glyph)) return false;
  const fonts = comparedFonts(input, glyph);
  if (fonts.length === 0) return match !== undefined && match !== input.alphabet[glyph];
  const key = glyphKey(input.tiles, glyph);
  return fonts.every((font) => glyphKey(font.tiles, glyph) !== key);
};

export { looksChanged };
