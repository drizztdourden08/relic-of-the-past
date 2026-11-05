/* @layer renderer-app @kind logic */
import type { InventoryLayout } from '@drizztdourden08/brock-randomizer';
import { INVENTORY_LAYOUT } from '@rotp/game-data';
import { toInventorySlot } from './to-inventory-slot';

const defaultLayout = (): InventoryLayout => ({
  id: 'default',
  label: 'Default',
  areas: INVENTORY_LAYOUT.map((category) => ({
    id: category.label,
    label: category.label,
    rows: [category.items.map(toInventorySlot)],
  })),
});

export { defaultLayout };
