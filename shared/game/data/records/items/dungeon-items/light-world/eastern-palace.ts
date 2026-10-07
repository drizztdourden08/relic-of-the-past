/* @layer shared-game @kind data */

import type { ItemRecord } from '@shared/game/data/types';

const LW_EASTERN_PALACE_DUNGEON_ITEMS: ItemRecord[] = [
  {
    id: 'item-138',
    origin: 'randomizer',
    category: 'junk',
    name: 'Map (Eastern Palace)',
    spriteId: 'sprite-receipt-dungeon-map',
    dungeonId: 'dungeon-003',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId null -> 51: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'item-151',
    origin: 'randomizer',
    category: 'junk',
    name: 'Compass (Eastern Palace)',
    spriteId: 'sprite-receipt-compass',
    dungeonId: 'dungeon-003',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId null -> 37: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'item-097',
    gameId: { receiveItemId: 162 },
    origin: 'vanilla',
    category: 'key',
    name: 'Small Key (Eastern Palace)',
    spriteId: 'sprite-receipt-small-key',
    dungeonId: 'dungeon-003',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId 162 -> 36: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'item-094',
    gameId: { receiveItemId: 157 },
    origin: 'vanilla',
    category: 'key',
    name: 'Big Key (Eastern Palace)',
    spriteId: 'sprite-receipt-big-key',
    dungeonId: 'dungeon-003',
  },
];

export { LW_EASTERN_PALACE_DUNGEON_ITEMS };
