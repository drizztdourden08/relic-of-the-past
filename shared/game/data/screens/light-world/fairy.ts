import type { ScreenDefinition } from '../../../types';

const LW_FAIRY: ScreenDefinition[] = [
  { id: 'bonk-fairy-light', name: 'Bonk Fairy (Light)', type: 'interior', world: 'light', location: 'Central Hyrule', area: 'South Hyrule', roomIndex: 0xF9, interior: { kind: 'fairy' }, tags: ['env:underground'] },
  { id: 'capacity-upgrade', name: 'Capacity Upgrade', type: 'interior', world: 'light', location: 'Lake Hylia', area: 'Lake Hylia', roomIndex: 0x0117, interior: { kind: 'fairy' }, tags: ['env:underground', 'loot:chest'] },
  { id: 'waterfall-of-wishing', name: 'Waterfall of Wishing', type: 'interior', world: 'light', location: 'Eastern Hyrule', area: 'East Hyrule', roomIndex: 0x0119, interior: { kind: 'fairy' }, tags: ['env:underground', 'env:water', 'loot:chest'] },
  { id: 'north-fairy-cave', name: 'North Fairy Cave', type: 'interior', world: 'light', location: 'Eastern Hyrule', area: 'East Hyrule', roomIndex: 0x18, interior: { kind: 'fairy' }, tags: ['env:underground'] },
  { id: 'lake-hylia-healer-fairy', name: 'Lake Hylia Healer Fairy', type: 'interior', world: 'light', location: 'Lake Hylia', area: 'Lake Hylia', roomIndex: 0xFA, interior: { kind: 'fairy' }, tags: ['env:underground'] },
  { id: 'swamp-healer-fairy', name: 'Swamp Healer Fairy', type: 'interior', world: 'light', location: 'Central Hyrule', area: 'South Hyrule', roomIndex: 0xEA, interior: { kind: 'fairy' }, tags: ['env:underground'] },
  { id: 'desert-healer-fairy', name: 'Desert Healer Fairy', type: 'interior', world: 'light', location: 'Desert of Mystery', area: 'Desert', roomIndex: 0xEA, interior: { kind: 'fairy' }, tags: ['env:underground'] },
  { id: 'long-fairy-cave', name: 'Long Fairy Cave', type: 'interior', world: 'light', location: 'Central Hyrule', area: 'South Hyrule', roomIndex: 0x03, interior: { kind: 'fairy' }, tags: ['env:underground'] },
  { id: 'hookshot-fairy', name: 'Hookshot Fairy', type: 'interior', world: 'light', location: 'Death Mountain', area: 'Death Mountain', roomIndex: 0xE8, interior: { kind: 'fairy' }, tags: ['env:underground'] },
];

export { LW_FAIRY };
