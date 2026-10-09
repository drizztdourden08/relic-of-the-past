/* @layer shared-game @kind logic */
import type { FilterState, RunContext } from './check-grouping.type';

const smallKeyDoorsOf = (filter: FilterState, run?: RunContext): boolean =>
  filter.smallKeyDoors ?? (run?.kind ?? 'normal') !== 'normal';

export { smallKeyDoorsOf };
