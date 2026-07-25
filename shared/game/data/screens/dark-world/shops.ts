/* @layer shared-game @kind data */
import type { ScreenDefinition } from '../../../types';

const DW_SHOPS: ScreenDefinition[] = [
  { id: 'village-of-outcasts-shop', name: 'Village of Outcasts Shop', type: 'interior', world: 'dark', location: 'Village of Outcasts', area: 'Village Of Outcasts', roomIndex: 0x011C, interior: { kind: 'shop' }, tags: ['env:indoor'] },
  { id: 'dark-lake-hylia-shop', name: 'Dark Great Lake Shop', type: 'interior', world: 'dark', location: 'Dark Lake', area: 'Dark Lake Hylia', roomIndex: 0x011E, interior: { kind: 'shop' }, tags: ['env:indoor'] },
  { id: 'dark-world-lumberjack-shop', name: 'Dark World Lumberjack Shop', type: 'interior', world: 'dark', location: 'Skull Woods', area: 'Skull Woods Area', roomIndex: 0x0115, interior: { kind: 'shop' }, tags: ['env:indoor'] },
  { id: 'dark-world-potion-shop', name: 'Dark World Potion Shop', type: 'interior', world: 'dark', location: 'Village of Outcasts', area: 'Village Of Outcasts', roomIndex: 0x0118, interior: { kind: 'shop' }, tags: ['env:indoor'] },
  { id: 'red-shield-shop', name: 'Red Shield Shop', type: 'interior', world: 'dark', location: 'Village of Outcasts', area: 'Village Of Outcasts', roomIndex: 0x0115, interior: { kind: 'shop' }, tags: ['env:indoor'] },
  { id: 'big-bomb-shop', name: 'Big Bomb Shop', type: 'interior', world: 'dark', location: 'Dark South', area: 'Dark South', roomIndex: 0x010D, interior: { kind: 'shop' }, tags: ['env:indoor'] },
  { id: 'cave-shop-dark-death-mountain', name: 'Cave Shop (Dark Death Mountain)', type: 'interior', world: 'dark', location: 'Dark Death Mountain', area: 'Dark Death Mountain', roomIndex: 0xDF, interior: { kind: 'shop' }, tags: ['env:underground'] },
];

export { DW_SHOPS };
