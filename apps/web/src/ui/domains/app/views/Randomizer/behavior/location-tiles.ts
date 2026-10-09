/* @layer renderer-components @kind logic */
import type { PoolAccounting } from '@shared/randomizer/world/pool/pool-accounting';
import { tallyTile } from './tally-tile';
import type { RunTile } from './run-tile.type';

const locationTilesOf = (accounting: PoolAccounting): RunTile[] => [
  tallyTile('locations shuffled', { count: accounting.open, total: accounting.open + accounting.lockedVanilla }),
  { label: 'kept vanilla', value: String(accounting.lockedVanilla) },
];

export { locationTilesOf };
