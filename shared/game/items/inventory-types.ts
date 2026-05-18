export interface InventorySlot {
  displayName: string;
  /** The tracker item name(s) to check in the inventory set — first match wins */
  trackerNames: string[];
  sprite: string;
}

export interface InventoryCategory {
  label: string;
  items: InventorySlot[];
}

export type InventoryViewMode = 'default' | 'ingame' | 'compact';
