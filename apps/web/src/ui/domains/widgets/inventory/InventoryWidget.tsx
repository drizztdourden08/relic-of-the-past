/* @layer renderer-widgets @kind component */
/**
 * Content for the Inventory widget.
 * Wraps TrackerInventory with data subscription + view mode state.
 */
import { useState, useEffect } from 'react';
import { onInventoryChanged, getCurrentInventory } from '../../../../lib/game';
import type { ItemId } from '@shared/game/data';
import { TrackerInventory } from '@domains/app/compounds/TrackerInventory';
import { useInventoryViewMode } from './behavior/useInventoryViewMode';

const InventoryWidgetContent = () => {
  const [inventory, setInventory] = useState<Set<ItemId>>(() => getCurrentInventory());
  const viewMode = useInventoryViewMode();

  useEffect(() => onInventoryChanged((inv) => setInventory(new Set(inv))), []);

  return <TrackerInventory inventory={inventory} viewMode={viewMode} />;
};

export { InventoryWidgetContent };
