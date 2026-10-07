/* @layer shared-game @kind data */

import type { ItemRecord } from '@shared/game/data/types';

const LW_DESERT_PALACE_DUNGEON_ITEMS: ItemRecord[] = [
  {
    id: 'item-139',
    origin: 'randomizer',
    category: 'junk',
    name: 'Map (Desert Palace)',
    spriteId: 'sprite-receipt-dungeon-map',
    dungeonId: 'dungeon-004',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId null -> 51: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'item-152',
    origin: 'randomizer',
    category: 'junk',
    name: 'Compass (Desert Palace)',
    spriteId: 'sprite-receipt-compass',
    dungeonId: 'dungeon-004',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId null -> 37: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'item-098',
    gameId: { receiveItemId: 163 },
    origin: 'vanilla',
    category: 'key',
    name: 'Small Key (Desert Palace)',
    spriteId: 'sprite-receipt-small-key',
    dungeonId: 'dungeon-004',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId 163 -> 36: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'item-093',
    gameId: { receiveItemId: 156 },
    origin: 'vanilla',
    category: 'key',
    name: 'Big Key (Desert Palace)',
    spriteId: 'sprite-receipt-big-key',
    dungeonId: 'dungeon-004',
  },
];

export { LW_DESERT_PALACE_DUNGEON_ITEMS };
