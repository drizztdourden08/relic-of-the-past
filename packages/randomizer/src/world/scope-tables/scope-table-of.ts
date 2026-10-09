/* @layer shared-game @kind logic */
import { standardNameOfCheck } from '@rotp/game-data';
import { scopedChecks } from './scoped-checks';
import { scopeRowsOf } from './scope-rows-of';
import type { ItemId, CheckRecord } from '@rotp/game-data';
import type { LocationKey } from '../location-key.type';
import type { CheckScope } from './scope-tables.type';

const byName = (checks: readonly CheckRecord[]): readonly CheckRecord[] =>
  [...checks].sort((a, b) => (standardNameOfCheck(a) < standardNameOfCheck(b) ? -1 : 1));

const scopeTableOf = (scope: CheckScope): ReadonlyMap<LocationKey, ItemId> =>
  new Map(scopeRowsOf(byName(scopedChecks(scope))));

export { scopeTableOf };
