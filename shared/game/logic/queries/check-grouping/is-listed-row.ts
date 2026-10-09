/* @layer shared-game @kind logic */
import type { CheckRecord } from '../../../data';
import type { FilterState, RunContext } from './check-grouping.type';

const isListedRow = (check: CheckRecord, filter: FilterState, run?: RunContext): boolean => {
  const showMode = filter.showMode ?? 'items';
  if (showMode === 'items' && check.kind === 'event') return false;
  if (showMode === 'events' && check.kind !== 'event') return false;
  const plainGame = (run?.kind ?? 'normal') === 'normal';
  if (plainGame && check.kind === 'shop-slot' && !(filter.shopShelves ?? false)) return false;
  return true;
};

export { isListedRow };
