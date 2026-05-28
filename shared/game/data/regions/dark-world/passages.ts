import type { RegionDefinition } from '../../types';

export const DW_PASSAGES: RegionDefinition[] = [
  { id: 'superbunny-cave-top', name: 'Superbunny Cave (Top)', type: 'cave', indoor: true, displayName: 'Dark Death Mountain', inGameIndex: 0x00fd, subtitle: 'Superbunny Cave (Top)', tags: ['world:dark', 'env:underground', 'type:passage', 'area:dark_death_mountain', 'role:connector'] },
  { id: 'superbunny-cave-bottom', name: 'Superbunny Cave (Bottom)', type: 'cave', indoor: true, displayName: 'Dark Death Mountain', inGameIndex: 0x00ed, subtitle: 'Superbunny Cave (Bottom)', tags: ['world:dark', 'env:underground', 'type:passage', 'area:dark_death_mountain', 'role:connector', 'role:treasure'] },
];
