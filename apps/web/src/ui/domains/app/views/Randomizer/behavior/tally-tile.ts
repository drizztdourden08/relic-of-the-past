/* @layer renderer-components @kind logic */
import { outOf } from './tally-out-of';
import type { Tally } from './options-summary.type';
import type { RunTile } from './run-tile.type';

const tallyTile = (label: string, tally: Tally): RunTile =>
  ({ label, value: outOf(tally), meter: { value: tally.count, max: tally.total } });

export { tallyTile };
