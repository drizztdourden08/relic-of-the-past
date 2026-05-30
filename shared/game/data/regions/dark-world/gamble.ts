import type { ScreenDefinition } from '../../../types';

export const DW_GAMBLE: ScreenDefinition[] = [
  { id: 'chest-game', name: 'Chest Game', type: 'interior', world: 'dark', location: 'Village of Outcasts', area: 'Village Of Outcasts', roomIndex: 0x0111, interior: { kind: 'gamble' }, tags: ['world:dark', 'env:inside', 'type:gamble', 'area:village_of_outcasts', 'role:treasure'] },
  { id: 'archery-game', name: 'Archery Game', type: 'interior', world: 'dark', location: 'Dark South', area: 'Dark South', roomIndex: 0x0110, interior: { kind: 'gamble' }, tags: ['world:dark', 'env:inside', 'type:gamble', 'area:dark_south'] },
];
