/* @layer shared-game @kind logic */
/**
 * How much of a row one line's content spends, in pixels and in characters.
 *
 * Width comes from `measureRows`, so a line here is sized by the same walk that
 * audits a whole entry and the two can never disagree. A line holds no advance
 * code, so that walk closes exactly one run and its width IS the line's width —
 * which is also why a line is measured alone rather than inheriting whatever an
 * earlier line left standing further right: a row marker starts a fresh run.
 *
 * The character count is deliberately NOT the glyph total. A gutter is there to
 * tell an author how much room is left, and a substitution or a bracketed
 * picture glyph is one thing they typed, so each counts once however many glyphs
 * it draws. Text that no glyph matches still counts, so a mistyped bracket run
 * shows up as content rather than vanishing.
 */
import { resolveRefs } from '../glossary/resolve-refs';
import type { GlossaryTerm, Token } from '../types';
import { glyphIndexOf, matchGlyphs } from '../layout/glyph-metrics';
import { measureRows } from '../layout/measure-line';
import type { GlyphMetrics } from '../layout/types';
import { ROW_WIDTH_PX } from '../layout/types';

/** One line's cost against the row budget. */
type LineMetrics = {
  widthPx: number;
  count: number;
  overflow: boolean;
  freePx: number;
};

/**
 * True when a bracketed name is spelled by the alphabet itself — a picture
 * glyph rather than a control code. The whole name must be consumed, otherwise
 * the alphabet only matched a prefix and this is a real command.
 */
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
  // Resolved once here, so the measurement walk gets an empty glossary: it has
  // no ref left to look up, and a missing key is reported by this call instead.
  const resolved = resolveRefs(tokens, glossary);
  const widthPx = measureRows(resolved, metrics, []).reduce((sum, row) => sum + row.widthPx, 0);

  return {
    widthPx,
    count: resolved.reduce((sum, token) => sum + countOf(token, metrics), 0),
    overflow: widthPx > ROW_WIDTH_PX,
    freePx: ROW_WIDTH_PX - widthPx,
  };
};

export { lineMetrics };
export type { LineMetrics };
