/* @layer shared-asset-extraction @kind logic */
import { CEDILLA_LETTERS, MARK, MAX_GUESS_HEIGHT, TILDE_MIN_WIDTH } from './accents.constants';
import type { MarkCut, Shape } from './accents.type';
import { columnProfile } from './column-profile';
import { componentCount } from './component-count';
import { slopeRuns } from './slope-runs';

const strokeMark = (shape: Shape): string | null => {
  const runs = slopeRuns(columnProfile(shape));
  if (runs.length >= 3 && shape.width >= TILDE_MIN_WIDTH) return MARK.tilde;
  if (runs.length === 2) return runs[0] === -1 ? MARK.circumflex : MARK.caron;
  if (runs.length === 1) return runs[0] === -1 ? MARK.acute : MARK.grave;
  return null;
};

const guessMark = (cut: MarkCut, letter: string): string | null => {
  if (!cut.clear) return null;
  if (cut.zone === 'below') return CEDILLA_LETTERS.includes(letter) ? MARK.cedilla : null;
  if (cut.shape.height > MAX_GUESS_HEIGHT) return null;
  const parts = componentCount(cut.shape);
  if (parts === 2 && cut.shape.height <= 2) return MARK.diaeresis;
  return parts === 1 ? strokeMark(cut.shape) : null;
};

export { guessMark };
