/* @layer renderer-app @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { InventoryLayout } from '@drizztdourden08/brock-randomizer';
import { INVENTORY_LAYOUT } from '@rotp/game-data';
import { textOf } from '@app/shell/text-bridge';
import { toInventorySlot } from './to-inventory-slot';

const defaultLayout = (): InventoryLayout => ({
  id: 'default',
  get label() {
    return textOf(msg('views-randomizer:inventory.layout.default'));
  },
  areas: INVENTORY_LAYOUT.map((category) => ({
    id: category.label.key,
    get label() {
      return textOf(category.label);
    },
    rows: [category.items.map(toInventorySlot)],
  })),
});

export { defaultLayout };
