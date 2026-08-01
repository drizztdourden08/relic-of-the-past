/* @layer shared-game @kind types */
import type { ItemId } from './ids';

interface InventorySlot {
  displayName: string;
  /** The tracker item id(s) to check in the inventory set — first match wins. */
  trackerItemIds: ItemId[];
  sprite: string;
}

interface InventoryCategory {
  label: string;
  items: InventorySlot[];
}

type InventoryViewMode = 'default' | 'ingame' | 'compact';

export type { InventoryCategory, InventorySlot, InventoryViewMode };
