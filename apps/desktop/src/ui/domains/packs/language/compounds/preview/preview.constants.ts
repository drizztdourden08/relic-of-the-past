/* @layer renderer-components @kind constants */
import type { ChoiceKind } from './preview.type';

const CURSOR_CHAR = '>';
const NO_ROWS: readonly number[] = [];
const OPTION_ROWS: Record<ChoiceKind, readonly number[]> = {
  Choose: [2, 3],
  Choose2: [1, 2],
  Choose3: [1, 2, 3],
};
const NO_SCREENS_MESSAGE = 'This entry cannot be drawn until its unresolved variables are fixed.';
const LOADING_MESSAGE = 'Reading this set\'s font...';

export { CURSOR_CHAR, LOADING_MESSAGE, NO_ROWS, NO_SCREENS_MESSAGE, OPTION_ROWS };
