/* @layer shared-game @kind data */

import type { CheckRecord } from '@shared/game/data/types';

const DW_OVERWORLD_SKULL_WOODS_CHECKS: CheckRecord[] = [
  // The shelf behind the lumberjacks' door, the same room 0x010F the other three dark-world
  // doors open onto; the overworld area is the discriminator (CheckGameId.shopSeam).
  {
    id: 'check-644',
    gameId: { shopSeam: { roomId: 271, entrance: 96, owArea: 66, subtype: 7 } },
    kind: 'shop-slot',
    screenId: 'screen-475',
    regionId: 'region-144',
    name: 'Dark World Lumberjack Shop Left',
    vanillaItemIds: ['item-047'],
    price: 150,
    shop: { shopId: 'dark-world-lumberjack-shop', slot: 18, position: 'Left', seam: 'shelf' },
  },
  {
    id: 'check-645',
    gameId: { shopSeam: { roomId: 271, entrance: 96, owArea: 66, subtype: 8 } },
    kind: 'shop-slot',
    screenId: 'screen-475',
    regionId: 'region-144',
    name: 'Dark World Lumberjack Shop Center',
    vanillaItemIds: ['item-005'],
    price: 50,
    shop: { shopId: 'dark-world-lumberjack-shop', slot: 19, position: 'Center', seam: 'shelf' },
  },
  {
    id: 'check-646',
    gameId: { shopSeam: { roomId: 271, entrance: 96, owArea: 66, subtype: 12 } },
    kind: 'shop-slot',
    screenId: 'screen-475',
    regionId: 'region-144',
    name: 'Dark World Lumberjack Shop Right',
    vanillaItemIds: ['item-050'],
    price: 50,
    shop: { shopId: 'dark-world-lumberjack-shop', slot: 20, position: 'Right', seam: 'shelf' },
  },
];

export { DW_OVERWORLD_SKULL_WOODS_CHECKS };
