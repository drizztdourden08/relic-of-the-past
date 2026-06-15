/* @layer renderer-widgets @kind constants */
import type { InventoryViewMode } from '@shared/game/items/sprites';

const STORAGE_KEY = 'inventory-view-mode';

const VIEW_OPTIONS: { value: InventoryViewMode; label: string }[] = [
  { value: 'default', label: 'List' },
  { value: 'ingame', label: 'SNES' },
  { value: 'compact', label: 'Grid' },
];

export { STORAGE_KEY, VIEW_OPTIONS };
