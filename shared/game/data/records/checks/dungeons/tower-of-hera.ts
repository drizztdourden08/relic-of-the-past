/* @layer shared-game @kind data */
/** Package T split checks/{dungeons,light-world,dark-world}.ts further by locality. */
import type { CheckRecord } from '@shared/game/data/types';
import { canKillMostThings, hasFireSource } from '@shared/game/data/requirements/helpers';

const DUNGEON_TOWER_OF_HERA_CHECKS: CheckRecord[] = [
  {
    id: 'check-135',
    gameId: { roomId: 135, chestIndex: 1 },
    kind: 'chest',
    screenId: 'screen-139',
    dungeonId: 'dungeon-005',
    randomizerName: 'Basement Cage',
    vanillaItemIds: ['item-037'],
    tags: ['tag-083'],
  },
  {
    id: 'check-136',
    gameId: { roomId: 119, chestIndex: 0 },
    kind: 'chest',
    screenId: 'screen-132',
    dungeonId: 'dungeon-005',
    randomizerName: 'Map Chest',
    vanillaItemIds: ['item-052'],
    tags: ['tag-085'],
  },
  {
    id: 'check-137',
    gameId: { roomId: 135, chestIndex: 0 },
    kind: 'chest',
    screenId: 'screen-139',
    dungeonId: 'dungeon-005',
    randomizerName: 'Big Key Chest',
    vanillaItemIds: ['item-051'],
    requirements: hasFireSource,
    tags: ['tag-084'],
  },
  {
    id: 'check-138',
    gameId: { roomId: 39, chestIndex: 0 },
    kind: 'chest',
    screenId: 'screen-109',
    dungeonId: 'dungeon-005',
    randomizerName: 'Compass Chest',
    vanillaItemIds: ['item-038'],
    tags: ['tag-085'],
  },
  {
    id: 'check-139',
    gameId: { roomId: 39, chestIndex: 1 },
    kind: 'chest',
    screenId: 'screen-109',
    dungeonId: 'dungeon-005',
    randomizerName: 'Big Chest',
    vanillaItemIds: ['item-032'],
    requirements: { itemId: 'item-087' },
  },
  {
    id: 'check-140',
    gameId: { roomId: 7, mask: 2048 },
    kind: 'boss',
    screenId: 'screen-101',
    dungeonId: 'dungeon-005',
    randomizerName: 'Boss',
    vanillaItemIds: ['item-039'],
    requirements: canKillMostThings,
    tags: ['tag-086'],
  },
  {
    id: 'check-141',
    gameId: { roomId: 7, mask: 2048 },
    kind: 'prize',
    screenId: 'screen-101',
    dungeonId: 'dungeon-005',
    randomizerName: 'Prize',
    vanillaItemIds: ['item-058'],
    requirements: canKillMostThings,
    tags: ['tag-086'],
  },
];

export { DUNGEON_TOWER_OF_HERA_CHECKS };
