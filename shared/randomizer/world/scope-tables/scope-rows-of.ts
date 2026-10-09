/* @layer shared-game @kind logic */
import { poolItemOfCheck } from '../pool-item-of-check';
import type { ItemId } from '@shared/game/data/types/ids';
import type { CheckRecord } from '@shared/game/data';
import type { LocationKey } from '../location-key.type';

const scopeRowsOf = (checks: readonly CheckRecord[]): [LocationKey, ItemId][] => checks.flatMap((check) => {
  const item = poolItemOfCheck(check);
  return item === undefined ? [] : [[check.id, item] as [LocationKey, ItemId]];
});

export { scopeRowsOf };
