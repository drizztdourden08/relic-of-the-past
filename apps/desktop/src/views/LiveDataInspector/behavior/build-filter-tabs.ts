/* @layer renderer-widgets @kind logic */
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { Recommendation } from '@rotp/navigation';
import { FILTER_LABELS, FILTER_ORDER } from '../LiveDataInspector.constants';
import type { FilterTab, RecommendationFilter } from '../LiveDataInspector.type';

const countFor = (entries: readonly Recommendation[], filter: RecommendationFilter): number =>
  filter === 'all' ? entries.length : entries.filter(entry => entry.action === filter).length;

const buildFilterTabs = (entries: readonly Recommendation[], text: (value: Message) => string): readonly FilterTab[] =>
  FILTER_ORDER
    .map(id => ({ id, label: text(FILTER_LABELS[id]), count: countFor(entries, id) }))
    .filter(tab => tab.id === 'all' || tab.count > 0);

export { buildFilterTabs };
