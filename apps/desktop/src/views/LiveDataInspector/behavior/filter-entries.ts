/* @layer renderer-widgets @kind logic */
import type { Recommendation } from '@rotp/navigation';
import type { RecommendationFilter } from '../LiveDataInspector.type';

const filterEntries = (
  entries: readonly Recommendation[],
  filter: RecommendationFilter,
): readonly Recommendation[] =>
  filter === 'all' ? entries : entries.filter(entry => entry.action === filter);

export { filterEntries };
