/* @layer renderer-components @kind types */
import type { InventoryCategory, InventorySlot, InventoryViewMode, ItemId } from '@rotp/game-data';

interface TrackerInventoryProps {
  inventory: ReadonlySet<ItemId>;
  viewMode?: InventoryViewMode;
}

interface InventoryViewProps {
  inventory: ReadonlySet<ItemId>;
}

interface InventoryCategoryProps extends InventoryViewProps {
  category: InventoryCategory;
}

interface InventorySlotProps extends InventoryViewProps {
  slot: InventorySlot;
}

export type { InventoryCategoryProps, InventorySlotProps, InventoryViewProps, TrackerInventoryProps };
