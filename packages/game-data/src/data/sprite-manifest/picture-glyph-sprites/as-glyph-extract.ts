/* @layer shared-game @kind logic */
import type { GlyphExtract } from './picture-glyph-sprites.type';

const asGlyphExtract = (extract: unknown): GlyphExtract | null => {
  const candidate = extract as Partial<GlyphExtract> | null | undefined;
  if (candidate?.method !== 'dialogue-glyph') return null;
  if (typeof candidate.glyph !== 'number') return null;
  return candidate as GlyphExtract;
};

export { asGlyphExtract };
