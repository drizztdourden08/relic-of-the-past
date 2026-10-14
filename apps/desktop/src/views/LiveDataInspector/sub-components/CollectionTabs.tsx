/* @layer renderer-widgets @kind component */
import { Box, Tabs } from '@drizztdourden08/tessera/primitives';
import type { EntityKind } from '@rotp/game-data';
import { COLLECTION_TABS } from '../LiveDataInspector.constants';
import type { CollectionTabsProps } from '../LiveDataInspector.type';

const CollectionTabs = (props: CollectionTabsProps) => {
  const { selected, onSelect } = props;
  return (
    <Box className="live-data-inspector__tabs">
      <Tabs
        tabs={COLLECTION_TABS}
        activeTab={selected}
        onTabChange={(id) => onSelect(id as EntityKind)}
        iconOnly
      />
    </Box>
  );
};

export { CollectionTabs };
