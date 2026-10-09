/* @layer renderer-widgets @kind component */
import { Tabs } from '@drizztdourden08/tessera/primitives';
import type { RecommendationFilter, RecommendationTabsProps } from '../LiveDataInspector.type';

const RecommendationTabs = (props: RecommendationTabsProps) => {
  const { tabs, selected, onSelect } = props;
  const items = tabs.map(tab => ({ id: tab.id, label: tab.label, badge: tab.count }));

  return (
    <Tabs
      tabs={items}
      activeTab={selected}
      onTabChange={(id) => onSelect(id as RecommendationFilter)}
    />
  );
};

export { RecommendationTabs };
