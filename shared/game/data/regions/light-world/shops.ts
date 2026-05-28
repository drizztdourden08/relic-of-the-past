import type { RegionDefinition } from '../../types';

export const LW_SHOPS: RegionDefinition[] = [
  { id: 'kakariko-shop', name: 'Kakariko Shop', type: 'cave', indoor: true, displayName: 'Kakariko Village', inGameIndex: 0x0100, subtitle: 'Shop', tags: ['world:light', 'env:inside', 'type:shop', 'area:kakariko'] },
  { id: 'cave-shop-lake-hylia', name: 'Cave Shop (Lake Hylia)', type: 'cave', indoor: true, displayName: 'Lake Hylia', inGameIndex: 0x010c, subtitle: 'Cave Shop', tags: ['world:light', 'env:underground', 'type:shop', 'area:lake_hylia'] },
  { id: 'light-world-death-mountain-shop', name: 'Light World Death Mountain Shop', type: 'cave', indoor: true, displayName: 'Death Mountain', inGameIndex: 0x010b, subtitle: 'Mountain Shop', tags: ['world:light', 'env:inside', 'type:shop', 'area:death_mountain'] },
  { id: 'potion-shop', name: 'Potion Shop', type: 'cave', indoor: true, displayName: 'Eastern Hyrule', inGameIndex: 0x011e, subtitle: 'Potion Shop', tags: ['world:light', 'env:inside', 'type:shop', 'area:east_hyrule'] },
];
