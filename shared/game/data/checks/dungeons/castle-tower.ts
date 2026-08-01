/* @layer shared-game @kind data */
/** Further split by locality out of checks/{dungeons,light-world,dark-world}.ts — Package T. */
import type { CheckRecord } from '../../types';

const DUNGEON_CASTLE_TOWER_CHECKS: CheckRecord[] = [
  {
    id: 'check-098',
    gameId: { roomId: 32, mask: 2048 },
    kind: 'boss',
    screenId: 'screen-106',
    dungeonId: 'dungeon-002',
    randomizerName: 'Agahnim 1',
    vanillaItemIds: [],
  },
  {
    id: 'check-112',
    gameId: { roomId: 224, chestIndex: 0 },
    kind: 'chest',
    screenId: 'screen-157',
    dungeonId: 'dungeon-002',
    randomizerName: 'Room 03',
    vanillaItemIds: ['item-053'],
  },
  {
    id: 'check-113',
    gameId: { roomId: 64, chestIndex: 0 },
    kind: 'chest',
    screenId: 'screen-114',
    dungeonId: 'dungeon-002',
    randomizerName: 'Dark Maze',
    vanillaItemIds: ['item-053'],
  },
  {
    id: 'check-114',
    gameId: { roomId: 176, mask: 1024 },
    kind: 'keyDrop',
    screenId: 'screen-146',
    dungeonId: 'dungeon-002',
    randomizerName: 'Dark Archer Key Drop',
    vanillaItemIds: ['item-099'],
  },
  {
    id: 'check-115',
    gameId: { roomId: 192, mask: 1024 },
    kind: 'keyDrop',
    screenId: 'screen-150',
    dungeonId: 'dungeon-002',
    randomizerName: 'Circle of Pots Key Drop',
    vanillaItemIds: ['item-099'],
  },
];

export { DUNGEON_CASTLE_TOWER_CHECKS };
