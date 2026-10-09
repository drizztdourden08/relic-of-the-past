/* @layer renderer-components @kind logic */
import type { StatTileProps } from '@ds/primitives';
import { outOf } from './tally-out-of';
import type { Tally } from './options-summary.type';

const tallyTile = (label: string, tally: Tally): StatTileProps =>
  ({ label, value: outOf(tally), meter: { value: tally.count, max: tally.total } });

export { tallyTile };
