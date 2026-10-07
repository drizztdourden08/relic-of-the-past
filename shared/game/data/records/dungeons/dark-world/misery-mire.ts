/* @layer shared-game @kind data */

import type { DungeonRecord } from '@shared/game/data/types';

const DW_MISERY_MIRE_DUNGEON: DungeonRecord[] = [
  {
    id: 'dungeon-011',
    gameId: { palaceIndex: 14, bossRoomId: 144 },
    name: 'Misery Mire',
    fileStem: 'misery-mire',
    items: {
      bigKey: 'item-090',
      smallKey: 'item-102',
      smallKeyCount: 6,
      map: 'item-146',
      compass: 'item-159',
    },
    bossCheckId: 'check-215',
    prizeCheckId: 'check-216',
    bossActorId: 'actor-145',
    medallionGate: 'item-017',
    roomScreenIds: [
                     'screen-399',
                     'screen-400',
                     'screen-401',
                     'screen-402',
                     'screen-405',
                     'screen-406',
                     'screen-412',
                     'screen-413',
                     'screen-414',
                     'screen-415',
                     'screen-423',
                     'screen-424',
                     'screen-425',
                     'screen-434',
                     'screen-435',
                     'screen-436',
                     'screen-444',
                     'screen-445',
                   ],
    regionIds: ['region-203', 'region-204', 'region-205', 'region-206', 'region-207'],
  },
];

export { DW_MISERY_MIRE_DUNGEON };
