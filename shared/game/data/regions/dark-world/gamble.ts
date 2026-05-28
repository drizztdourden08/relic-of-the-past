import type { RegionDefinition } from '../../types';

export const DW_GAMBLE: RegionDefinition[] = [
  { id: 'chest-game', name: 'Chest Game', type: 'cave', indoor: true, displayName: 'Village of Outcasts', inGameIndex: 0x0111, subtitle: 'Chest Game', tags: ['world:dark', 'env:inside', 'type:gamble', 'area:village_of_outcasts', 'role:treasure'] },
  { id: 'archery-game', name: 'Archery Game', type: 'cave', indoor: true, displayName: 'Dark South', inGameIndex: 0x0110, subtitle: 'Archery Game', tags: ['world:dark', 'env:inside', 'type:gamble', 'area:dark_south'] },
];
