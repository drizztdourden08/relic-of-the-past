/* @layer shared-asset-extraction @kind logic */
import type { ComposedLetter } from './accents';
import type { GlyphIdentify, GlyphPass } from './font.type';
import { glyphKey } from './glyph-key';
import { isBlankGlyph } from './is-blank-glyph';
import { isLatinToken } from './is-latin-token';
import { recogniseGlyph } from './recognise-glyph';
import { shiftedCopyOf } from './shifted-copy-of';

const beyondLetter = (input: GlyphIdentify, pass: GlyphPass, glyph: number): ComposedLetter | null => {
  const token = shiftedCopyOf(input.tiles, input.alphabet, glyph);
  if (token !== null) return { token, how: 'shape', detail: 'a shifted copy of a release letter' };
  if (pass.changed.includes(glyph)) return null;
  return recogniseGlyph(input, pass, glyph, pass.keys.get(glyphKey(input.tiles, glyph)));
};

const nameBeyondAlphabet = (input: GlyphIdentify, pass: GlyphPass): void => {
  for (let glyph = input.alphabet.length; glyph < input.glyphLimit; glyph += 1) {
    if (isBlankGlyph(input.tiles, glyph) || pass.alphabet[glyph] !== undefined) continue;
    const found = beyondLetter(input, pass, glyph);
    if (found === null || !isLatinToken(found.token)) continue;
    pass.alphabet[glyph] = found.token;
    pass.namings.push({ glyph, ...found });
  }
};

export { nameBeyondAlphabet };
