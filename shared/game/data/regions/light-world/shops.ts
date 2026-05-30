import type { ScreenDefinition } from '../../../types';

export const LW_SHOPS: ScreenDefinition[] = [
  { id: 'kakariko-shop', name: 'Kakariko Shop', type: 'interior', world: 'light', location: 'Kakariko Village', area: 'Kakariko', roomIndex: 0x0100, interior: { kind: 'shop' }, tags: ['world:light', 'env:inside', 'type:shop', 'area:kakariko'] },
  { id: 'cave-shop-lake-hylia', name: 'Cave Shop (Lake Hylia)', type: 'interior', world: 'light', location: 'Lake Hylia', area: 'Lake Hylia', roomIndex: 0x010C, interior: { kind: 'shop' }, tags: ['world:light', 'env:underground', 'type:shop', 'area:lake_hylia'] },
  { id: 'light-world-death-mountain-shop', name: 'Light World Death Mountain Shop', type: 'interior', world: 'light', location: 'Death Mountain', area: 'Death Mountain', roomIndex: 0x010B, interior: { kind: 'shop' }, tags: ['world:light', 'env:inside', 'type:shop', 'area:death_mountain'] },
  { id: 'potion-shop', name: 'Potion Shop', type: 'interior', world: 'light', location: 'Eastern Hyrule', area: 'East Hyrule', roomIndex: 0x011E, interior: { kind: 'shop' }, tags: ['world:light', 'env:inside', 'type:shop', 'area:east_hyrule'] },
];
