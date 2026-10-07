/* @layer shared-game @kind data */

import type { ItemRecord } from '@shared/game/data/types';

const LW_CASTLE_TOWER_DUNGEON_ITEMS: ItemRecord[] = [
  {
    id: 'item-137',
    origin: 'randomizer',
    category: 'junk',
    name: 'Map (Agahnims Tower)',
    spriteId: 'sprite-receipt-dungeon-map',
    dungeonId: 'dungeon-002',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId null -> 51: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'item-150',
    origin: 'randomizer',
    category: 'junk',
    name: 'Compass (Agahnims Tower)',
    spriteId: 'sprite-receipt-compass',
    dungeonId: 'dungeon-002',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId null -> 37: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'item-099',
    gameId: { receiveItemId: 164 },
    origin: 'vanilla',
    category: 'key',
    name: 'Small Key (Agahnims Tower)',
    spriteId: 'sprite-receipt-small-key',
    dungeonId: 'dungeon-002',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId 164 -> 36: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
];

export { LW_CASTLE_TOWER_DUNGEON_ITEMS };
