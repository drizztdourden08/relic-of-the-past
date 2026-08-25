/* @layer shared-game @kind logic */
/**
 * Where a line that has grown past the row has to be cut.
 *
 * The engine never wraps and never checks the row bound, so a row authored wider
 * than the interior is drawn straight into the next row's tiles. Wrapping has to
 * happen while the text is being written, and this is the measurement half of it:
 * the LAST word boundary whose left side still fits the row.
 *
 * Only a space is a cut point. A cut anywhere else would change what the text
 * says — there is no soft hyphen in this alphabet and inserting a real one puts a
 * character on screen the translator did not write — so a single word wider than
 * a whole row is deliberately left whole and reported as an overrun instead
 * (`overflow` on the line, from `lineMetrics`). Truncating it would lose text and
 * hyphenating it would invent text; refusing does neither, and the author is the
 * one who can shorten a word without changing its meaning.
 *
 * The space itself is dropped, the way any wrap drops it: it was the join
 * between two words, and carrying it onto the next row would show as an indent.
 * Codes and substitutions are never split — they are atoms of a line, and a cut
 * lands before or after one.
 */
import { ROW_WIDTH_PX } from '../layout/types';
import { lineMetrics } from '../lines/line-metrics';
import type { Token } from '../types';
import type { StructureContext } from './types';

/** One line cut in two, content only. */
type LineBreak = {
  head: Token[];
  tail: Token[];
};

const kSpace = ' ';

const textToken = (v: string): Token[] => (v.length === 0 ? [] : [{ t: 'text', v }]);

/** Every cut this line offers, left to right. */
const candidatesOf = (tokens: Token[]): LineBreak[] => {
  const found: LineBreak[] = [];

  tokens.forEach((token, at) => {
    if (token.t !== 'text') return;

    for (let space = token.v.indexOf(kSpace); space >= 0; space = token.v.indexOf(kSpace, space + 1)) {
      found.push({
        head: [...tokens.slice(0, at), ...textToken(token.v.slice(0, space))],
        tail: [...textToken(token.v.slice(space + 1)), ...tokens.slice(at + 1)],
      });
    }
  });

  return found;
};

/**
 * The widest cut whose head still fits the row, or null when there is none.
 * A head can only grow as the cut moves right, so the first candidate that
 * overruns ends the search. A cut with an empty head is no cut at all — that is
 * the over-long single word, and answering null there is what leaves it whole
 * and keeps a caller's loop from spinning on a line it cannot shorten.
 */
const breakLine = (tokens: Token[], ctx: StructureContext): LineBreak | null => {
  const { metrics, glossary } = ctx;
  let best: LineBreak | null = null;

  for (const candidate of candidatesOf(tokens)) {
    if (candidate.head.length === 0) continue;
    if (lineMetrics(candidate.head, metrics, glossary).widthPx > ROW_WIDTH_PX) break;
    best = candidate;
  }

  return best;
};

export { breakLine };
export type { LineBreak };
