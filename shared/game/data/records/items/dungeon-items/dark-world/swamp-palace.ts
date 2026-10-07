/* @layer shared-game @kind data */

import type { ItemRecord } from '@shared/game/data/types';

const DW_SWAMP_PALACE_DUNGEON_ITEMS: ItemRecord[] = [
  {
    id: 'item-142',
    origin: 'randomizer',
    category: 'junk',
    name: 'Map (Swamp Palace)',
    spriteId: 'sprite-receipt-dungeon-map',
    dungeonId: 'dungeon-007',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId null -> 51: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'item-155',
    origin: 'randomizer',
    category: 'junk',
    name: 'Compass (Swamp Palace)',
    spriteId: 'sprite-receipt-compass',
    dungeonId: 'dungeon-007',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId null -> 37: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'item-100',
    gameId: { receiveItemId: 165 },
    origin: 'vanilla',
    category: 'key',
    name: 'Small Key (Swamp Palace)',
    spriteId: 'sprite-receipt-small-key',
    dungeonId: 'dungeon-007',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId 165 -> 36: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'item-092',
    gameId: { receiveItemId: 154 },
    origin: 'vanilla',
    category: 'key',
    name: 'Big Key (Swamp Palace)',
    spriteId: 'sprite-receipt-big-key',
    dungeonId: 'dungeon-007',
  },
];

export { DW_SWAMP_PALACE_DUNGEON_ITEMS };
