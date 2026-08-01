/* @layer shared-game @kind logic */
/**
 * Filters checks by search query, active tags, item reward, and tracker status.
 */
import type { CheckRecord, CheckTag } from '../../../data';
import { getDungeon, getItem, getScreen } from '../../../data';
import type { CheckStatus } from '../../eval';
import type { FilterState } from './types';

const matchesSearch = (check: CheckRecord, query: string): boolean => {
  if (check.id.toLowerCase().includes(query) || check.randomizerName.toLowerCase().includes(query)) return true;
  if (check.screenId) {
    const screen = getScreen(check.screenId);
    if (screen.randomizerName.toLowerCase().includes(query) || screen.vanillaName?.toLowerCase().includes(query)) return true;
  }
  if (check.dungeonId && getDungeon(check.dungeonId).randomizerName.toLowerCase().includes(query)) return true;
  return check.vanillaItemIds.some(id => getItem(id).randomizerName.toLowerCase().includes(query));
};

const filterChecks = (
  checks: CheckRecord[],
  filter: FilterState,
  tagMap: Map<string, CheckTag[]>,
  statuses?: Map<string, CheckStatus>
): CheckRecord[] => {
  let result = checks;

  if (filter.searchQuery.trim()) {
    const q = filter.searchQuery.toLowerCase();
    result = result.filter(c => matchesSearch(c, q));
  }

  if (filter.activeTags.length > 0) {
    result = result.filter((c) => {
      const checkTags = tagMap.get(c.id) ?? [];
      return filter.tagMode === 'all'
        ? filter.activeTags.every(t => checkTags.includes(t))
        : filter.activeTags.some(t => checkTags.includes(t));
    });
  }

  if (filter.itemFilter === 'rewards') {
    result = result.filter(c => c.vanillaItemIds.length > 0);
  } else if (filter.itemFilter === 'non-rewards') {
    result = result.filter(c => c.vanillaItemIds.length === 0);
  }

  if (filter.statusFilter && filter.statusFilter !== 'all' && statuses) {
    result = result.filter(c => (statuses.get(c.id) ?? 'blocked') === filter.statusFilter);
  }

  return result;
};

export { filterChecks };
