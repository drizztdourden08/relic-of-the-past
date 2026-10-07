/* @layer shared-game @kind data */

import type { DungeonRecord } from '@shared/game/data/types';

const DW_SKULL_WOODS_DUNGEON: DungeonRecord[] = [
  {
    id: 'dungeon-008',
    gameId: { palaceIndex: 16, bossRoomId: 41 },
    name: 'Skull Woods',
    fileStem: 'skull-woods',
    items: {
      bigKey: 'item-089',
      smallKey: 'item-103',
      smallKeyCount: 5,
      map: 'item-143',
      compass: 'item-156',
    },
    bossCheckId: 'check-191',
    prizeCheckId: 'check-192',
    bossActorId: 'actor-141',
    roomScreenIds: [
                     'screen-342',
                     'screen-351',
                     'screen-361',
                     'screen-369',
                     'screen-370',
                     'screen-371',
                     'screen-372',
                     'screen-382',
                     'screen-383',
                   ],
    regionIds: [
      'region-195', 'region-189', 'region-194', 'region-193', 'region-196', 'region-190',
      'region-191', 'region-192',
    ],
  },
];

export { DW_SKULL_WOODS_DUNGEON };
