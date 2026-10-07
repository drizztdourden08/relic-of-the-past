/* @layer shared-game @kind data */

import type { ItemRecord } from '@shared/game/data/types';

const LW_HYRULE_CASTLE_DUNGEON_ITEMS: ItemRecord[] = [
  {
    id: 'item-136',
    origin: 'randomizer',
    category: 'junk',
    name: 'Map (Hyrule Castle)',
    spriteId: 'sprite-receipt-dungeon-map',
    dungeonId: 'dungeon-001',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId null -> 51: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'item-149',
    origin: 'randomizer',
    category: 'junk',
    name: 'Compass (Hyrule Castle)',
    spriteId: 'sprite-receipt-compass',
    dungeonId: 'dungeon-001',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId null -> 37: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'item-096',
    gameId: { receiveItemId: 160 },
    origin: 'vanilla',
    category: 'key',
    name: 'Small Key (Hyrule Castle)',
    spriteId: 'sprite-receipt-small-key',
    dungeonId: 'dungeon-001',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId 160 -> 36: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'item-095',
    gameId: { receiveItemId: 159 },
    origin: 'vanilla',
    category: 'key',
    name: 'Big Key (Hyrule Castle)',
    spriteId: 'sprite-receipt-big-key',
    dungeonId: 'dungeon-001',
  },
];

export { LW_HYRULE_CASTLE_DUNGEON_ITEMS };
