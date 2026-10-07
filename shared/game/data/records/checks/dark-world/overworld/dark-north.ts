/* @layer shared-game @kind data */

import type { CheckRecord } from '@shared/game/data/types';

const DW_OVERWORLD_DARK_NORTH_CHECKS: CheckRecord[] = [
  {
    id: 'check-266',
    gameId: {
      bufferIndex: 22, mask: 32, flagType: 2, flagMask: 0, itemId: 3, spriteType: 114, postGfx: 0, room: 278,
    },
    kind: 'pond-slot',
    screenId: 'screen-484',
    regionId: 'region-147',
    name: 'Pyramid Fairy 1',
    vanillaItemIds: ['item-004'],
    scope: 'npc',
    pond: { pondId: 'cursed', rung: 1 },
    // The game keeps no flag for this gift: a plain file answers from the item held. A seed's own bit is above.
    sourceFunc: 'Sprite_WishPond3',
    fallback: { itemId: 'item-004' },
    review: {
      status: 'accepted',
      source: 'person',
      note: 'record absent -> created (npc, room 278, itemId 3, vanilla item-004): Sprite_WishPond3 grant: sprite_main.c:1264-1268 item_receipt_method=2 + Link_ReceiveItem(sprite_graphics[k]); upgrade ids chosen at sprite_main.c:1210-1241 (light pond: 0x0C->0x2A boomerang, 0x04->0x05 shield; dark pond: 0x02->0x03 blade, 0x3A->0x3B bow); pond rooms: EntranceShuffle.py \'Waterfall of Wishing\' room 0x0114, \'Pyramid Fairy\' room 0x0116, confirmed by ROM entrance table + sprite 0x72 in both rooms; completion via substitution bits byte 1 masks 0x08/0x10/0x20/0x40 (npc_overrides.c allocation), progress buffer [22]',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'check-267',
    gameId: {
      bufferIndex: 22, mask: 64, flagType: 2, flagMask: 0, itemId: 59, spriteType: 114, postGfx: 0, room: 278,
    },
    kind: 'pond-slot',
    screenId: 'screen-484',
    regionId: 'region-147',
    name: 'Pyramid Fairy 2',
    vanillaItemIds: ['item-060'],
    scope: 'npc',
    pond: { pondId: 'cursed', rung: 2 },
    // The game keeps no flag for this gift: a plain file answers from the item held. A seed's own bit is above.
    sourceFunc: 'Sprite_WishPond3',
    fallback: { anyOf: [{ itemId: 'item-060' }, { itemId: 'item-078' }] },
    review: {
      status: 'accepted',
      source: 'person',
      note: 'record absent -> created (npc, room 278, itemId 59, vanilla item-060): Sprite_WishPond3 grant: sprite_main.c:1264-1268 item_receipt_method=2 + Link_ReceiveItem(sprite_graphics[k]); upgrade ids chosen at sprite_main.c:1210-1241 (light pond: 0x0C->0x2A boomerang, 0x04->0x05 shield; dark pond: 0x02->0x03 blade, 0x3A->0x3B bow); pond rooms: EntranceShuffle.py \'Waterfall of Wishing\' room 0x0114, \'Pyramid Fairy\' room 0x0116, confirmed by ROM entrance table + sprite 0x72 in both rooms; completion via substitution bits byte 1 masks 0x08/0x10/0x20/0x40 (npc_overrides.c allocation), progress buffer [22]',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'check-076',
    gameId: { owScreen: 91, mask: 64 },
    kind: 'standing',
    screenId: 'screen-280',
    regionId: 'region-034',
    name: 'Pyramid',
    vanillaItemIds: ['item-024'],
    scope: 'world-item',
  },
];

export { DW_OVERWORLD_DARK_NORTH_CHECKS };
