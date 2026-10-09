/* @layer renderer-components @kind component */
import { CompactInventory } from './sub-components/CompactInventory';
import { DefaultInventory } from './sub-components/DefaultInventory';
import { IngameInventory } from './sub-components/IngameInventory';
import type { TrackerInventoryProps } from './TrackerInventory.type';
import './TrackerInventory.css';

const TrackerInventory = (props: TrackerInventoryProps) => {
  const { inventory, viewMode = 'default' } = props;
  if (viewMode === 'ingame') return <IngameInventory inventory={inventory} />;
  if (viewMode === 'compact') return <CompactInventory inventory={inventory} />;
  return <DefaultInventory inventory={inventory} />;
};

export { TrackerInventory };
