/* @layer shared-asset-extraction @kind logic */
import { BASE_SHIFTS, SHIFT_COST } from './accents.constants';
import type { CandidateInput, LetterCandidate } from './accents.type';
import { cutMark } from './cut-mark';
import { pickMark } from './pick-mark';

const letterCandidate = (input: CandidateInput): LetterCandidate | null => {
  let best: LetterCandidate | null = null;
  for (const shift of BASE_SHIFTS) {
    const cut = cutMark({ glyph: input.target, base: input.base, shift });
    const pick = cut ? pickMark({ cut, marks: input.marks, letter: input.letter }) : null;
    if (!pick) continue;
    const cost = pick.score + Math.abs(shift) * SHIFT_COST;
    if (best === null || cost < best.cost) best = { ...pick, letter: input.letter, cost };
  }
  return best;
};

export { letterCandidate };
