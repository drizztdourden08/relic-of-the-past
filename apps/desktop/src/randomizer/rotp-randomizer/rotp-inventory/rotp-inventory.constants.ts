/* @layer renderer-app @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { InventoryWidgetSlot } from '@drizztdourden08/brock-randomizer';

const ROTP_INVENTORY_WIDGET: InventoryWidgetSlot = { context: 'game', order: 1, padding: 'none', icon: 'package' };
const ROTP_INVENTORY_MISSING_ART_NOTICE = msg('views-randomizer:inventory.missing-art');

export { ROTP_INVENTORY_MISSING_ART_NOTICE, ROTP_INVENTORY_WIDGET };
