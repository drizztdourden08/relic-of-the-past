/* @layer shared-game @kind logic */
import type { GlyphMetrics } from '../types';
import type { GlyphMatch } from './glyph-metrics.type';
import { lookupFor } from './lookup-for';

const glyphIndexOf = (text: string, at: number, metrics: GlyphMetrics): GlyphMatch | null => {
  const { byText, longest } = lookupFor(metrics);
  const most = Math.min(longest, text.length - at);

  for (let length = most; length >= 1; length -= 1) {
    const index = byText.get(text.slice(at, at + length));
    if (index !== undefined) return { index, length };
  }

  return null;
};

export { glyphIndexOf };
