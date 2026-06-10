/* @layer shared-game @kind logic */
/**
 * Filters checks by search query, active tags, item reward, and tracker status.
 */
import type { CheckDefinition } from '../../types';
import type { CheckStatus } from '../../logic/eval';
import type { CheckTag } from '../tags';
import type { FilterState } from './types';

const filterChecks = (checks: CheckDefinition[], filter: FilterState, tagMap: Map<string, CheckTag[]>, statuses?: Map<string, CheckStatus>): CheckDefinition[] => {
  let result = checks;

  // Filter by search query
  if (filter.searchQuery.trim()) {
    const q = filter.searchQuery.toLowerCase();
    result = result.filter(c =>
      c.id.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.screen.toLowerCase().includes(q) ||
      (c.dungeon?.toLowerCase().includes(q) ?? false) ||
      (Array.isArray(c.vanillaItem)
        ? c.vanillaItem.some(i => i.toLowerCase().includes(q))
        : (c.vanillaItem?.toLowerCase().includes(q) ?? false))
    );
  }

  // Filter by tags
  if (filter.activeTags.length > 0) {
    result = result.filter(c => {
      const checkTags = tagMap.get(c.id) ?? [];
      if (filter.tagMode === 'all') {
        return filter.activeTags.every(t => checkTags.includes(t));
      } else {
        return filter.activeTags.some(t => checkTags.includes(t));
      }
    });
  }

  // Filter by item reward
  if (filter.itemFilter === 'rewards') {
    result = result.filter(c => !!c.vanillaItem);
  } else if (filter.itemFilter === 'non-rewards') {
    result = result.filter(c => !c.vanillaItem);
  }

  // Filter by status
  if (filter.statusFilter && filter.statusFilter !== 'all' && statuses) {
    result = result.filter(c => {
      const status = statuses.get(c.id) ?? 'blocked';
      return status === filter.statusFilter;
    });
  }

  return result;
};

export { filterChecks };
