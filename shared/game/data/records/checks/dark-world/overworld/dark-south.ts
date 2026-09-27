/* @layer shared-game @kind data */

import type { CheckRecord } from '@shared/game/data/types';

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
    // The bit above is a seed's own; the game keeps none for this gift. A plain file answers from the
    // Shovel held, or from the flute that later takes its place.
    actorId: 'actor-007',
    visualNote: 'Changes to tree stump form (gfx 3)',
    sourceFunc: 'Sprite_FluteKid_Stumpy',
    fallback: { anyOf: [{ itemId: 'item-020' }, { itemId: 'item-021' }, { itemId: 'item-075' }] },
  },
  // The bomb counter's one refill, sold from its own sprite instead of a shelf. Its room
  // names it on its own, so the seam matches anything for the other two fields. Subtype 2 in
  // the same room is the story bomb, which starts a follower instead of handing an item over
  // and is deliberately not a slot.
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
