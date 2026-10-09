/* @layer shared-game @kind logic */
import type { Token } from '../types';
import type { LineAdvance } from '../lines/types';
import { ROWS_PER_BOX } from '../layout/types';
import type { ChoiceOption, ChoiceShape } from './types';
import { CURSOR_COLUMN_SPACES } from './choices.constants';

const advanceAfter = (last: LineAdvance): LineAdvance => {
  if (last !== null && last.kind === 'row' && last.row < ROWS_PER_BOX) {
    return { kind: 'row', row: (last.row + 1) as 2 | 3 };
  }
  return { kind: 'scroll' };
};

const withAddedOption = (shape: ChoiceShape, tokens?: Token[]): ChoiceShape | null => {
  if (shape.options.length !== 2) return null;
  const added: ChoiceOption = {
    advance: advanceAfter(shape.options[1].advance),
    tokens: tokens ?? [{ t: 'text', v: CURSOR_COLUMN_SPACES }],
  };
  return { ...shape, code: 'Choose3', options: [...shape.options, added] };
};

export { withAddedOption };
