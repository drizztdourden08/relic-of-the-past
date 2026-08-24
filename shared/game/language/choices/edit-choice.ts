/* @layer shared-game @kind logic */
/**
 * The edits a choice prompt supports, as pure functions over ChoiceShape.
 *
 * Growing and shrinking the option list means changing the prompt code, since
 * the code fixes the option count: two-option shapes grow only into `Choose3`,
 * and a three-option shape shrinks into `Choose2` when its first option sits
 * on row 1 (the layout that code is used with in authored data) or `Choose`
 * otherwise. Anything past three options has no code at all, so the growers
 * answer null instead of producing a stream the engine cannot run.
 *
 * A new option follows the pattern of the line above it — the next row number
 * down, or another scroll — and starts with the spaces that keep its text out
 * of the selection-cursor column. Removal renumbers only trailing row markers
 * so the survivors stay consecutive; scroll advances are left alone.
 */
import type { Token } from '../types';
import type { LineAdvance } from '../lines/types';
import { ROWS_PER_BOX } from '../layout/types';
import type { ChoiceCode, ChoiceOption, ChoiceShape } from './types';

/** Text spanning the cursor column, so a fresh option starts clear of it. */
const CURSOR_COLUMN_SPACES = '   ';

/** The same shape with one option's content replaced. */
const withOptionTokens = (shape: ChoiceShape, index: number, tokens: Token[]): ChoiceShape => ({
  ...shape,
  options: shape.options.map((option, i) => (i === index ? { ...option, tokens } : option)),
});

/** Where a line added after `last` should start. */
const advanceAfter = (last: LineAdvance): LineAdvance => {
  if (last !== null && last.kind === 'row' && last.row < ROWS_PER_BOX) {
    return { kind: 'row', row: (last.row + 1) as 2 | 3 };
  }
  return { kind: 'scroll' };
};

/** Grow a two-option prompt to three; null when the shape is not two-option. */
const withAddedOption = (shape: ChoiceShape, tokens?: Token[]): ChoiceShape | null => {
  if (shape.options.length !== 2) return null;
  const added: ChoiceOption = {
    advance: advanceAfter(shape.options[1].advance),
    tokens: tokens ?? [{ t: 'text', v: CURSOR_COLUMN_SPACES }],
  };
  return { ...shape, code: 'Choose3', options: [...shape.options, added] };
};

const rowOf = (advance: LineAdvance): number | null => {
  if (advance === null) return 1;
  return advance.kind === 'row' ? advance.row : null;
};

/** Row markers after the first option made consecutive again. */
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

/** The two-option code matching where the surviving options sit. */
const codeForPair = (first: ChoiceOption): ChoiceCode => {
  return rowOf(first.advance) === 1 ? 'Choose2' : 'Choose';
};

/** Shrink a three-option prompt to two; null when not three-option. */
const withRemovedOption = (shape: ChoiceShape, index: number): ChoiceShape | null => {
  if (shape.options.length !== 3) return null;
  if (index < 0 || index >= shape.options.length) return null;
  const kept = renumbered(shape.options.filter((_, i) => i !== index));
  return { ...shape, code: codeForPair(kept[0]), options: kept };
};

export { withAddedOption, withOptionTokens, withRemovedOption };
