/* @layer shared-game @kind logic */
import { resolveRefs } from '../glossary/resolve-refs';
import type { GlossaryTerm, Token } from '../types';
import { glyphIndexOf, matchGlyphs } from '../layout/glyph-metrics';
import { measureRows } from '../layout/measure-line';
import type { GlyphMetrics } from '../layout/types';
import { ROW_WIDTH_PX } from '../layout/types';
import type { LineMetrics } from './types';

const isGlyphName = (name: string, metrics: GlyphMetrics): boolean => {
  const match = glyphIndexOf(`[${name}]`, 0, metrics);
  return match !== null && match.length === name.length + 2;
};

const countOf = (token: Token, metrics: GlyphMetrics): number => {
  if (token.t === 'text') {
    const { glyphs, unmatched } = matchGlyphs(token.v, metrics);
    return glyphs.length + unmatched.length;
  }
  if (token.t === 'var') return 1;
  if (token.t === 'cmd' && token.param === undefined && isGlyphName(token.name, metrics)) return 1;
  return 0;
};

const lineMetrics = (
  tokens: Token[],
  metrics: GlyphMetrics,
  glossary: GlossaryTerm[],
): LineMetrics => {
  const resolved = resolveRefs(tokens, glossary);
  const noGlossaryLeft: GlossaryTerm[] = [];
  const widthPx = measureRows(resolved, metrics, noGlossaryLeft).reduce((sum, row) => sum + row.widthPx, 0);

  return {
    widthPx,
    count: resolved.reduce((sum, token) => sum + countOf(token, metrics), 0),
    overflow: widthPx > ROW_WIDTH_PX,
    freePx: ROW_WIDTH_PX - widthPx,
  };
};

export { lineMetrics };
