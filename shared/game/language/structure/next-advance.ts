/* @layer shared-game @kind logic */
import { advanceForNewLine } from '../lines/advance-for-new-line';
import type { DialogueLineView, LineAdvance } from '../lines/types';
import type { StructurePolicy } from './types';

const nextAdvance = (
  previous: DialogueLineView | null,
  policy: StructurePolicy,
): LineAdvance => {
  if (previous === null || policy.restartsAtBlock) return advanceForNewLine(previous);
  return advanceForNewLine({ ...previous, endsBox: false });
};

export { nextAdvance };
