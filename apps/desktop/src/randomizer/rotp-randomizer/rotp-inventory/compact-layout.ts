/* @layer renderer-app @kind logic */
import type { InventoryLayout } from '@drizztdourden08/brock-randomizer';
import { COMPACT_LAYOUT } from '@rotp/game-data';
import { toInventorySlot } from './to-inventory-slot';

const compactLayout = (): InventoryLayout => ({
  id: 'compact',
  label: 'Compact',
  areas: [{ id: 'all', rows: [COMPACT_LAYOUT.map(toInventorySlot)] }],
});

export { compactLayout };
