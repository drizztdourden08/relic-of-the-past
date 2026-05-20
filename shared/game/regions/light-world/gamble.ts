import type { RegionDefinition } from '../../types';

export const LW_GAMBLE: RegionDefinition[] = [
  { id: 'kakariko-gamble-game', name: 'Kakariko Gamble Game', type: 'cave', displayName: 'Kakariko Village', inGameIndex: 0x011b, subtitle: 'Gambling House', tags: ['world:light', 'env:inside', 'type:gamble', 'area:kakariko'] },
  { id: 'lost-woods-gamble', name: 'Lost Woods Gamble', type: 'cave', displayName: 'Lost Woods', inGameIndex: 0x010c, subtitle: 'Gambling House', tags: ['world:light', 'env:underground', 'type:gamble', 'area:lost_woods'] },
];
