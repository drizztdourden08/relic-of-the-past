/* @layer shared-asset-extraction @kind logic */
import { learnMarks } from './accents';
import type { ComposedLetter } from './accents';
import { RESTYLE_MATCH_RATIO, RESTYLE_MIN_CHANGED } from './font.constants';
import type { GlyphIdentify, GlyphPass, GlyphReading } from './font.type';
import { glyphKey } from './glyph-key';
import { isLatinToken } from './is-latin-token';
import { looksChanged } from './looks-changed';
import { nameBeyondAlphabet } from './name-beyond-alphabet';
import { recogniseGlyph } from './recognise-glyph';
import { referenceKeys } from './reference-keys';

const nameGlyph = (input: GlyphIdentify, pass: GlyphPass, glyph: number, found: ComposedLetter | null): void => {
  if (found === null || !isLatinToken(found.token)) {
    pass.unknown.push(glyph);
    return;
  }
  if (found.how === 'font') pass.matched += 1;
  if (found.token === input.alphabet[glyph]) return;
  pass.alphabet[glyph] = found.token;
  pass.namings.push({ glyph, ...found });
};

const identifyGlyphs = (input: GlyphIdentify): GlyphReading => {
  const pass: GlyphPass = {
    alphabet: [...input.alphabet], changed: [], unknown: [], namings: [], marks: learnMarks(input.references), matched: 0,
    keys: referenceKeys(input.references, input.glyphLimit),
  };
  for (let glyph = 0; glyph < input.glyphLimit; glyph += 1) {
    const match = pass.keys.get(glyphKey(input.tiles, glyph));
    if (!looksChanged(input, glyph, match)) continue;
    pass.changed.push(glyph);
    nameGlyph(input, pass, glyph, recogniseGlyph(input, pass, glyph, match));
  }
  nameBeyondAlphabet(input, pass);
  const restyled = pass.changed.length >= RESTYLE_MIN_CHANGED && pass.matched / pass.changed.length < RESTYLE_MATCH_RATIO;
  const checked = input.references.length > 0;
  if (restyled) {
    return { alphabet: [...input.alphabet], changed: pass.changed, unknown: [], namings: [], checked, restyled };
  }
  const { alphabet, changed, unknown, namings } = pass;
  return { alphabet, changed, unknown, namings, checked, restyled };
};

export { identifyGlyphs };
