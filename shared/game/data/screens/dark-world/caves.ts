import type { ScreenDefinition } from '../../../types';

const DW_CAVES: ScreenDefinition[] = [
  { id: 'dark-world-hammer-peg-cave', name: 'Dark World Hammer Peg Cave', type: 'interior', world: 'dark', location: 'Village of Outcasts', area: 'Village Of Outcasts', roomIndex: 0x010F, interior: { kind: 'cave' }, tags: ['env:underground', 'loot:chest'] },
  { id: 'bumper-cave', name: 'Bumper Cave', type: 'interior', world: 'dark', location: 'Village of Outcasts', area: 'Village Of Outcasts', roomIndex: 0x0114, interior: { kind: 'cave' }, tags: ['env:underground', 'role:connector', 'loot:chest'] },
  { id: 'hype-cave', name: 'Hype Cave', type: 'interior', world: 'dark', location: 'Dark South', area: 'Dark South', roomIndex: 0xE6, interior: { kind: 'cave' }, tags: ['env:underground', 'loot:chest'] },
  { id: 'dark-lake-hylia-ledge-spike-cave', name: 'Dark Lake Hylia Ledge Spike Cave', type: 'interior', world: 'dark', location: 'Dark Lake', area: 'Dark Lake Hylia', roomIndex: 0x0116, interior: { kind: 'cave' }, tags: ['env:underground'] },
  { id: 'spike-cave', name: 'Spike Cave', type: 'interior', world: 'dark', location: 'Dark Death Mountain', area: 'Dark Death Mountain', roomIndex: 0xFF, interior: { kind: 'cave' }, tags: ['env:underground', 'loot:chest'] },
  { id: 'hookshot-cave', name: 'Hookshot Cave', type: 'interior', world: 'dark', location: 'Dark Death Mountain', area: 'Dark Death Mountain', roomIndex: 0xFE, interior: { kind: 'cave' }, tags: ['env:underground', 'loot:chest'] },
  { id: 'hookshot-cave-upper', name: 'Hookshot Cave (Upper)', type: 'interior', world: 'dark', location: 'Dark Death Mountain', area: 'Dark Death Mountain', roomIndex: 0xEE, interior: { kind: 'cave' }, tags: ['env:underground', 'loot:chest', 'role:connector'] },
  { id: 'mimic-cave', name: 'Mimic Cave', type: 'interior', world: 'dark', location: 'Dark Death Mountain', area: 'Dark Death Mountain', roomIndex: 0xEF, interior: { kind: 'cave' }, tags: ['env:underground', 'loot:chest'] },
];

export { DW_CAVES };
