/* @layer shared-game @kind data */
import type { ItemGroupId, ItemId } from '../types/ids';

/** Named item groups used by count-based Requirement leaves, e.g. `{ count: { groupId: 'Pendants', n: 3 } }`. */
const ITEM_GROUPS: Record<ItemGroupId, ItemId[]> = {
  Swords: ['item-074', 'item-002', 'item-003', 'item-004'],
  Bottles: ['item-023', 'item-044', 'item-045', 'item-046', 'item-062', 'item-061', 'item-073'],
  // Crystals/Pendants ids are the ones the dungeon 'prize' checks actually
  // grant (vanillaItemIds), not the orphaned junk-table duplicates.
  Crystals: ['item-112', 'item-113', 'item-114', 'item-115', 'item-116', 'item-117', 'item-118'],
  Pendants: ['item-056', 'item-057', 'item-058'],
  Medallions: ['item-016', 'item-017', 'item-018'],
  Bows: ['item-012', 'item-060', 'item-078'],
  Gloves: ['item-028', 'item-029'],
};

export { ITEM_GROUPS };
