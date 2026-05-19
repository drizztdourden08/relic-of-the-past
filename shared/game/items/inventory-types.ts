interface InventorySlot {
  displayName: string;
  /** The tracker item name(s) to check in the inventory set — first match wins */
  trackerNames: string[];
  sprite: string;
}

interface InventoryCategory {
  label: string;
  items: InventorySlot[];
}

type InventoryViewMode = 'default' | 'ingame' | 'compact';

export type { InventoryCategory, InventorySlot, InventoryViewMode };
