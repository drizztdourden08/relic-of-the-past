import type { ScreenDefinition } from '../../../types';

const DW_HOUSES: ScreenDefinition[] = [
  { id: 'mire-shed', name: 'Mire Shed', type: 'interior', world: 'dark', location: 'Swamp of Evil', area: 'Dark Mire', roomIndex: 0x0112, interior: { kind: 'house' }, tags: ['env:indoor', 'loot:chest'] },
  { id: 'brewery', name: 'Brewery', type: 'interior', world: 'dark', location: 'Village of Outcasts', area: 'Village Of Outcasts', roomIndex: 0x0113, interior: { kind: 'house' }, tags: ['env:indoor', 'loot:chest'] },
  { id: 'c-shaped-house', name: 'C-Shaped House', type: 'interior', world: 'dark', location: 'Village of Outcasts', area: 'Village Of Outcasts', roomIndex: 0x0112, interior: { kind: 'house' }, tags: ['env:indoor', 'loot:chest'] },
];

export { DW_HOUSES };
