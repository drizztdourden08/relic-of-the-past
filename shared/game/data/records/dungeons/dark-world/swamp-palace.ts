/* @layer shared-game @kind data */

import type { DungeonRecord } from '@shared/game/data/types';

const DW_SWAMP_PALACE_DUNGEON: DungeonRecord[] = [
  {
    id: 'dungeon-007',
    gameId: { palaceIndex: 10, bossRoomId: 6 },
    name: 'Swamp Palace',
    fileStem: 'swamp-palace',
    items: {
      bigKey: 'item-092',
      smallKey: 'item-100',
      smallKeyCount: 6,
      map: 'item-142',
      compass: 'item-155',
    },
    bossCheckId: 'check-166',
    prizeCheckId: 'check-167',
    bossActorId: 'actor-142',
    roomScreenIds: [
                     'screen-319',
                     'screen-329',
                     'screen-339',
                     'screen-340',
                     'screen-341',
                     'screen-346',
                     'screen-347',
                     'screen-348',
                     'screen-349',
                     'screen-350',
                     'screen-360',
                     'screen-368',
                     'screen-381',
                     'screen-389',
                   ],
    regionIds: [
      'region-180', 'region-181', 'region-182', 'region-184', 'region-183', 'region-185',
    ],
  },
];

export { DW_SWAMP_PALACE_DUNGEON };
