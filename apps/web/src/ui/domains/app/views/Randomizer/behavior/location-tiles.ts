/* @layer renderer-components @kind logic */
import type { StatTileProps } from '@ds/primitives';
import type { PoolAccounting } from '@shared/randomizer/world/pool/pool-accounting';
import { tallyTile } from './tally-tile';

const locationTilesOf = (accounting: PoolAccounting): StatTileProps[] => [
  tallyTile('locations shuffled', { count: accounting.open, total: accounting.open + accounting.lockedVanilla }),
  { label: 'kept vanilla', value: String(accounting.lockedVanilla) },
];

export { locationTilesOf };
