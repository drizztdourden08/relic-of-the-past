/* @layer shared-asset-extraction @kind logic */
import { glyphPlaceholder } from '../../glyph-map';
import type { GlyphMap } from '../../glyph-map';
import type { PatchedPartReport, PatchedWork } from '../patched-language.type';
import { lettersDetail } from './letters-detail';
import type { LettersSummary } from './parts.type';

const candidateGlyphs = (work: PatchedWork): GlyphMap => {
  const glyphs: GlyphMap = { ...work.reading?.glyphs };
  for (let glyph = work.config.alphabet.length; glyph < work.letters.length; glyph += 1) {
    const token = work.letters[glyph];
    if (token !== undefined && glyphs[token] === undefined) glyphs[token] = glyph;
  }
  return glyphs;
};

const usedGlyphs = (work: PatchedWork, text: string): GlyphMap =>
  Object.fromEntries(Object.entries(candidateGlyphs(work)).filter(([token]) => text.includes(token)));

const usedLetterCount = (work: PatchedWork, text: string): number =>
  new Set(work.letters.filter((token) => token.length > 0 && text.includes(token))).size;

const summarise = (work: PatchedWork, text: string): LettersSummary => {
  const entries = Object.entries(work.glyphs);
  const unknown = entries.filter(([token, glyph]) => token === glyphPlaceholder(glyph)).map(([token]) => token);
  const built = (work.reading?.namings ?? []).filter((naming) => naming.how !== 'font' && work.glyphs[naming.token] !== undefined);
  const matched = entries
    .filter(([token, glyph]) => token !== glyphPlaceholder(glyph) && !built.some((naming) => naming.token === token))
    .map(([token]) => token);
  return { matched, built, unknown, used: usedLetterCount(work, text) };
};

const lettersPart = (work: PatchedWork): PatchedPartReport => {
  const { reading } = work;
  const text = (work.texts ?? []).join('\n');
  work.glyphs = usedGlyphs(work, text);
  if (!reading) return { part: 'letters', status: 'failed', detail: 'The font could not be read, so the letters were not checked.' };
  if (reading.restyled) {
    return {
      part: 'letters', status: 'recovered',
      detail: `The patch redraws ${reading.changed.length} glyphs in its own style; they keep the release letters.`,
    };
  }
  if (Object.keys(work.glyphs).length === 0) {
    const how = reading.checked ? 'The letters are those of the release.' : 'No release font was at hand; letters are read as the release has them.';
    return { part: 'letters', status: 'ok', detail: how };
  }
  return { part: 'letters', status: 'recovered', detail: lettersDetail(summarise(work, text)) };
};

export { lettersPart };
