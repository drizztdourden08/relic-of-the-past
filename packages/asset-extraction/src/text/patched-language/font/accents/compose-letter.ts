/* @layer shared-asset-extraction @kind logic */
import { glyphPixelGrid } from '../glyph-pixel-grid';
import { COMMON_LETTERS, MARK_NAMES, PLAIN_LETTER } from './accents.constants';
import type { ComposeInput, ComposedLetter, LetterCandidate } from './accents.type';
import { letterCandidate } from './letter-candidate';
import { composeToken } from './mark-split';

const commonRank = (letter: string): number => {
  const rank = COMMON_LETTERS.indexOf(letter);
  return rank < 0 ? COMMON_LETTERS.length : rank;
};

const beats = (next: LetterCandidate, best: LetterCandidate): boolean => {
  if (next.cost !== best.cost) return next.cost < best.cost;
  if (next.matched !== best.matched) return next.matched > best.matched;
  return commonRank(next.letter) < commonRank(best.letter);
};

const bestCandidate = (input: ComposeInput): LetterCandidate | null => {
  const target = glyphPixelGrid(input.tiles, input.glyph);
  let best: LetterCandidate | null = null;
  for (const [index, letter] of input.alphabet.entries()) {
    if (index === input.glyph || !PLAIN_LETTER.test(letter)) continue;
    const candidate = letterCandidate({ target, base: glyphPixelGrid(input.tiles, index), letter, marks: input.marks });
    if (!candidate || composeToken(candidate.letter, candidate.mark) === null) continue;
    if (best === null || beats(candidate, best)) best = candidate;
  }
  return best;
};

const composeLetter = (input: ComposeInput): ComposedLetter | null => {
  const best = bestCandidate(input);
  const token = best ? composeToken(best.letter, best.mark) : null;
  if (!best || token === null) return null;
  const name = MARK_NAMES[best.mark] ?? 'mark';
  const detail = best.source === null
    ? `${best.letter} + ${name}, by its shape`
    : `${best.letter} + ${name}, learned from ${best.source}`;
  return { token, how: best.source === null ? 'shape' : 'accent', detail };
};

export { composeLetter };
