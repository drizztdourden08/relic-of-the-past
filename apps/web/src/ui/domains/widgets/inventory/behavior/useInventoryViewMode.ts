/* @layer renderer-widgets @kind hook */
/**
 * The inventory widget's view mode. Both the widget and its settings popover read
 * this, so picking a mode in one is seen by the other with no event plumbing.
 *
 * It used to be a single localStorage key, which meant every profile on the
 * machine shared one view mode and neither reader saw the other's write without a
 * hand-dispatched StorageEvent.
 */
import type { InventoryViewMode } from '@shared/game/data';
import { useWidgetPref } from '@app/hooks/useWidgetPref';
import { DEFAULT_VIEW_MODE } from '../inventory.constants';

const useInventoryViewMode = (): readonly [InventoryViewMode, (next: InventoryViewMode) => void] =>
  useWidgetPref<InventoryViewMode>('inventory', 'viewMode', DEFAULT_VIEW_MODE);

export { useInventoryViewMode };
