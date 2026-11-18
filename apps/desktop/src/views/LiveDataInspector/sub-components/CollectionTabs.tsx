/* @layer renderer-widgets @kind component */
import { useMemo } from 'react';
import { useText } from '@drizztdourden08/brock-react';
import { Box, Tabs } from '@drizztdourden08/tessera/primitives';
import { KIND_NAV_ITEMS } from '@app/views/DataInspector/DataInspector.constants';
import type { EntityKind } from '@rotp/game-data';
import { toCollectionTab } from '../behavior/to-collection-tab';
import type { CollectionTabsProps } from '../LiveDataInspector.type';

const CollectionTabs = (props: CollectionTabsProps) => {
  const { selected, onSelect } = props;
  const text = useText();
  const tabs = useMemo(() => KIND_NAV_ITEMS.map(toCollectionTab(text)), [text]);
  return (
    <Box className="live-data-inspector__tabs">
      <Tabs
        tabs={tabs}
        activeTab={selected}
        onTabChange={(id) => onSelect(id as EntityKind)}
        iconOnly
      />
    </Box>
  );
};

export { CollectionTabs };
