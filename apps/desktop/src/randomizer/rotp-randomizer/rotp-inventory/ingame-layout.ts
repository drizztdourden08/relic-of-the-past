/* @layer renderer-app @kind logic */
import type { InventoryLayout } from '@drizztdourden08/brock-randomizer';
import { INGAME_EQUIPMENT, INGAME_ITEMS_GRID, INGAME_PASSIVES } from '@rotp/game-data';
import { toInventorySlot } from './to-inventory-slot';

const ingameLayout = (): InventoryLayout => ({
  id: 'ingame',
  label: 'In-game',
  areas: [
    { id: 'main', rows: INGAME_ITEMS_GRID.map((row) => row.map(toInventorySlot)) },
    { id: 'side', rows: INGAME_EQUIPMENT.map((slot) => [toInventorySlot(slot)]) },
    { id: 'bottom', rows: [INGAME_PASSIVES.map(toInventorySlot)] },
  ],
});

export { ingameLayout };
