/* @layer shared-game @kind data */

import type { ItemRecord } from '@shared/game/data/types';

const DW_TURTLE_ROCK_DUNGEON_ITEMS: ItemRecord[] = [
  {
    id: 'item-147',
    origin: 'randomizer',
    category: 'junk',
    name: 'Map (Turtle Rock)',
    spriteId: 'sprite-receipt-dungeon-map',
    dungeonId: 'dungeon-012',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId null -> 51: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'item-160',
    origin: 'randomizer',
    category: 'junk',
    name: 'Compass (Turtle Rock)',
    spriteId: 'sprite-receipt-compass',
    dungeonId: 'dungeon-012',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId null -> 37: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'item-107',
    gameId: { receiveItemId: 172 },
    origin: 'vanilla',
    category: 'key',
    name: 'Small Key (Turtle Rock)',
    spriteId: 'sprite-receipt-small-key',
    dungeonId: 'dungeon-012',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId 172 -> 36: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'item-085',
    gameId: { receiveItemId: 147 },
    origin: 'vanilla',
    category: 'key',
    name: 'Big Key (Turtle Rock)',
    spriteId: 'sprite-receipt-big-key',
    dungeonId: 'dungeon-012',
  },
];

export { DW_TURTLE_ROCK_DUNGEON_ITEMS };
