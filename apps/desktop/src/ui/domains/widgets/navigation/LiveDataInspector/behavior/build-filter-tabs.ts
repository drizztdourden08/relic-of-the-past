/* @layer renderer-widgets @kind logic */
import type { Recommendation } from '@shared/game/recommendations';
import { FILTER_LABELS, FILTER_ORDER } from '../LiveDataInspector.constants';
import type { FilterTab, RecommendationFilter } from '../LiveDataInspector.type';

const countFor = (entries: readonly Recommendation[], filter: RecommendationFilter): number =>
  filter === 'all' ? entries.length : entries.filter(entry => entry.action === filter).length;

const buildFilterTabs = (entries: readonly Recommendation[]): readonly FilterTab[] =>
  FILTER_ORDER
    .map(id => ({ id, label: FILTER_LABELS[id], count: countFor(entries, id) }))
    .filter(tab => tab.id === 'all' || tab.count > 0);

export { buildFilterTabs };
