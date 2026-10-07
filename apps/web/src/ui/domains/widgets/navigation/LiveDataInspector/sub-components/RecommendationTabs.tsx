/* @layer renderer-widgets @kind component */
/**
 * The filter strip above the finding list. Which action a tab stands for is
 * `useRecommendationFilter`'s concern; this only turns that into `TabBar`
 * tabs, badge-per-count, the same primitive `CollectionTabs` already uses
 * below for the record collections.
 */
import { TabBar } from '@ds/primitives';
import type { FilterTab, RecommendationFilter } from '../behavior/use-recommendation-filter';

interface RecommendationTabsProps {
  tabs: readonly FilterTab[];
  selected: RecommendationFilter;
  onSelect: (filter: RecommendationFilter) => void;
}

const RecommendationTabs = (props: RecommendationTabsProps) => {
  const { tabs, selected, onSelect } = props;
  const items = tabs.map(tab => ({ id: tab.id, label: tab.label, badge: tab.count }));

  return (
    <TabBar
      tabs={items}
      activeTab={selected}
      onTabChange={(id) => onSelect(id as RecommendationFilter)}
    />
  );
};

export { RecommendationTabs };
export type { RecommendationTabsProps };
