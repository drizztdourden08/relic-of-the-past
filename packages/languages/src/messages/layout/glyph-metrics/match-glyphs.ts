/* @layer shared-game @kind logic */
import type { GlyphMetrics } from '../types';
import type { GlyphRun } from './glyph-metrics.type';
import { glyphIndexOf } from './glyph-index-of';

const unmatchedAt = (text: string, at: number): string => {
  if (text[at] !== '[') return text[at];
  const closeAt = text.indexOf(']', at);
  return closeAt < 0 ? text[at] : text.slice(at, closeAt + 1);
};

const matchGlyphs = (text: string, metrics: GlyphMetrics): GlyphRun => {
  const glyphs: number[] = [];
  const unmatched: string[] = [];
  let at = 0;

  while (at < text.length) {
    const match = glyphIndexOf(text, at, metrics);
    if (match !== null) {
      glyphs.push(match.index);
      at += match.length;
      continue;
    }
    const miss = unmatchedAt(text, at);
    unmatched.push(miss);
    at += miss.length;
  }

  return { glyphs, unmatched };
};

export { matchGlyphs };
