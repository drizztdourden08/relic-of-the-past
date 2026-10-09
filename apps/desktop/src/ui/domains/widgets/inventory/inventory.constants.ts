/* @layer renderer-widgets @kind constants */
import type { InventoryViewMode } from '@shared/game/data';

const DEFAULT_VIEW_MODE: InventoryViewMode = 'default';

const VIEW_OPTIONS: { value: InventoryViewMode; label: string }[] = [
  { value: 'default', label: 'List' },
  { value: 'ingame', label: 'SNES' },
  { value: 'compact', label: 'Grid' },
];

export { DEFAULT_VIEW_MODE, VIEW_OPTIONS };
