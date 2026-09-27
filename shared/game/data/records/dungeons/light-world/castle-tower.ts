/* @layer shared-game @kind data */

import type { DungeonRecord } from '@shared/game/data/types';

const LW_CASTLE_TOWER_DUNGEON: DungeonRecord[] = [
  {
    id: 'dungeon-002',
    gameId: { palaceIndex: 8, bossRoomId: 32 },
    name: 'Castle Tower',
    fileStem: 'castle-tower',
    items: {
      bigKey: null,
      smallKey: 'item-099',
      smallKeyCount: 4,
      map: null,
      compass: null,
    },
    // The ledger's "Agahnim 1 beaten" event: the fight grants no item.
    bossCheckId: 'check-329',
    bossActorId: 'actor-140',
    roomScreenIds: ['screen-106', 'screen-110', 'screen-114', 'screen-146', 'screen-150', 'screen-153', 'screen-157'],
    regionIds: ['region-175', 'region-176'],
  },
];

export { LW_CASTLE_TOWER_DUNGEON };
