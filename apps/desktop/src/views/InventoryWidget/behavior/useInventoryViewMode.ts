/* @layer renderer-widgets @kind hook */
import type { InventoryViewMode } from '@rotp/game-data';
import { useWidgetPref } from '@drizztdourden08/brock-react';
import { DEFAULT_VIEW_MODE } from '../InventoryWidget.constants';

const useInventoryViewMode = (): readonly [InventoryViewMode, (next: InventoryViewMode) => void] =>
  useWidgetPref<InventoryViewMode>('inventory', 'viewMode', DEFAULT_VIEW_MODE);

export { useInventoryViewMode };
