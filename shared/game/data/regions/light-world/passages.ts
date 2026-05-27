import type { RegionDefinition } from '../../types';

export const LW_PASSAGES: RegionDefinition[] = [
  { id: 'hyrule-castle-secret-passage', name: 'Secret Passage', type: 'cave', displayName: 'Hyrule Castle', inGameIndex: 0x55, subtitle: 'Secret Passage', tags: ['world:light', 'env:underground', 'type:passage', 'area:hyrule_castle', 'role:connector'] },
  { id: 'hyrule-castle-secret-entrance', name: 'Hyrule Castle Secret Entrance', type: 'cave', displayName: 'Hyrule Castle', inGameIndex: 0x0126, subtitle: 'Secret Entrance', tags: ['world:light', 'env:underground', 'type:passage', 'area:hyrule_castle', 'role:connector'] },
  { id: 'old-man-cave', name: 'Old Man Cave', type: 'cave', displayName: 'Death Mountain', inGameIndex: 0x00f0, subtitle: 'Old Man Cave', tags: ['world:light', 'env:underground', 'type:passage', 'area:death_mountain', 'role:connector'] },
  { id: 'spectacle-rock-cave-bottom', name: 'Spectacle Rock Cave (Bottom)', type: 'cave', displayName: 'Death Mountain', inGameIndex: 0x00e3, subtitle: 'Spectacle Rock (Bottom)', tags: ['world:light', 'env:underground', 'type:passage', 'area:death_mountain', 'role:connector'] },
  { id: 'spectacle-rock-cave-peak', name: 'Spectacle Rock Cave (Peak)', type: 'cave', displayName: 'Death Mountain', inGameIndex: 0x00e2, subtitle: 'Spectacle Rock (Peak)', tags: ['world:light', 'env:underground', 'type:passage', 'area:death_mountain', 'role:connector'] },
  { id: 'death-mountain-return-cave', name: 'Death Mountain Return Cave', type: 'cave', displayName: 'Death Mountain', inGameIndex: 0x00f2, subtitle: 'Return Cave', tags: ['world:light', 'env:underground', 'type:passage', 'area:death_mountain', 'role:connector'] },
  { id: 'spiral-cave-bottom', name: 'Spiral Cave (Bottom)', type: 'cave', displayName: 'Death Mountain', inGameIndex: 0x00fb, subtitle: 'Spiral Cave (Bottom)', tags: ['world:light', 'env:underground', 'type:passage', 'area:death_mountain', 'role:connector'] },
  { id: 'fairy-ascension-cave-bottom', name: 'Fairy Ascension Cave (Bottom)', type: 'cave', displayName: 'Death Mountain', inGameIndex: 0x00f8, subtitle: 'Fairy Ascension Cave', tags: ['world:light', 'env:underground', 'type:passage', 'area:death_mountain', 'role:connector'] },
  { id: 'fairy-ascension-cave-drop', name: 'Fairy Ascension Cave (Drop)', type: 'cave', displayName: 'Death Mountain', inGameIndex: 0x00f8, subtitle: 'Fairy Ascension (Drop)', tags: ['world:light', 'env:underground', 'type:passage', 'area:death_mountain', 'role:drop_zone'] },
  { id: 'fairy-ascension-cave-top', name: 'Fairy Ascension Cave (Top)', type: 'cave', displayName: 'Death Mountain', inGameIndex: 0x00e8, subtitle: 'Fairy Ascension (Top)', tags: ['world:light', 'env:underground', 'type:passage', 'area:death_mountain', 'role:connector'] },
];
