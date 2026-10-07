/* @layer renderer-components @kind logic */
/**
 * Whether a block is a choice prompt, and which of its rows hold the options.
 *
 * A choice command draws no pixels of its own. The option text is ordinary
 * rows of the same entry, and the selection cursor comes from the structural
 * cursor-frame entries (`codes/structural-entries.ts`), each of which parks a
 * `>` in column 0 of one fixed row. Which rows those frames target is decided
 * by the command variant, not by where the options happen to sit:
 *
 * - `Choose` loads the frames for rows 2 and 3 (a question on row 1, two
 *   options under it).
 * - `Choose2` loads the frames for rows 1 and 2.
 * - `Choose3` loads one frame per row, so all three rows are options.
 *
 * So the option rows are a fixed property of the variant, read here straight
 * off the command token wherever it appears in the block's lines.
 */
import type { Block } from '@shared/game/language';

type ChoiceKind = 'Choose' | 'Choose2' | 'Choose3';

/** A choice prompt on one previewed box. */
type PreviewChoice = {
  kind: ChoiceKind;
  /** 1-based box rows holding one option each, top option first. */
  rows: number[];
};

/** The rows each variant's cursor frames target. */
const OPTION_ROWS: Record<ChoiceKind, readonly number[]> = {
  Choose: [2, 3],
  Choose2: [1, 2],
  Choose3: [1, 2, 3],
};

const isChoiceKind = (name: string): name is ChoiceKind =>
  name === 'Choose' || name === 'Choose2' || name === 'Choose3';

/** The block's choice prompt, or null when none of its tokens declare one. */
const choiceOf = (block: Block): PreviewChoice | null => {
  for (const line of block.lines) {
    for (const token of line.tokens) {
      if (token.t === 'cmd' && isChoiceKind(token.name)) {
        return { kind: token.name, rows: [...OPTION_ROWS[token.name]] };
      }
    }
  }
  return null;
};

export { choiceOf };
export type { ChoiceKind, PreviewChoice };
