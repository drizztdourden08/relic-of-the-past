/* @layer shared-game @kind logic */
import type { DialogueLineView, LineAdvance } from './types';

const kFirstRow = 1;

const advanceAfterRow = (row: number): LineAdvance => {
  if (row === 1) return { kind: 'row', row: 2 };
  if (row === 2) return { kind: 'row', row: 3 };
  return { kind: 'scroll' };
};

const advanceForNewLine = (previous: DialogueLineView | null): LineAdvance => {
  if (previous === null || previous.endsBox) return { kind: 'row', row: kFirstRow };
  return advanceAfterRow(previous.row);
};

export { advanceForNewLine };
