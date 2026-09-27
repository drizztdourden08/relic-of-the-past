/* @layer shared-game @kind data */

import type { DungeonRecord } from '@shared/game/data/types';

const DW_ICE_PALACE_DUNGEON: DungeonRecord[] = [
  {
    id: 'dungeon-010',
    gameId: { palaceIndex: 18, bossRoomId: 222 },
    name: 'Ice Palace',
    fileStem: 'ice-palace',
    items: {
      bigKey: 'item-088',
      smallKey: 'item-104',
      smallKeyCount: 6,
      map: 'item-145',
      compass: 'item-158',
    },
    bossCheckId: 'check-202',
    prizeCheckId: 'check-203',
    bossActorId: 'actor-144',
    roomScreenIds: [
                     'screen-325',
                     'screen-335',
                     'screen-336',
                     'screen-345',
                     'screen-356',
                     'screen-357',
                     'screen-366',
                     'screen-367',
                     'screen-377',
                     'screen-378',
                     'screen-388',
                     'screen-393',
                     'screen-394',
                     'screen-398',
                     'screen-410',
                     'screen-411',
                     'screen-421',
                     'screen-422',
                     'screen-432',
                     'screen-433',
                     'screen-443',
                     'screen-450',
                   ],
    regionIds: [
      'region-197', 'region-198', 'region-199', 'region-200', 'region-201', 'region-202',
    ],
  },
];

export { DW_ICE_PALACE_DUNGEON };
