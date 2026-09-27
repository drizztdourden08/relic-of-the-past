/* @layer shared-game @kind data */

import type { ItemRecord } from '@shared/game/data/types';

const DW_SKULL_WOODS_DUNGEON_ITEMS: ItemRecord[] = [
  {
    id: 'item-143',
    origin: 'randomizer',
    category: 'junk',
    name: 'Map (Skull Woods)',
    spriteId: 'sprite-receipt-dungeon-map',
    dungeonId: 'dungeon-008',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId null -> 51: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'item-156',
    origin: 'randomizer',
    category: 'junk',
    name: 'Compass (Skull Woods)',
    spriteId: 'sprite-receipt-compass',
    dungeonId: 'dungeon-008',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId null -> 37: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'item-103',
    gameId: { receiveItemId: 168 },
    origin: 'vanilla',
    category: 'key',
    name: 'Small Key (Skull Woods)',
    spriteId: 'sprite-receipt-small-key',
    dungeonId: 'dungeon-008',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId 168 -> 36: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'item-089',
    gameId: { receiveItemId: 151 },
    origin: 'vanilla',
    category: 'key',
    name: 'Big Key (Skull Woods)',
    spriteId: 'sprite-receipt-big-key',
    dungeonId: 'dungeon-008',
  },
];

export { DW_SKULL_WOODS_DUNGEON_ITEMS };
