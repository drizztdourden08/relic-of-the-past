/* @layer shared-game @kind data */
import type { ScreenDefinition } from '../../../types';

const LW_CAVES: ScreenDefinition[] = [
  { id: 'aginahs-cave', name: 'Desert Sages Cave', type: 'interior', world: 'light', location: 'Desert of Mystery', area: 'Desert', roomIndex: 0x08, interior: { kind: 'cave' }, tags: ['env:underground', 'loot:chest'] },
  { id: 'bat-cave-right', name: 'Bat Cave (right)', type: 'interior', world: 'light', location: 'Kakariko Village', area: 'Kakariko', roomIndex: 0xE4, interior: { kind: 'cave' }, tags: ['env:underground', 'loot:chest'] },
  { id: 'bat-cave-left', name: 'Bat Cave (left)', type: 'interior', world: 'light', location: 'Kakariko Village', area: 'Kakariko', roomIndex: 0xE5, interior: { kind: 'cave' }, tags: ['env:underground', 'role:connector'] },
  { id: 'kings-grave', name: 'Kings Grave', type: 'interior', world: 'light', location: 'Eastern Hyrule', area: 'East Hyrule', roomIndex: 0x0113, interior: { kind: 'cave' }, tags: ['env:underground', 'loot:chest'] },
  { id: 'mini-moldorm-cave', name: 'Mini Moldorm Cave', type: 'interior', world: 'light', location: 'Central Hyrule', area: 'South Hyrule', roomIndex: 0x2F, interior: { kind: 'cave' }, tags: ['env:underground', 'loot:chest'] },
  { id: 'ice-rod-cave', name: 'Ice Rod Cave', type: 'interior', world: 'light', location: 'Central Hyrule', area: 'South Hyrule', roomIndex: 0xD6, interior: { kind: 'cave' }, tags: ['env:underground', 'loot:chest'] },
  { id: 'good-bee-cave', name: 'Good Bee Cave', type: 'interior', world: 'light', location: 'Lake Hylia', area: 'Lake Hylia', roomIndex: 0x0127, interior: { kind: 'cave' }, tags: ['env:underground'] },
  { id: '20-rupee-cave', name: '20 Rupee Cave', type: 'interior', world: 'light', location: 'Lake Hylia', area: 'Lake Hylia', roomIndex: 0x10, interior: { kind: 'cave' }, tags: ['env:underground', 'loot:chest'] },
  { id: 'bonk-rock-cave', name: 'Bonk Rock Cave', type: 'interior', world: 'light', location: 'Central Hyrule', area: 'South Hyrule', roomIndex: 0x3C, interior: { kind: 'cave' }, tags: ['env:underground', 'loot:chest'] },
  { id: '50-rupee-cave', name: '50 Rupee Cave', type: 'interior', world: 'light', location: 'Central Hyrule', area: 'South Hyrule', roomIndex: 0x03, interior: { kind: 'cave' }, tags: ['env:underground', 'loot:chest'] },
  { id: 'cave-45', name: 'Cave 45', type: 'interior', world: 'light', location: 'Central Hyrule', area: 'South Hyrule', roomIndex: 0x30, interior: { kind: 'cave' }, tags: ['env:underground', 'loot:chest'] },
  { id: 'graveyard-cave', name: 'Graveyard Cave', type: 'interior', world: 'light', location: 'Eastern Hyrule', area: 'East Hyrule', roomIndex: 0x80, interior: { kind: 'cave' }, tags: ['env:underground', 'loot:chest'] },
  { id: 'checkerboard-cave', name: 'Checkerboard Cave', type: 'interior', world: 'light', location: 'Desert of Mystery', area: 'Desert', roomIndex: 0x30, interior: { kind: 'cave' }, tags: ['env:underground', 'loot:chest'] },
  { id: 'lost-woods-hideout-top', name: 'Lost Woods Hideout (top)', type: 'interior', world: 'light', location: 'Lost Woods', area: 'Lost Woods', roomIndex: 0x0125, interior: { kind: 'cave' }, tags: ['env:underground', 'traverse:fall'] },
  { id: 'lost-woods-hideout-bottom', name: 'Lost Woods Hideout (bottom)', type: 'interior', world: 'light', location: 'Lost Woods', area: 'Lost Woods', roomIndex: 0x0125, interior: { kind: 'cave' }, tags: ['env:underground', 'loot:chest'] },
  { id: 'lumberjack-tree-top', name: 'Lumberjack Tree (top)', type: 'interior', world: 'light', location: 'Lost Woods', area: 'Lost Woods', roomIndex: 0x0124, interior: { kind: 'cave' }, tags: ['env:underground', 'traverse:fall'] },
  { id: 'lumberjack-tree-bottom', name: 'Lumberjack Tree (bottom)', type: 'interior', world: 'light', location: 'Lost Woods', area: 'Lost Woods', roomIndex: 0x0124, interior: { kind: 'cave' }, tags: ['env:underground', 'loot:chest'] },
  { id: 'spectacle-rock-cave-top', name: 'Spectacle Rock Cave (Top)', type: 'interior', world: 'light', location: 'Death Mountain', area: 'Death Mountain', roomIndex: 0xE2, interior: { kind: 'cave' }, tags: ['env:underground', 'loot:chest'] },
  { id: 'paradox-cave-front', name: 'Paradox Cave Front', type: 'interior', world: 'light', location: 'Death Mountain', area: 'Death Mountain', roomIndex: 0xD5, interior: { kind: 'cave' }, tags: ['env:underground', 'role:connector'] },
  { id: 'paradox-cave-chest-area', name: 'Paradox Cave Chest Area', type: 'interior', world: 'light', location: 'Death Mountain', area: 'Death Mountain', roomIndex: 0x24, interior: { kind: 'cave' }, tags: ['env:underground', 'loot:chest'] },
  { id: 'paradox-cave', name: 'Paradox Cave', type: 'interior', world: 'light', location: 'Death Mountain', area: 'Death Mountain', roomIndex: 0xEB, interior: { kind: 'cave' }, tags: ['env:underground', 'role:connector'] },
  { id: 'spiral-cave-top', name: 'Spiral Cave (Top)', type: 'interior', world: 'light', location: 'Death Mountain', area: 'Death Mountain', roomIndex: 0x23, interior: { kind: 'cave' }, tags: ['env:underground', 'loot:chest'] },
];

export { LW_CAVES };
