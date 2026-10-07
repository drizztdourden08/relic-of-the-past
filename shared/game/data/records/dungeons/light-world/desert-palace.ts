/* @layer shared-game @kind data */

import type { DungeonRecord } from '@shared/game/data/types';

const LW_DESERT_PALACE_DUNGEON: DungeonRecord[] = [
  {
    id: 'dungeon-004',
    gameId: { palaceIndex: 6, bossRoomId: 51 },
    name: 'Desert Palace',
    fileStem: 'desert-palace',
    items: {
      bigKey: 'item-093',
      smallKey: 'item-098',
      smallKeyCount: 4,
      map: 'item-139',
      compass: 'item-152',
    },
    bossCheckId: 'check-130',
    prizeCheckId: 'check-131',
    bossActorId: 'actor-139',
    roomScreenIds: [
                     'screen-113',
                     'screen-117',
                     'screen-121',
                     'screen-125',
                     'screen-129',
                     'screen-130',
                     'screen-131',
                     'screen-136',
                     'screen-137',
                     'screen-138',
                   ],
    regionIds: ['region-167', 'region-165', 'region-164', 'region-166'],
  },
];

export { LW_DESERT_PALACE_DUNGEON };
