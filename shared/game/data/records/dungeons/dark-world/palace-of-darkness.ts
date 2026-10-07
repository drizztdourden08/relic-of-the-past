/* @layer shared-game @kind data */

import type { DungeonRecord } from '@shared/game/data/types';

const DW_PALACE_OF_DARKNESS_DUNGEON: DungeonRecord[] = [
  {
    id: 'dungeon-006',
    gameId: { palaceIndex: 12, bossRoomId: 90 },
    name: 'Palace of Darkness',
    fileStem: 'palace-of-darkness',
    items: {
      bigKey: 'item-091',
      smallKey: 'item-101',
      smallKeyCount: 6,
      map: 'item-141',
      compass: 'item-154',
    },
    bossCheckId: 'check-155',
    prizeCheckId: 'check-156',
    bossActorId: 'actor-143',
    roomScreenIds: [
                     'screen-320',
                     'screen-321',
                     'screen-322',
                     'screen-330',
                     'screen-331',
                     'screen-332',
                     'screen-343',
                     'screen-344',
                     'screen-352',
                     'screen-353',
                     'screen-362',
                     'screen-363',
                     'screen-373',
                     'screen-384',
                   ],
    regionIds: [
      'region-220', 'region-221', 'region-222', 'region-223', 'region-224', 'region-225',
      'region-226', 'region-227',
    ],
  },
];

export { DW_PALACE_OF_DARKNESS_DUNGEON };
