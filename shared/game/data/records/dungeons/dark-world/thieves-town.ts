/* @layer shared-game @kind data */

import type { DungeonRecord } from '@shared/game/data/types';

const DW_THIEVES_TOWN_DUNGEON: DungeonRecord[] = [
  {
    id: 'dungeon-009',
    gameId: { palaceIndex: 22, bossRoomId: 172 },
    name: 'Thieves\' Town',
    fileStem: 'thieves-town',
    items: {
      bigKey: 'item-086',
      smallKey: 'item-106',
      smallKeyCount: 3,
      map: 'item-144',
      compass: 'item-157',
    },
    bossCheckId: 'check-180',
    prizeCheckId: 'check-181',
    bossActorId: 'actor-149',
    roomScreenIds: [
                     'screen-358',
                     'screen-359',
                     'screen-379',
                     'screen-380',
                     'screen-419',
                     'screen-420',
                     'screen-430',
                     'screen-431',
                     'screen-441',
                     'screen-442',
                     'screen-448',
                     'screen-449',
                   ],
    regionIds: ['region-186', 'region-187', 'region-188'],
  },
];

export { DW_THIEVES_TOWN_DUNGEON };
