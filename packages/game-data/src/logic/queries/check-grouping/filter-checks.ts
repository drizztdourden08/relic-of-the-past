/* @layer shared-game @kind logic */
import type { CheckRecord } from '../../../data';
import type { CheckStatus } from '../../check-status.type';
import type { FilterState, RunContext } from './check-grouping.type';
import { isListedRow } from './is-listed-row';
import { matchesFacet } from './matches-facet';
import { matchesSearch } from './matches-search';

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

export { filterChecks };
