/* @layer shared-game @kind data */
/**
 * The universal small key: the one key record that belongs to no dungeon, so it files by
 * what it is. Every dungeon's own small and big key sits with that dungeon.
 */

import type { ItemRecord } from '@shared/game/data/types';

const KEYS_ITEMS: ItemRecord[] = [
  {
    id: 'item-163',
    origin: 'randomizer',
    category: 'key',
    name: 'Small Key (Universal)',
    spriteId: 'sprite-receipt-small-key',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.receiveItemId null -> 36: native tables are 76 entries; chest path bails on sign8',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
];

export { KEYS_ITEMS };
