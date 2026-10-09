/* @layer shared-game @kind data */

import type { ItemRecord } from '../../types';

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
