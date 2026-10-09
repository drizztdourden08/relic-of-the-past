/* @layer renderer-widgets @kind component */
import { TabBar } from '@ds/primitives';
import type { EntityKind } from '@shared/game/data';
import { COLLECTION_TABS } from '../LiveDataInspector.constants';
import type { CollectionTabsProps } from '../LiveDataInspector.type';

const CollectionTabs = (props: CollectionTabsProps) => {
  const { selected, onSelect } = props;
  return (
    <TabBar
      tabs={COLLECTION_TABS}
      activeTab={selected}
      onTabChange={(id) => onSelect(id as EntityKind)}
      iconOnly
    />
  );
};

export { CollectionTabs };
