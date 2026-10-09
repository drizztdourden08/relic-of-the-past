/* @layer renderer-widgets @kind component */
import { useState, useEffect } from 'react';
import { onInventoryChanged, getCurrentInventory } from '../../../../lib/game';
import type { ItemId } from '@rotp/game-data';
import { TrackerInventory } from '@domains/app/compounds/TrackerInventory';
import { useInventoryViewMode } from './behavior/useInventoryViewMode';

const InventoryWidgetContent = () => {
  const [inventory, setInventory] = useState<Set<ItemId>>(() => getCurrentInventory());
  const [viewMode] = useInventoryViewMode();

  useEffect(() => onInventoryChanged((inv) => setInventory(new Set(inv))), []);

  return <TrackerInventory inventory={inventory} viewMode={viewMode} />;
};

export { InventoryWidgetContent };
