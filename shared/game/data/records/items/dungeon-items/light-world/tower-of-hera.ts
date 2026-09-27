/* @layer shared-game @kind data */

import type { ItemRecord } from '@shared/game/data/types';

const LW_TOWER_OF_HERA_DUNGEON_ITEMS: ItemRecord[] = [
  {
    id: 'item-140',
    origin: 'randomizer',
    category: 'junk',
    name: 'Map (Tower of Hera)',
    spriteId: 'sprite-receipt-dungeon-map',
    dungeonId: 'dungeon-005',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId null -> 51: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'item-153',
    origin: 'randomizer',
    category: 'junk',
    name: 'Compass (Tower of Hera)',
    spriteId: 'sprite-receipt-compass',
    dungeonId: 'dungeon-005',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId null -> 37: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'item-105',
    gameId: { receiveItemId: 170 },
    origin: 'vanilla',
    category: 'key',
    name: 'Small Key (Tower of Hera)',
    spriteId: 'sprite-receipt-small-key',
    dungeonId: 'dungeon-005',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId 170 -> 36: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'item-087',
    gameId: { receiveItemId: 149 },
    origin: 'vanilla',
    category: 'key',
    name: 'Big Key (Tower of Hera)',
    spriteId: 'sprite-receipt-big-key',
    dungeonId: 'dungeon-005',
  },
];

export { LW_TOWER_OF_HERA_DUNGEON_ITEMS };
