/* @layer renderer-widgets @kind component */
/**
 * The icon strip switching which collection's compact record shows below. It reuses
 * the eleven icons/labels from the Data Inspector's own side rail
 * (`KIND_NAV_ITEMS`), so a reviewer never learns a second iconography.
 *
 * Icon-only: eleven full labels do not fit a docked widget's width, and this
 * is the same iconography a reviewer already knows from the full inspector,
 * so the label is dropped from view and kept as the native hover tooltip.
 */
import { TabBar } from '@ds/primitives';
import { KIND_NAV_ITEMS } from '@app/ui/domains/app/views/DataInspector/DataInspector.constants';
import type { EntityKind } from '@shared/game/data';

interface CollectionTabsProps {
  selected: EntityKind;
  onSelect: (kind: EntityKind) => void;
}

const TABS = KIND_NAV_ITEMS.map(item => ({ id: item.id, label: item.label, icon: item.icon }));

const CollectionTabs = (props: CollectionTabsProps) => {
  const { selected, onSelect } = props;
  return (
    <TabBar
      tabs={TABS}
      activeTab={selected}
      onTabChange={(id) => onSelect(id as EntityKind)}
      iconOnly
    />
  );
};

export { CollectionTabs };
export type { CollectionTabsProps };
