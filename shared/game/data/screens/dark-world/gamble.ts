import type { ScreenDefinition } from '../../../types';

const DW_GAMBLE: ScreenDefinition[] = [
  { id: 'chest-game', name: 'Chest Game', type: 'interior', world: 'dark', location: 'Village of Outcasts', area: 'Village Of Outcasts', roomIndex: 0x0111, interior: { kind: 'gamble' }, tags: ['env:indoor', 'loot:chest'] },
  { id: 'archery-game', name: 'Archery Game', type: 'interior', world: 'dark', location: 'Dark South', area: 'Dark South', roomIndex: 0x0110, interior: { kind: 'gamble' }, tags: ['env:indoor'] },
];

export { DW_GAMBLE };
