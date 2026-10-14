/* @layer shared-game @kind logic */
import type { CheckRecord } from '../../../data';
import type { FilterState, RunContext } from './check-grouping.type';

const kindAllowed = (check: CheckRecord, filter: FilterState): boolean => {
  const showMode = filter.showMode ?? 'items';
  if (showMode === 'items') return check.kind !== 'event';
  if (showMode === 'events') return check.kind === 'event';
  return true;
};

const shelfHidden = (check: CheckRecord, filter: FilterState, run?: RunContext): boolean => {
  const plainGame = (run?.kind ?? 'normal') === 'normal';
  return plainGame && check.kind === 'shop-slot' && !(filter.shopShelves ?? false);
};

const isListedRow = (check: CheckRecord, filter: FilterState, run?: RunContext): boolean =>
  kindAllowed(check, filter) && !shelfHidden(check, filter, run);

export { isListedRow };
