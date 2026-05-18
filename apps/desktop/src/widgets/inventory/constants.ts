import type { InventoryViewMode } from '@shared/game/items/sprites';

export const STORAGE_KEY = 'inventory-view-mode';

export const VIEW_OPTIONS: { value: InventoryViewMode; label: string }[] = [
  { value: 'default', label: 'List' },
  { value: 'ingame', label: 'SNES' },
  { value: 'compact', label: 'Grid' },
];
