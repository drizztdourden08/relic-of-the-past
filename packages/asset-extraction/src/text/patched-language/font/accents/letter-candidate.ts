/* @layer shared-asset-extraction @kind logic */
import { BASE_SHIFTS, COLUMN_SHIFTS, MISFIT_COST, SHIFT_COST } from './accents.constants';
import type { CandidateInput, LetterCandidate } from './accents.type';
import { baseVariants } from './base-variants';
import { cutMark } from './cut-mark';
import { pickMark } from './pick-mark';

const letterCandidate = (input: CandidateInput): LetterCandidate | null => {
  let best: LetterCandidate | null = null;
  for (const base of baseVariants(input.letter, input.base)) {
    for (const shift of BASE_SHIFTS) {
      for (const column of COLUMN_SHIFTS) {
        const cut = cutMark({ glyph: input.target, base, shift, column });
        const pick = cut ? pickMark({ cut, marks: input.marks, letter: input.letter }) : null;
        if (!cut || !pick) continue;
        const cost = pick.score + (Math.abs(shift) + Math.abs(column)) * SHIFT_COST + (cut.removed + cut.inside) * MISFIT_COST;
        if (best === null || cost < best.cost) best = { ...pick, letter: input.letter, cost, matched: cut.matched };
      }
    }
  }
  return best;
};

export { letterCandidate };
