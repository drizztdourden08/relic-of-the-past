/* @layer shared-game @kind data */

import type { CheckRecord } from '../../../../types';

const DW_OVERWORLD_DARK_SOUTH_CHECKS: CheckRecord[] = [
  {
    id: 'check-078',
    gameId: {
      bufferIndex: 2,
      mask: 8,
      flagType: 2,
      flagMask: 8,
      itemId: 19,
      spriteType: 46,
      postGfx: 3,
      owWorld: 'dark',
    },
    kind: 'npc',
    screenId: 'screen-259',
    regionId: 'region-037',
    name: 'Stumpy',
    vanillaItemIds: ['item-020'],
    scope: 'npc',
    actorId: 'actor-007',
    visualNote: 'Changes to tree stump form (gfx 3)',
    sourceFunc: 'Sprite_FluteKid_Stumpy',
    fallback: { anyOf: [{ itemId: 'item-020' }, { itemId: 'item-021' }, { itemId: 'item-075' }] },
  },
  {
    id: 'check-656',
    gameId: { shopSeam: { roomId: 284, entrance: 83, owArea: null, subtype: 1 } },
    kind: 'shop-slot',
    screenId: 'screen-466',
    regionId: 'region-136',
    name: 'Big Bomb Shop',
    vanillaItemIds: ['item-050'],
    price: 100,
    shop: { shopId: 'big-bomb-shop', slot: 30, position: 'Single', seam: 'bomb' },
  },
];

export { DW_OVERWORLD_DARK_SOUTH_CHECKS };
