/* @layer renderer-app @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { InventoryLayout } from '@drizztdourden08/brock-randomizer';
import { INGAME_EQUIPMENT, INGAME_ITEMS_GRID, INGAME_PASSIVES } from '@rotp/game-data';
import { textOf } from '@app/shell/text-bridge';
import { toInventorySlot } from './to-inventory-slot';

const ingameLayout = (): InventoryLayout => ({
  id: 'ingame',
  get label() {
    return textOf(msg('views-randomizer:inventory.layout.ingame'));
  },
  areas: [
    { id: 'main', rows: INGAME_ITEMS_GRID.map((row) => row.map(toInventorySlot)) },
    { id: 'side', rows: INGAME_EQUIPMENT.map((slot) => [toInventorySlot(slot)]) },
    { id: 'bottom', rows: [INGAME_PASSIVES.map(toInventorySlot)] },
  ],
});

export { ingameLayout };
