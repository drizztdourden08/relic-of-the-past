/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { outOf } from './tally-out-of';
import type { Tally } from './options-summary.type';
import type { RunTile } from './run-tile.type';

const tallyTile = (t: I18n['t'], label: string, tally: Tally): RunTile =>
  ({ label, value: outOf(t, tally), meter: { value: tally.count, max: tally.total } });

export { tallyTile };
