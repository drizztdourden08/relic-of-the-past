/* @layer shared-game @kind data */
import { ITEM_GROUP_IDS } from '../../item-groups/ids';
import type { ItemGroupRecord } from '../../types/item-group';

const ALL_ITEM_GROUPS: ItemGroupRecord[] = [
  {
    id: ITEM_GROUP_IDS.Swords,
    label: 'Swords',
    memberIds: ['item-074', 'item-002', 'item-003', 'item-004'],
  },
  {
    id: ITEM_GROUP_IDS.Bottles,
    label: 'Bottles',
    memberIds: ['item-023', 'item-044', 'item-045', 'item-046', 'item-062', 'item-061', 'item-073'],
  },
  {
    id: ITEM_GROUP_IDS.Crystals,
    label: 'Crystals',
    memberIds: ['item-112', 'item-113', 'item-114', 'item-115', 'item-116', 'item-117', 'item-118'],
  },
  {
    id: ITEM_GROUP_IDS.Pendants,
    label: 'Pendants',
    memberIds: ['item-056', 'item-057', 'item-058'],
  },
  {
    id: ITEM_GROUP_IDS.Medallions,
    label: 'Medallions',
    memberIds: ['item-016', 'item-017', 'item-018'],
  },
  {
    id: ITEM_GROUP_IDS.Bows,
    label: 'Bows',
    memberIds: ['item-012', 'item-060', 'item-078'],
  },
  {
    id: ITEM_GROUP_IDS.Gloves,
    label: 'Gloves',
    memberIds: ['item-028', 'item-029'],
  },
];

export { ALL_ITEM_GROUPS };
