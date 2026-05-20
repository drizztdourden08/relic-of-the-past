import type { RegionDefinition } from '../../types';

export const LW_SPECIAL: RegionDefinition[] = [
  { id: 'menu', name: 'Menu / Save & Quit', type: 'lightWorld', displayName: 'Menu', tags: ['world:light', 'type:special', 'role:spawn_point'] },
  { id: 'chris-houlihan-room', name: 'Chris Houlihan Room', type: 'cave', displayName: 'Central Hyrule', inGameIndex: 0x000c, subtitle: 'Chris Houlihan Room', tags: ['world:light', 'env:underground', 'type:special', 'area:central_hyrule', 'role:treasure'] },
];
