/* @layer shared-game @kind data */

import type { DungeonRecord } from '@shared/game/data/types';

const LW_EASTERN_PALACE_DUNGEON: DungeonRecord[] = [
  {
    id: 'dungeon-003',
    gameId: { palaceIndex: 4, bossRoomId: 200 },
    name: 'Eastern Palace',
    fileStem: 'eastern-palace',
    items: {
      bigKey: 'item-094',
      smallKey: 'item-097',
      smallKeyCount: 2,
      map: 'item-138',
      compass: 'item-151',
    },
    bossCheckId: 'check-121',
    prizeCheckId: 'check-122',
    bossActorId: 'actor-138',
    roomScreenIds: [
                     'screen-140',
                     'screen-141',
                     'screen-143',
                     'screen-144',
                     'screen-145',
                     'screen-147',
                     'screen-148',
                     'screen-149',
                     'screen-151',
                     'screen-152',
                     'screen-154',
                     'screen-155',
                     'screen-156',
                   ],
    regionIds: ['region-168'],
  },
];

export { LW_EASTERN_PALACE_DUNGEON };
