/* @layer renderer-components @kind logic */
import { glyphIndexOf } from '@rotp/languages';
import type { GlyphMetrics } from '@rotp/languages';

const pictureGlyphIndex = (name: string, metrics: GlyphMetrics | null): number | null => {
  if (metrics === null) return null;
  const match = glyphIndexOf(`[${name}]`, 0, metrics);
  return match !== null && match.length === name.length + 2 ? match.index : null;
};

export { pictureGlyphIndex };
