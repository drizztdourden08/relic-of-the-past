/* @layer shared-game @kind data */

import type { DungeonRecord } from '@shared/game/data/types';

const LW_TOWER_OF_HERA_DUNGEON: DungeonRecord[] = [
  {
    id: 'dungeon-005',
    gameId: { palaceIndex: 20, bossRoomId: 7 },
    name: 'Tower of Hera',
    fileStem: 'tower-of-hera',
    items: {
      bigKey: 'item-087',
      smallKey: 'item-105',
      smallKeyCount: 1,
      map: 'item-140',
      compass: 'item-153',
    },
    bossCheckId: 'check-140',
    prizeCheckId: 'check-141',
    bossActorId: 'actor-137',
    roomScreenIds: ['screen-101', 'screen-104', 'screen-109', 'screen-111', 'screen-132', 'screen-139', 'screen-142'],
    regionIds: ['region-177', 'region-178', 'region-179'],
  },
];

export { LW_TOWER_OF_HERA_DUNGEON };
