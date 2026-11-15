/* @layer shared-asset-extraction @kind logic */
import { MARK_TOLERANCE, SHAPE_GUESS_SCORE } from './accents.constants';
import type { MarkGuess, MarkPick } from './accents.type';
import { guessMark } from './guess-mark';
import { shapeDistance } from './shape-distance';

const learnedMark = (pick: MarkPick): MarkGuess | null => {
  let best: MarkGuess | null = null;
  for (const learned of pick.marks) {
    if (learned.zone !== pick.cut.zone) continue;
    const score = shapeDistance(learned.shape, pick.cut.shape);
    if (score <= MARK_TOLERANCE && (best === null || score < best.score)) {
      best = { mark: learned.mark, score, source: learned.release };
    }
  }
  return best;
};

const pickMark = (pick: MarkPick): MarkGuess | null => {
  const learned = learnedMark(pick);
  if (learned) return learned;
  const mark = guessMark(pick.cut, pick.letter);
  return mark === null ? null : { mark, score: SHAPE_GUESS_SCORE, source: null };
};

export { pickMark };
