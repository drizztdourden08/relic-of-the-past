/* @layer shared-game @kind data */

import type { DungeonRecord } from '@shared/game/data/types';

const DW_TURTLE_ROCK_DUNGEON: DungeonRecord[] = [
  {
    id: 'dungeon-012',
    gameId: { palaceIndex: 24, bossRoomId: 164 },
    name: 'Turtle Rock',
    fileStem: 'turtle-rock',
    items: {
      bigKey: 'item-085',
      smallKey: 'item-107',
      smallKeyCount: 6,
      map: 'item-147',
      compass: 'item-160',
    },
    bossCheckId: 'check-231',
    prizeCheckId: 'check-232',
    // The three-headed boss is three actors; the rock head is the form the fight opens as.
    bossActorId: 'actor-146',
    medallionGate: 'item-018',
    roomScreenIds: [
                     'screen-317',
                     'screen-326',
                     'screen-327',
                     'screen-328',
                     'screen-337',
                     'screen-338',
                     'screen-416',
                     'screen-426',
                     'screen-427',
                     'screen-428',
                     'screen-429',
                     'screen-437',
                     'screen-438',
                     'screen-439',
                     'screen-440',
                     'screen-446',
                     'screen-447',
                   ],
    regionIds: [
      'region-208', 'region-209', 'region-211', 'region-210', 'region-212', 'region-214',
      'region-215', 'region-216', 'region-218', 'region-219',
    ],
  },
];

export { DW_TURTLE_ROCK_DUNGEON };
