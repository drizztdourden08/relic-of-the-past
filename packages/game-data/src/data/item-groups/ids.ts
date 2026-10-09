/* @layer shared-game @kind data */
import type { ItemGroupId } from '../types/ids';

const ITEM_GROUP_IDS = {
  Swords: 'ig-001',
  Bottles: 'ig-002',
  Crystals: 'ig-003',
  Pendants: 'ig-004',
  Medallions: 'ig-005',
  Bows: 'ig-006',
  Gloves: 'ig-007',
} as const satisfies Record<string, ItemGroupId>;

export { ITEM_GROUP_IDS };
