/* @layer shared-game @kind data */

import type { ItemRecord } from '@shared/game/data/types';

const DW_THIEVES_TOWN_DUNGEON_ITEMS: ItemRecord[] = [
  {
    id: 'item-144',
    origin: 'randomizer',
    category: 'junk',
    name: 'Map (Thieves Town)',
    spriteId: 'sprite-receipt-dungeon-map',
    dungeonId: 'dungeon-009',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId null -> 51: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'item-157',
    origin: 'randomizer',
    category: 'junk',
    name: 'Compass (Thieves Town)',
    spriteId: 'sprite-receipt-compass',
    dungeonId: 'dungeon-009',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId null -> 37: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'item-106',
    gameId: { receiveItemId: 171 },
    origin: 'vanilla',
    category: 'key',
    name: 'Small Key (Thieves Town)',
    spriteId: 'sprite-receipt-small-key',
    dungeonId: 'dungeon-009',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId 171 -> 36: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'item-086',
    gameId: { receiveItemId: 148 },
    origin: 'vanilla',
    category: 'key',
    name: 'Big Key (Thieves Town)',
    spriteId: 'sprite-receipt-big-key',
    dungeonId: 'dungeon-009',
  },
];

export { DW_THIEVES_TOWN_DUNGEON_ITEMS };
