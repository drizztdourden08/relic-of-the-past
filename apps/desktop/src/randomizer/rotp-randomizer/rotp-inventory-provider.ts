/* @layer renderer-app @kind logic */
import type { InventoryProvider } from '@drizztdourden08/brock-randomizer';
import { textOf } from '@app/shell/text-bridge';
import { compactLayout } from './rotp-inventory/compact-layout';
import { defaultLayout } from './rotp-inventory/default-layout';
import { ingameLayout } from './rotp-inventory/ingame-layout';
import { ROTP_INVENTORY_MISSING_ART_NOTICE, ROTP_INVENTORY_WIDGET } from './rotp-inventory/rotp-inventory.constants';

const rotpInventoryProvider: InventoryProvider = {
  layouts: [defaultLayout(), compactLayout(), ingameLayout()],
  widget: ROTP_INVENTORY_WIDGET,
  get missingArtNotice() {
    return textOf(ROTP_INVENTORY_MISSING_ART_NOTICE);
  },
};

export { rotpInventoryProvider };
