/* @layer shared-game @kind logic */
/**
 * Filters checks by search query, active facets, item reward, and tracker status.
 */
import type { CheckRecord } from '../../../data';
import { getDungeon, getItem, getScreen } from '../../../data';
import type { CheckStatus } from '../../check-status.type';
import type { FilterState, RunContext } from './types';
import { matchesFacet } from './facets';

const matchesSearch = (check: CheckRecord, query: string, run?: RunContext): boolean => {
  if (check.id.toLowerCase().includes(query) || check.name.toLowerCase().includes(query)) return true;
  if (check.screenId) {
    const screen = getScreen(check.screenId);
    if (screen.name.toLowerCase().includes(query)) return true;
  }
  if (check.dungeonId && getDungeon(check.dungeonId).name.toLowerCase().includes(query)) return true;
  // With a run loaded, the item a reader searches for is the one actually
  // there, since matching the vanilla contents instead would answer the wrong
  // question ("where WAS the lamp", not "where IS it").
  const placed = run?.placedItems?.get(check.id);
  if (placed !== undefined) return getItem(placed).name.toLowerCase().includes(query);
  const live = run?.liveItems?.get(check.id);
  if (live !== undefined && getItem(live).name.toLowerCase().includes(query)) return true;
  return check.vanillaItemIds.some(id => getItem(id).name.toLowerCase().includes(query));
};

/**
 * Whether a row is in the list at all, before any search or facet narrows it: the
 * Items / Events / Both switch, and on the plain game the shop shelves, which stay
 * out until asked for. The summary counts over the same answer, so the totals say
 * what the list shows.
 */
const isListedRow = (check: CheckRecord, filter: FilterState, run?: RunContext): boolean => {
  // Items, events, or both. Absent reads as items: the list as it always was.
  const showMode = filter.showMode ?? 'items';
  if (showMode === 'items' && check.kind === 'event') return false;
  if (showMode === 'events' && check.kind !== 'event') return false;
  const plainGame = (run?.kind ?? 'normal') === 'normal';
  if (plainGame && check.kind === 'shop-slot' && !(filter.shopShelves ?? false)) return false;
  return true;
};

/**
 * Whether rows past a small key door wait for the keys the logic counts. Unset, the plain game
 * reads them as open, the way its tracker always has; a seed counts them, the way its fill did.
 */
const smallKeyDoorsOf = (filter: FilterState, run?: RunContext): boolean =>
  filter.smallKeyDoors ?? (run?.kind ?? 'normal') !== 'normal';

const filterChecks = (
  checks: CheckRecord[],
  filter: FilterState,
  statuses?: Map<string, CheckStatus>,
  run?: RunContext
): CheckRecord[] => {
  let result = checks.filter(c => isListedRow(c, filter, run));

  if (filter.searchQuery.trim()) {
    const q = filter.searchQuery.toLowerCase();
    result = result.filter(c => matchesSearch(c, q, run));
  }

  if (filter.activeFacets.length > 0) {
    result = result.filter((c) => filter.tagMode === 'all'
      ? filter.activeFacets.every(f => matchesFacet(c, f))
      : filter.activeFacets.some(f => matchesFacet(c, f)));
  }

  if (filter.itemFilter === 'rewards') {
    result = result.filter(c => c.vanillaItemIds.length > 0 || c.isGuaranteedReward === true);
  } else if (filter.itemFilter === 'non-rewards') {
    result = result.filter(c => c.vanillaItemIds.length === 0 && c.isGuaranteedReward !== true);
  }

  if (filter.statusFilter && filter.statusFilter !== 'all' && statuses) {
    result = result.filter(c => (statuses.get(c.id) ?? 'blocked') === filter.statusFilter);
  }

  return result;
};

export { filterChecks, isListedRow, smallKeyDoorsOf };
