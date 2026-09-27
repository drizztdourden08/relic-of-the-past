/* @layer shared-game @kind data */

import type { ItemRecord } from '@shared/game/data/types';

const DW_GANONS_TOWER_DUNGEON_ITEMS: ItemRecord[] = [
  {
    id: 'item-148',
    origin: 'randomizer',
    category: 'junk',
    name: 'Map (Ganons Tower)',
    spriteId: 'sprite-receipt-dungeon-map',
    dungeonId: 'dungeon-013',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId null -> 51: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'item-161',
    origin: 'randomizer',
    category: 'junk',
    name: 'Compass (Ganons Tower)',
    spriteId: 'sprite-receipt-compass',
    dungeonId: 'dungeon-013',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId null -> 37: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'item-108',
    gameId: { receiveItemId: 173 },
    origin: 'vanilla',
    category: 'key',
    name: 'Small Key (Ganons Tower)',
    spriteId: 'sprite-receipt-small-key',
    dungeonId: 'dungeon-013',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId 173 -> 36: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'item-084',
    gameId: { receiveItemId: 146 },
    origin: 'vanilla',
    category: 'key',
    name: 'Big Key (Ganons Tower)',
    spriteId: 'sprite-receipt-big-key',
    dungeonId: 'dungeon-013',
  },
];

export { DW_GANONS_TOWER_DUNGEON_ITEMS };
