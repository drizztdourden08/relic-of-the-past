/* @layer shared-game @kind data */

import type { ItemRecord } from '@shared/game/data/types';

const DW_MISERY_MIRE_DUNGEON_ITEMS: ItemRecord[] = [
  {
    id: 'item-146',
    origin: 'randomizer',
    category: 'junk',
    name: 'Map (Misery Mire)',
    spriteId: 'sprite-receipt-dungeon-map',
    dungeonId: 'dungeon-011',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId null -> 51: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'item-159',
    origin: 'randomizer',
    category: 'junk',
    name: 'Compass (Misery Mire)',
    spriteId: 'sprite-receipt-compass',
    dungeonId: 'dungeon-011',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId null -> 37: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'item-102',
    gameId: { receiveItemId: 167 },
    origin: 'vanilla',
    category: 'key',
    name: 'Small Key (Misery Mire)',
    spriteId: 'sprite-receipt-small-key',
    dungeonId: 'dungeon-011',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId 167 -> 36: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'item-090',
    gameId: { receiveItemId: 152 },
    origin: 'vanilla',
    category: 'key',
    name: 'Big Key (Misery Mire)',
    spriteId: 'sprite-receipt-big-key',
    dungeonId: 'dungeon-011',
  },
];

export { DW_MISERY_MIRE_DUNGEON_ITEMS };
