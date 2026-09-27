/* @layer shared-game @kind data */

import type { ItemRecord } from '@shared/game/data/types';

const DW_PALACE_OF_DARKNESS_DUNGEON_ITEMS: ItemRecord[] = [
  {
    id: 'item-141',
    origin: 'randomizer',
    category: 'junk',
    name: 'Map (Palace of Darkness)',
    spriteId: 'sprite-receipt-dungeon-map',
    dungeonId: 'dungeon-006',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId null -> 51: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'item-154',
    origin: 'randomizer',
    category: 'junk',
    name: 'Compass (Palace of Darkness)',
    spriteId: 'sprite-receipt-compass',
    dungeonId: 'dungeon-006',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId null -> 37: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'item-101',
    gameId: { receiveItemId: 166 },
    origin: 'vanilla',
    category: 'key',
    name: 'Small Key (Palace of Darkness)',
    spriteId: 'sprite-receipt-small-key',
    dungeonId: 'dungeon-006',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId 166 -> 36: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'item-091',
    gameId: { receiveItemId: 153 },
    origin: 'vanilla',
    category: 'key',
    name: 'Big Key (Palace of Darkness)',
    spriteId: 'sprite-receipt-big-key',
    dungeonId: 'dungeon-006',
  },
];

export { DW_PALACE_OF_DARKNESS_DUNGEON_ITEMS };
