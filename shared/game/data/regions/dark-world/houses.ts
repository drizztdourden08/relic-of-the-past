import type { ScreenDefinition } from '../../../types';

export const DW_HOUSES: ScreenDefinition[] = [
  { id: 'mire-shed', name: 'Mire Shed', type: 'interior', world: 'dark', location: 'Swamp of Evil', area: 'Dark Mire', roomIndex: 0x0112, interior: { kind: 'house' }, tags: ['world:dark', 'env:inside', 'type:house', 'area:dark_mire', 'role:treasure'] },
  { id: 'brewery', name: 'Brewery', type: 'interior', world: 'dark', location: 'Village of Outcasts', area: 'Village Of Outcasts', roomIndex: 0x0113, interior: { kind: 'house' }, tags: ['world:dark', 'env:inside', 'type:house', 'area:village_of_outcasts', 'role:treasure'] },
  { id: 'c-shaped-house', name: 'C-Shaped House', type: 'interior', world: 'dark', location: 'Village of Outcasts', area: 'Village Of Outcasts', roomIndex: 0x0112, interior: { kind: 'house' }, tags: ['world:dark', 'env:inside', 'type:house', 'area:village_of_outcasts', 'role:treasure'] },
];
