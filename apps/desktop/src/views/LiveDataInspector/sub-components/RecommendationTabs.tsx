/* @layer renderer-widgets @kind component */
import { Box, Tabs } from '@drizztdourden08/tessera/primitives';
import type { RecommendationFilter, RecommendationTabsProps } from '../LiveDataInspector.type';

const RecommendationTabs = (props: RecommendationTabsProps) => {
  const { tabs, selected, onSelect } = props;
  const items = tabs.map(tab => ({ id: tab.id, label: tab.label, badge: tab.count }));

  return (
    <Box className="live-data-inspector__tabs">
      <Tabs
        tabs={items}
        activeTab={selected}
        onTabChange={(id) => onSelect(id as RecommendationFilter)}
      />
    </Box>
  );
};

export { RecommendationTabs };
