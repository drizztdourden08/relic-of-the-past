/* @layer renderer-app @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { InventoryLayout } from '@drizztdourden08/brock-randomizer';
import { COMPACT_LAYOUT } from '@rotp/game-data';
import { textOf } from '@app/shell/text-bridge';
import { toInventorySlot } from './to-inventory-slot';

const compactLayout = (): InventoryLayout => ({
  id: 'compact',
  get label() {
    return textOf(msg('views-randomizer:inventory.layout.compact'));
  },
  areas: [{ id: 'all', rows: [COMPACT_LAYOUT.map(toInventorySlot)] }],
});

export { compactLayout };
