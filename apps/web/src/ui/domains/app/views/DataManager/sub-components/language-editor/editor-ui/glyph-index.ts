/* @layer renderer-components @kind logic */
import { glyphIndexOf } from '@shared/game/language';
import type { GlyphMetrics } from '@shared/game/language';

const pictureGlyphIndex = (name: string, metrics: GlyphMetrics | null): number | null => {
  if (metrics === null) return null;
  const match = glyphIndexOf(`[${name}]`, 0, metrics);
  return match !== null && match.length === name.length + 2 ? match.index : null;
};

export { pictureGlyphIndex };
