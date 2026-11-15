/* @layer shared-asset-extraction @kind logic */
import type { GlyphMap } from './glyph-map.type';
import { glyphPlaceholder } from './glyph-placeholder';

const alphabetWithGlyphs = (alphabet: readonly string[], glyphs: GlyphMap | undefined): string[] => {
  const out = [...alphabet];
  for (const [token, index] of Object.entries(glyphs ?? {})) out[index] = token;
  return Array.from(out, (token, index) => token ?? glyphPlaceholder(index));
};

export { alphabetWithGlyphs };
