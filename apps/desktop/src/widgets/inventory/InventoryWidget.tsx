/* @layer renderer-widgets @kind component */
/**
 * InventoryWidget — Content for the Inventory widget.
 * Wraps TrackerInventory with data subscription + view mode state.
 */
import { useState, useEffect } from 'react';
import { onInventoryChanged, getCurrentInventory } from '../../lib/game';
import { TrackerInventory } from '../../components/views/TrackerView/sub-components/TrackerInventory';
import { useInventoryViewMode } from './behavior/useInventoryViewMode';

const InventoryWidgetContent = () => {
  const [inventory, setInventory] = useState<Set<string>>(() => getCurrentInventory());
  const viewMode = useInventoryViewMode();

  useEffect(() => onInventoryChanged((inv) => setInventory(new Set(inv))), []);

  return <TrackerInventory inventory={inventory} viewMode={viewMode} />;
};

export { InventoryWidgetContent };
