/* @layer shared-asset-extraction @kind logic */
import { BASE_SHIFTS, COLUMN_SHIFTS, MISFIT_COST, SHIFT_COST } from './accents.constants';
import type { BaseVariant, CandidateInput, LetterCandidate } from './accents.type';
import { baseVariants } from './base-variants';
import { cutMark } from './cut-mark';
import { pickMark } from './pick-mark';

const columnCandidate = (input: CandidateInput, base: BaseVariant, shift: number, column: number): LetterCandidate | null => {
  const cut = cutMark({ glyph: input.target, base: base.grid, shift, column });
  const pick = cut ? pickMark({ cut, marks: input.marks, letter: input.letter }) : null;
  if (!cut || !pick) return null;
  const cost = base.cost + pick.score + (Math.abs(shift) + Math.abs(column)) * SHIFT_COST + (cut.removed + cut.inside) * MISFIT_COST;
  return { ...pick, letter: input.letter, cost, matched: cut.matched };
};

const shiftCandidate = (input: CandidateInput, base: BaseVariant, shift: number): LetterCandidate | null => {
  let best: LetterCandidate | null = null;
  for (const column of COLUMN_SHIFTS) {
    const found = columnCandidate(input, base, shift, column);
    if (found && (best === null || found.cost < best.cost)) best = found;
  }
  return best;
};

const letterCandidate = (input: CandidateInput): LetterCandidate | null => {
  let best: LetterCandidate | null = null;
  for (const base of baseVariants(input.letter, input.base)) {
    for (const shift of BASE_SHIFTS) {
      const found = shiftCandidate(input, base, shift);
      if (found && (best === null || found.cost < best.cost)) best = found;
    }
  }
  return best;
};

export { letterCandidate };
