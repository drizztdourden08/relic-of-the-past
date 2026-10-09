/* @layer renderer-widgets @kind hook */
import type { InventoryViewMode } from '@shared/game/data';
import { useWidgetPref } from '@drizztdourden08/brock-react';
import { DEFAULT_VIEW_MODE } from '../inventory.constants';

const useInventoryViewMode = (): readonly [InventoryViewMode, (next: InventoryViewMode) => void] =>
  useWidgetPref<InventoryViewMode>('inventory', 'viewMode', DEFAULT_VIEW_MODE);

export { useInventoryViewMode };
