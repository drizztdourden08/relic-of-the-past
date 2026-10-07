/* @layer shared-game @kind data */

import type { ItemRecord } from '@shared/game/data/types';

const DW_ICE_PALACE_DUNGEON_ITEMS: ItemRecord[] = [
  {
    id: 'item-145',
    origin: 'randomizer',
    category: 'junk',
    name: 'Map (Ice Palace)',
    spriteId: 'sprite-receipt-dungeon-map',
    dungeonId: 'dungeon-010',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId null -> 51: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'item-158',
    origin: 'randomizer',
    category: 'junk',
    name: 'Compass (Ice Palace)',
    spriteId: 'sprite-receipt-compass',
    dungeonId: 'dungeon-010',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId null -> 37: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'item-104',
    gameId: { receiveItemId: 169 },
    origin: 'vanilla',
    category: 'key',
    name: 'Small Key (Ice Palace)',
    spriteId: 'sprite-receipt-small-key',
    dungeonId: 'dungeon-010',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId 169 -> 36: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'item-088',
    gameId: { receiveItemId: 150 },
    origin: 'vanilla',
    category: 'key',
    name: 'Big Key (Ice Palace)',
    spriteId: 'sprite-receipt-big-key',
    dungeonId: 'dungeon-010',
  },
];

export { DW_ICE_PALACE_DUNGEON_ITEMS };
