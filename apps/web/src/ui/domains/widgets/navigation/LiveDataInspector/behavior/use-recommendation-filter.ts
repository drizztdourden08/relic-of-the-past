/* @layer renderer-widgets @kind hook */
/**
 * Classifies open findings by what accepting them would DO to the dataset —
 * change a property, add a missing record, drop an extra one — which is the
 * axis a reviewer triages on, not the confidence badge already on each card.
 *
 * The active filter is derived, not stored-and-synced: if the screen changes
 * under the player and the selected tab's own count drops to zero, the very
 * next render already reports "all" rather than needing an effect to notice
 * the tab vanished and correct the state after the fact.
 */
import { useMemo, useState } from 'react';
import type { Recommendation, RecommendationAction } from '@shared/game/recommendations';

type RecommendationFilter = 'all' | RecommendationAction;

interface FilterTab {
  id: RecommendationFilter;
  label: string;
  count: number;
}

interface UseRecommendationFilterResult {
  tabs: readonly FilterTab[];
  filter: RecommendationFilter;
  setFilter: (filter: RecommendationFilter) => void;
  filtered: readonly Recommendation[];
}

/** Order matters: this is the tab strip's left-to-right order too. */
const FILTER_ORDER: readonly RecommendationFilter[] = ['all', 'update', 'create', 'delete'];

const FILTER_LABELS: Record<RecommendationFilter, string> = {
  all: 'All', update: 'Changed', create: 'Missing', delete: 'Extra',
};

const countFor = (entries: readonly Recommendation[], filter: RecommendationFilter): number =>
  filter === 'all' ? entries.length : entries.filter(entry => entry.action === filter).length;

/** The tab strip's data, pulled out of the hook so it is directly testable, the same split `use-current-records.ts` uses for `recordsFor`. */
const buildFilterTabs = (entries: readonly Recommendation[]): readonly FilterTab[] =>
  FILTER_ORDER
    .map(id => ({ id, label: FILTER_LABELS[id], count: countFor(entries, id) }))
    // A tab that could never show anything is noise; "all" always stays so
    // there is never zero tabs to look at.
    .filter(tab => tab.id === 'all' || tab.count > 0);

const filterEntries = (
  entries: readonly Recommendation[],
  filter: RecommendationFilter,
): readonly Recommendation[] =>
  filter === 'all' ? entries : entries.filter(entry => entry.action === filter);

const useRecommendationFilter = (entries: readonly Recommendation[]): UseRecommendationFilterResult => {
  const [filter, setFilter] = useState<RecommendationFilter>('all');

  const tabs = useMemo(() => buildFilterTabs(entries), [entries]);

  const activeCount = tabs.find(tab => tab.id === filter)?.count ?? 0;
  const effectiveFilter: RecommendationFilter = activeCount > 0 ? filter : 'all';

  const filtered = useMemo(
    () => filterEntries(entries, effectiveFilter),
    [entries, effectiveFilter],
  );

  return { tabs, filter: effectiveFilter, setFilter, filtered };
};

export { buildFilterTabs, filterEntries, useRecommendationFilter };
export type { FilterTab, RecommendationFilter, UseRecommendationFilterResult };
