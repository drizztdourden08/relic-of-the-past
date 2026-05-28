import type { RegionDefinition } from '../../types';

export const LW_WELLS: RegionDefinition[] = [
  { id: 'kakariko-well-top', name: 'Kakariko Well (top)', type: 'cave', indoor: true, displayName: 'Kakariko Village', inGameIndex: 0x011f, subtitle: 'Well (Drop)', tags: ['world:light', 'env:underground', 'type:well', 'area:kakariko', 'role:drop_zone'] },
  { id: 'kakariko-well-bottom', name: 'Kakariko Well (bottom)', type: 'cave', indoor: true, displayName: 'Kakariko Village', inGameIndex: 0x0123, subtitle: 'Well', tags: ['world:light', 'env:underground', 'type:well', 'area:kakariko', 'role:treasure'] },
];
