/* @layer shared-game @kind logic */
import type { LineAdvance } from '../lines/types';
import { ROWS_PER_BOX } from '../layout/types';
import type { ChoiceCode, ChoiceOption, ChoiceShape } from './types';

const rowOf = (advance: LineAdvance): number | null => {
  if (advance === null) return 1;
  return advance.kind === 'row' ? advance.row : null;
};

const renumbered = (options: ChoiceOption[]): ChoiceOption[] => {
  let previousRow = rowOf(options[0].advance);

  return options.map((option, index) => {
    if (index === 0) return option;
    if (previousRow === null || option.advance === null || option.advance.kind !== 'row') {
      previousRow = null;
      return option;
    }
    const row = Math.min(previousRow + 1, ROWS_PER_BOX) as 1 | 2 | 3;
    previousRow = row;
    return row === option.advance.row ? option : { ...option, advance: { kind: 'row', row } };
  });
};

const codeForPair = (first: ChoiceOption): ChoiceCode => {
  return rowOf(first.advance) === 1 ? 'Choose2' : 'Choose';
};

const withRemovedOption = (shape: ChoiceShape, index: number): ChoiceShape | null => {
  if (shape.options.length !== 3) return null;
  if (index < 0 || index >= shape.options.length) return null;
  const kept = renumbered(shape.options.filter((_, i) => i !== index));
  return { ...shape, code: codeForPair(kept[0]), options: kept };
};

export { withRemovedOption };
