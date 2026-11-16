/* @layer shared-asset-extraction @kind logic */
import { composeLetter, flippedLetter, learnMarks } from './accents';
import type { ComposedLetter } from './accents';
import { RESTYLE_MATCH_RATIO, RESTYLE_MIN_CHANGED } from './font.constants';
import type { FontReference, GlyphIdentify, GlyphPass, GlyphReading } from './font.type';
import { glyphKey } from './glyph-key';
import { isBlankGlyph } from './is-blank-glyph';
import { isLatinToken } from './is-latin-token';
import { referenceKeys } from './reference-keys';

const looksChanged = (input: GlyphIdentify, base: FontReference | undefined, glyph: number, match: string | undefined): boolean => {
  if (isBlankGlyph(input.tiles, glyph)) return false;
  if (base) return glyphKey(input.tiles, glyph) !== glyphKey(base.tiles, glyph);
  return match !== undefined && match !== input.alphabet[glyph];
};

const recognise = (input: GlyphIdentify, pass: GlyphPass, glyph: number, match: string | undefined): ComposedLetter | null => {
  if (match !== undefined) return { token: match, how: 'font', detail: 'matches a known font' };
  const look = { tiles: input.tiles, alphabet: input.alphabet, glyph };
  return composeLetter({ ...look, marks: pass.marks }) ?? flippedLetter(look);
};

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
  const base = input.references.find((reference) => reference.isBase);
  const keys = referenceKeys(input.references, input.glyphLimit);
  const pass: GlyphPass = {
    alphabet: [...input.alphabet], changed: [], unknown: [], namings: [], marks: learnMarks(input.references), matched: 0,
  };
  for (let glyph = 0; glyph < input.glyphLimit; glyph += 1) {
    const match = keys.get(glyphKey(input.tiles, glyph));
    if (!looksChanged(input, base, glyph, match)) continue;
    pass.changed.push(glyph);
    nameGlyph(input, pass, glyph, recognise(input, pass, glyph, match));
  }
  const restyled = pass.changed.length >= RESTYLE_MIN_CHANGED && pass.matched / pass.changed.length < RESTYLE_MATCH_RATIO;
  const checked = base !== undefined;
  if (restyled) {
    return { alphabet: [...input.alphabet], changed: pass.changed, unknown: [], namings: [], checked, restyled };
  }
  const { alphabet, changed, unknown, namings } = pass;
  return { alphabet, changed, unknown, namings, checked, restyled };
};

export { identifyGlyphs };
