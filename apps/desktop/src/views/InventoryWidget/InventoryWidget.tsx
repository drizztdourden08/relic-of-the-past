/* @layer renderer-widgets @kind component */
import { useState, useEffect } from 'react';
import { EmptyState } from '@drizztdourden08/tessera/primitives';
import { onInventoryChanged, getCurrentInventory } from '../../game';
import type { ItemId } from '@rotp/game-data';
import { TrackerInventory } from '@app/compounds/TrackerInventory';
import { useInventoryViewMode } from './behavior/useInventoryViewMode';
import { useSpriteAvailabilityStore } from '@app/stores/sprite-availability-store';

const InventoryWidgetContent = () => {
  const [inventory, setInventory] = useState<Set<ItemId>>(() => getCurrentInventory());
  const [viewMode] = useInventoryViewMode();
  const spritesAvailable = useSpriteAvailabilityStore((state) => state.available);

  useEffect(() => onInventoryChanged((inv) => setInventory(new Set(inv))), []);

  return spritesAvailable
    ? <TrackerInventory inventory={inventory} viewMode={viewMode} />
    : <EmptyState message="Load a ROM to see the inventory sprites." />;
};

export { InventoryWidgetContent };
