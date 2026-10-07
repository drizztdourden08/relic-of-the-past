/* @layer shared-game @kind data */

import type { DungeonRecord } from '@shared/game/data/types';

const DW_GANONS_TOWER_DUNGEON: DungeonRecord[] = [
  {
    id: 'dungeon-013',
    gameId: { palaceIndex: 26, bossRoomId: 13 },
    name: 'Ganon\'s Tower',
    fileStem: 'ganons-tower',
    items: {
      bigKey: 'item-084',
      smallKey: 'item-108',
      smallKeyCount: 8,
      map: 'item-148',
      compass: 'item-161',
    },
    // The ledger's "Agahnim 2 beaten" event: the fight grants no item.
    bossCheckId: 'check-349',
    // The second tower fight is the same actor as the first, so its defeat rule is the same one.
    bossActorId: 'actor-140',
    roomScreenIds: [
                     'screen-318',
                     'screen-323',
                     'screen-324',
                     'screen-333',
                     'screen-334',
                     'screen-354',
                     'screen-355',
                     'screen-364',
                     'screen-365',
                     'screen-374',
                     'screen-375',
                     'screen-376',
                     'screen-385',
                     'screen-386',
                     'screen-387',
                     'screen-390',
                     'screen-391',
                     'screen-392',
                     'screen-395',
                     'screen-396',
                     'screen-397',
                     'screen-403',
                     'screen-404',
                     'screen-407',
                     'screen-408',
                     'screen-409',
                     'screen-417',
                     'screen-418',
                   ],
    regionIds: [
      'region-228', 'region-229', 'region-230', 'region-231', 'region-232', 'region-233',
      'region-234', 'region-235', 'region-236', 'region-237', 'region-238', 'region-239',
    ],
  },
];

export { DW_GANONS_TOWER_DUNGEON };
