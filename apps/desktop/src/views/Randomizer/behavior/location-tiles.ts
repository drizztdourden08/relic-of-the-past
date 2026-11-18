/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { PoolAccounting } from '@rotp/randomizer';
import { tallyTile } from './tally-tile';
import type { RunTile } from './run-tile.type';

const locationTilesOf = (t: I18n['t'], accounting: PoolAccounting): RunTile[] => [
  tallyTile(t, t('views-randomizer:tiles.locationsShuffled'), { count: accounting.open, total: accounting.open + accounting.lockedVanilla }),
  { label: t('views-randomizer:tiles.keptVanilla'), value: String(accounting.lockedVanilla) },
];

export { locationTilesOf };
