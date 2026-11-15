/* @layer renderer-components @kind logic */
import { glyphPlaceholder } from '@rotp/asset-extraction';
import type { LanguageSet } from '@rotp/languages';
import type { GlyphNamingItem } from '@app/compounds/GlyphNamingGrid';
import { setStrings } from './set-strings';

const countOf = (texts: readonly string[], token: string): number =>
  texts.reduce((total, text) => total + text.split(token).length - 1, 0);

const placeholderGlyphs = (set: LanguageSet | null): GlyphNamingItem[] => {
  const unknown = Object.entries(set?.glyphs ?? {}).filter(([token, glyph]) => token === glyphPlaceholder(glyph));
  if (!set || unknown.length === 0) return [];
  const texts = setStrings(set);
  return unknown
    .map(([token, glyph]) => ({ token, glyph, count: countOf(texts, token) }))
    .sort((left, right) => left.glyph - right.glyph);
};

export { placeholderGlyphs };
