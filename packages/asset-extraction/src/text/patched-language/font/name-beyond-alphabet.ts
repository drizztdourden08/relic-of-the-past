/* @layer shared-asset-extraction @kind logic */
import type { GlyphIdentify, GlyphPass } from './font.type';
import { isBlankGlyph } from './is-blank-glyph';
import { shiftedCopyOf } from './shifted-copy-of';

const nameBeyondAlphabet = (input: GlyphIdentify, pass: GlyphPass): void => {
  for (let glyph = input.alphabet.length; glyph < input.glyphLimit; glyph += 1) {
    if (isBlankGlyph(input.tiles, glyph)) continue;
    const token = shiftedCopyOf(input.tiles, input.alphabet, glyph);
    if (token === null) continue;
    pass.alphabet[glyph] = token;
    pass.namings.push({ glyph, token, how: 'shape', detail: 'a shifted copy of a release letter' });
  }
};

export { nameBeyondAlphabet };
