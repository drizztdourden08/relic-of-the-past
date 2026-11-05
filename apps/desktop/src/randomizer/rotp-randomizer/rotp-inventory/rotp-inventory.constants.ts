/* @layer renderer-app @kind constants */
import type { InventoryWidgetSlot } from '@drizztdourden08/brock-randomizer';

const ROTP_INVENTORY_WIDGET: InventoryWidgetSlot = { context: 'game', order: 1, padding: 'none', icon: 'package' };
const ROTP_INVENTORY_MISSING_ART_NOTICE = 'Load a ROM to see the inventory sprites.';

export { ROTP_INVENTORY_MISSING_ART_NOTICE, ROTP_INVENTORY_WIDGET };
