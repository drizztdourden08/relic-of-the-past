/* @layer shared-game @kind data */
/** Dungeon items, part 2 of 3 (size split); see dungeon-items-1.ts for context. */
import type { ItemRecord } from '../types';

const DUNGEON_ITEMS_2: ItemRecord[] = [
  {
    id: 'item-086',
    gameId: { receiveItemId: 148 },
    origin: 'vanilla',
    category: 'key',
    randomizerName: 'Big Key (Thieves Town)',
  },
  {
    id: 'item-089',
    gameId: { receiveItemId: 151 },
    origin: 'vanilla',
    category: 'key',
    randomizerName: 'Big Key (Skull Woods)',
  },
  {
    id: 'item-092',
    gameId: { receiveItemId: 154 },
    origin: 'vanilla',
    category: 'key',
    randomizerName: 'Big Key (Swamp Palace)',
  },
  {
    id: 'item-088',
    gameId: { receiveItemId: 150 },
    origin: 'vanilla',
    category: 'key',
    randomizerName: 'Big Key (Ice Palace)',
  },
  {
    id: 'item-090',
    gameId: { receiveItemId: 152 },
    origin: 'vanilla',
    category: 'key',
    randomizerName: 'Big Key (Misery Mire)',
  },
  {
    id: 'item-085',
    gameId: { receiveItemId: 147 },
    origin: 'vanilla',
    category: 'key',
    randomizerName: 'Big Key (Turtle Rock)',
  },
  {
    id: 'item-084',
    gameId: { receiveItemId: 146 },
    origin: 'vanilla',
    category: 'key',
    randomizerName: 'Big Key (Ganons Tower)',
  },
  {
    id: 'item-136',
    origin: 'randomizer',
    category: 'junk',
    randomizerName: 'Map (Hyrule Castle)',
    dungeonId: 'dungeon-001',
  },
  {
    id: 'item-137',
    origin: 'randomizer',
    category: 'junk',
    randomizerName: 'Map (Agahnims Tower)',
    dungeonId: 'dungeon-002',
  },
  {
    id: 'item-138',
    origin: 'randomizer',
    category: 'junk',
    randomizerName: 'Map (Eastern Palace)',
    dungeonId: 'dungeon-003',
  },
  {
    id: 'item-139',
    origin: 'randomizer',
    category: 'junk',
    randomizerName: 'Map (Desert Palace)',
    dungeonId: 'dungeon-004',
  },
  {
    id: 'item-140',
    origin: 'randomizer',
    category: 'junk',
    randomizerName: 'Map (Tower of Hera)',
    dungeonId: 'dungeon-005',
  },
  {
    id: 'item-141',
    origin: 'randomizer',
    category: 'junk',
    randomizerName: 'Map (Palace of Darkness)',
    dungeonId: 'dungeon-006',
  },
  {
    id: 'item-142',
    origin: 'randomizer',
    category: 'junk',
    randomizerName: 'Map (Swamp Palace)',
    dungeonId: 'dungeon-007',
  },
  {
    id: 'item-143',
    origin: 'randomizer',
    category: 'junk',
    randomizerName: 'Map (Skull Woods)',
    dungeonId: 'dungeon-008',
  },
  {
    id: 'item-144',
    origin: 'randomizer',
    category: 'junk',
    randomizerName: 'Map (Thieves Town)',
    dungeonId: 'dungeon-009',
  },
  {
    id: 'item-145',
    origin: 'randomizer',
    category: 'junk',
    randomizerName: 'Map (Ice Palace)',
    dungeonId: 'dungeon-010',
  },
  {
    id: 'item-146',
    origin: 'randomizer',
    category: 'junk',
    randomizerName: 'Map (Misery Mire)',
    dungeonId: 'dungeon-011',
  },
];

export { DUNGEON_ITEMS_2 };
