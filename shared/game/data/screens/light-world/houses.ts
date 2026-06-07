/* @layer shared-game @kind data */
import type { ScreenDefinition } from '../../../types';

const LW_HOUSES: ScreenDefinition[] = [
  { id: 'blinds-hideout', name: 'Blinds Hideout', type: 'interior', world: 'light', location: 'Kakariko Village', area: 'Kakariko', roomIndex: 0x0108, interior: { kind: 'house' }, tags: ['env:indoor', 'loot:chest'] },
  { id: 'chicken-house', name: 'Chicken House', type: 'interior', world: 'light', location: 'Kakariko Village', area: 'Kakariko', roomIndex: 0x0101, interior: { kind: 'house' }, tags: ['env:indoor', 'loot:chest'] },
  { id: 'sick-kids-house', name: 'Sick Kids House', type: 'interior', world: 'light', location: 'Kakariko Village', area: 'Kakariko', roomIndex: 0x0102, interior: { kind: 'house' }, tags: ['env:indoor'] },
  { id: 'blacksmiths-hut', name: 'Blacksmiths Hut', type: 'interior', world: 'light', location: 'Kakariko Village', area: 'Kakariko', roomIndex: 0x0120, interior: { kind: 'house' }, tags: ['env:indoor'] },
  { id: 'tavern', name: 'Tavern', type: 'interior', world: 'light', location: 'Kakariko Village', area: 'Kakariko', roomIndex: 0x0103, interior: { kind: 'house' }, tags: ['env:indoor', 'loot:chest'] },
  { id: 'tavern-front', name: 'Tavern (Front)', type: 'interior', world: 'light', location: 'Kakariko Village', area: 'Kakariko', roomIndex: 0x0103, interior: { kind: 'house' }, tags: ['env:indoor', 'role:safe'] },
  { id: 'elder-house', name: 'Elder House', type: 'interior', world: 'light', location: 'Kakariko Village', area: 'Kakariko', roomIndex: 0x0105, interior: { kind: 'house' }, tags: ['env:indoor', 'role:safe'] },
  { id: 'snitch-lady-east', name: 'Snitch Lady (East)', type: 'interior', world: 'light', location: 'Kakariko Village', area: 'Kakariko', roomIndex: 0x0106, interior: { kind: 'house' }, tags: ['env:indoor', 'role:safe'] },
  { id: 'snitch-lady-west', name: 'Snitch Lady (West)', type: 'interior', world: 'light', location: 'Kakariko Village', area: 'Kakariko', roomIndex: 0x0106, interior: { kind: 'house' }, tags: ['env:indoor', 'role:safe'] },
  { id: 'bush-covered-house', name: 'Bush Covered House', type: 'interior', world: 'light', location: 'Kakariko Village', area: 'Kakariko', roomIndex: 0x0109, interior: { kind: 'house' }, tags: ['env:indoor', 'role:safe'] },
  { id: 'light-world-bomb-hut', name: 'Light World Bomb Hut', type: 'interior', world: 'light', location: 'Kakariko Village', area: 'Kakariko', roomIndex: 0x010A, interior: { kind: 'house' }, tags: ['env:indoor'] },
  { id: 'library', name: 'Library', type: 'interior', world: 'light', location: 'Kakariko Village', area: 'Kakariko', roomIndex: 0x2C, interior: { kind: 'house' }, tags: ['env:indoor', 'loot:chest'] },
  { id: 'links-house', name: 'Links House', type: 'interior', world: 'light', location: 'Central Hyrule', area: 'South Hyrule', roomIndex: 0x0104, interior: { kind: 'house' }, tags: ['env:indoor', 'role:safe', 'role:spawn'] },
  { id: 'links-house--intro', name: 'Links House (Intro)', type: 'interior', world: 'light', location: 'Central Hyrule', area: 'South Hyrule', roomIndex: 0x0104, interior: { kind: 'house' }, variant: { key: 'intro', progressTier: 0, condition: { type: 'progress', max: 0 } }, tags: ['env:indoor', 'role:safe', 'role:spawn'] },
  { id: 'dam', name: 'Dam', type: 'interior', world: 'light', location: 'Central Hyrule', area: 'South Hyrule', roomIndex: 0x55, interior: { kind: 'house' }, tags: ['env:indoor'] },
  { id: 'sahasrahlas-hut', name: 'Sahasrahlas Hut', type: 'interior', world: 'light', location: 'Eastern Hyrule', area: 'East Hyrule', roomIndex: 0x0107, interior: { kind: 'house' }, tags: ['env:indoor', 'loot:chest'] },
  { id: 'lumberjack-house', name: 'Lumberjack House', type: 'interior', world: 'light', location: 'Lost Woods', area: 'Lost Woods', roomIndex: 0xE1, interior: { kind: 'house' }, tags: ['env:indoor', 'role:safe'] },
  { id: 'old-man-house', name: 'Old Man House', type: 'interior', world: 'light', location: 'Death Mountain', area: 'Death Mountain', roomIndex: 0xF4, interior: { kind: 'house' }, tags: ['env:indoor', 'role:safe'] },
  { id: 'old-man-house-back', name: 'Old Man House Back', type: 'interior', world: 'light', location: 'Death Mountain', area: 'Death Mountain', roomIndex: 0xF5, interior: { kind: 'house' }, tags: ['env:indoor', 'role:connector'] },
  { id: 'two-brothers-house', name: 'Two Brothers House', type: 'interior', world: 'light', location: 'Kakariko Village', area: 'Kakariko', roomIndex: 0x011F, interior: { kind: 'house' }, tags: ['env:indoor', 'role:connector'] },
];

export { LW_HOUSES };
