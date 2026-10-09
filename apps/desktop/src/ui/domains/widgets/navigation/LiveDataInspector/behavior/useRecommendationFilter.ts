/* @layer renderer-widgets @kind hook */
import { useMemo } from 'react';
import type { Recommendation } from '@rotp/navigation';
import { useWidgetPref } from '@drizztdourden08/brock-react';
import { buildFilterTabs } from './build-filter-tabs';
import { filterEntries } from './filter-entries';
import type { RecommendationFilter, UseRecommendationFilterResult } from '../LiveDataInspector.type';

const useRecommendationFilter = (entries: readonly Recommendation[]): UseRecommendationFilterResult => {
  const [filter, setFilter] = useWidgetPref<RecommendationFilter>('dataset', 'recFilter', 'all');

  const tabs = useMemo(() => buildFilterTabs(entries), [entries]);

  const activeCount = tabs.find(tab => tab.id === filter)?.count ?? 0;
  const effectiveFilter: RecommendationFilter = activeCount > 0 ? filter : 'all';

  const filtered = useMemo(
    () => filterEntries(entries, effectiveFilter),
    [entries, effectiveFilter],
  );

  return { tabs, filter: effectiveFilter, setFilter, filtered };
};

export { useRecommendationFilter };
