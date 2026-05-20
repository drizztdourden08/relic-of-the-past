import type { RegionDefinition } from '../../types';

export const LW_SHOPS: RegionDefinition[] = [
  { id: 'kakariko-shop', name: 'Kakariko Shop', type: 'cave', displayName: 'Kakariko Village', tags: ['world:light', 'env:inside', 'type:shop', 'area:kakariko'] },
  { id: 'cave-shop-lake-hylia', name: 'Cave Shop (Lake Hylia)', type: 'cave', displayName: 'Lake Hylia', tags: ['world:light', 'env:underground', 'type:shop', 'area:lake_hylia'] },
  { id: 'light-world-death-mountain-shop', name: 'Light World Death Mountain Shop', type: 'cave', displayName: 'Death Mountain', tags: ['world:light', 'env:inside', 'type:shop', 'area:death_mountain'] },
  { id: 'potion-shop', name: 'Potion Shop', type: 'cave', displayName: 'Eastern Hyrule', tags: ['world:light', 'env:inside', 'type:shop', 'area:east_hyrule'] },
];
