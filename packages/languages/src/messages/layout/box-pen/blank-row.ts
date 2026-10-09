/* @layer shared-game @kind logic */
import type { BoxRow } from './box-pen.type';
import { emptyRun } from './empty-run';

const blankRow = (): BoxRow => ({ ...emptyRun(), drawn: false, stale: null });

export { blankRow };
