/* @layer shared-asset-extraction @kind logic */
import { glyphPlaceholder } from '../../glyph-map';
import type { GlyphMap } from '../../glyph-map';
import type { PatchedPartReport, PatchedWork } from '../patched-language.type';

const candidateGlyphs = (work: PatchedWork): GlyphMap => {
  const glyphs: GlyphMap = { ...work.reading?.glyphs };
  for (let glyph = work.config.alphabet.length; glyph < work.letters.length; glyph += 1) {
    const token = work.letters[glyph];
    if (token !== undefined && glyphs[token] === undefined) glyphs[token] = glyph;
  }
  return glyphs;
};

const usedGlyphs = (work: PatchedWork): GlyphMap => {
  const texts = work.texts ?? [];
  return Object.fromEntries(
    Object.entries(candidateGlyphs(work)).filter(([token]) => texts.some((text) => text.includes(token))),
  );
};

const lettersPart = (work: PatchedWork): PatchedPartReport => {
  const { reading } = work;
  work.glyphs = usedGlyphs(work);
  if (!reading) return { part: 'letters', status: 'failed', detail: 'The font could not be read, so the letters were not checked.' };
  if (reading.restyled) {
    return {
      part: 'letters', status: 'recovered',
      detail: `The patch redraws ${reading.changed.length} glyphs in its own style; they keep the release letters.`,
    };
  }
  const entries = Object.entries(work.glyphs);
  const unknown = entries.filter(([token, glyph]) => token === glyphPlaceholder(glyph)).map(([token]) => token);
  const named = entries.filter(([token, glyph]) => token !== glyphPlaceholder(glyph)).map(([token]) => token);
  if (entries.length === 0) {
    const how = reading.checked ? 'The letters are those of the release.' : 'No release font was at hand; letters are read as the release has them.';
    return { part: 'letters', status: 'ok', detail: how };
  }
  const namedText = named.length > 0 ? `${named.length} new letters matched to known fonts (${named.join(' ')}).` : '';
  const unknownText = unknown.length > 0 ? ` ${unknown.length} glyphs not recognised, shown as ${unknown.join(' ')}.` : '';
  return { part: 'letters', status: 'recovered', detail: `${namedText}${unknownText}`.trim() };
};

export { lettersPart };
