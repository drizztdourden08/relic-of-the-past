/* @layer shared-asset-extraction @kind logic */
import { glyphPlaceholder } from '../../glyph-map';
import type { GlyphMap } from '../../glyph-map';
import { RESTYLE_MATCH_RATIO, RESTYLE_MIN_CHANGED } from './font.constants';
import type { FontReference, GlyphIdentify, GlyphReading } from './font.type';
import { glyphKey, isBlankGlyph } from './glyph-bytes';
import { referenceKeys } from './reference-keys';

interface GlyphPass {
  alphabet: string[];
  glyphs: GlyphMap;
  changed: number[];
  unknown: number[];
  matched: number;
}

const looksChanged = (input: GlyphIdentify, base: FontReference | undefined, glyph: number, match: string | undefined): boolean => {
  if (isBlankGlyph(input.tiles, glyph)) return false;
  if (base) return glyphKey(input.tiles, glyph) !== glyphKey(base.tiles, glyph);
  return match !== undefined && match !== input.alphabet[glyph];
};

const nameGlyph = (input: GlyphIdentify, pass: GlyphPass, glyph: number, match: string | undefined): void => {
  const baseToken = input.alphabet[glyph];
  if (match !== undefined) pass.matched += 1;
  if (match !== undefined && match === baseToken) return;
  const home = match === undefined ? -1 : input.alphabet.indexOf(match);
  const stillHome = home >= 0 && glyphKey(input.tiles, home) === glyphKey(input.tiles, glyph);
  if (match !== undefined && stillHome) {
    pass.alphabet[glyph] = match;
  } else if (match !== undefined && home !== glyph && pass.glyphs[match] === undefined) {
    pass.alphabet[glyph] = match;
    pass.glyphs[match] = glyph;
  } else {
    const token = glyphPlaceholder(glyph);
    pass.alphabet[glyph] = token;
    pass.glyphs[token] = glyph;
    pass.unknown.push(glyph);
  }
};

const identifyGlyphs = (input: GlyphIdentify): GlyphReading => {
  const base = input.references.find((reference) => reference.isBase);
  const keys = referenceKeys(input.references, input.glyphLimit);
  const pass: GlyphPass = { alphabet: [...input.alphabet], glyphs: {}, changed: [], unknown: [], matched: 0 };
  for (let glyph = 0; glyph < input.glyphLimit; glyph += 1) {
    const match = keys.get(glyphKey(input.tiles, glyph));
    if (!looksChanged(input, base, glyph, match)) continue;
    pass.changed.push(glyph);
    nameGlyph(input, pass, glyph, match);
  }
  const restyled = pass.changed.length >= RESTYLE_MIN_CHANGED && pass.matched / pass.changed.length < RESTYLE_MATCH_RATIO;
  const checked = base !== undefined;
  if (restyled) return { alphabet: [...input.alphabet], glyphs: {}, changed: pass.changed, unknown: [], checked, restyled };
  const { alphabet, glyphs, changed, unknown } = pass;
  return { alphabet, glyphs, changed, unknown, checked, restyled };
};

export { identifyGlyphs };
