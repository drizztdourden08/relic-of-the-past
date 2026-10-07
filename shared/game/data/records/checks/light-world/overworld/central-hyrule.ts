/* @layer shared-game @kind data */

import type { CheckRecord } from '@shared/game/data/types';
import { canLiftHeavyRocks } from '@shared/game/data/requirements/helpers';

const LW_OVERWORLD_CENTRAL_HYRULE_CHECKS: CheckRecord[] = [
  {
    id: 'check-006',
    gameId: { owScreen: 0, mask: 64 },
    kind: 'standing',
    screenId: 'screen-026',
    regionId: 'region-002',
    name: 'Mushroom',
    vanillaItemIds: ['item-042'],
    scope: 'world-item',
    // The game keeps no flag for this pickup: it tests the item itself. So does a plain file's row. The mushroom leaves the inventory at the Witch's, so her powder and her own check answer too.
    // The spot stays empty only while the Witch's powder is held (SpritePrep_Mushroom): until then
    // the mushroom grows back, so the taken row reads 'not now'.
    now: { itemId: 'item-014', owned: true },
    fallback: { anyOf: [{ itemId: 'item-042' }, { itemId: 'item-014' }, { checkId: 'check-056' }] },
  },
  {
    id: 'check-007',
    gameId: { bufferIndex: 2, mask: 2, flagType: 2, flagMask: 2, itemId: 22, spriteType: 117, postGfx: 0 },
    kind: 'npc',
    screenId: 'screen-026',
    regionId: 'region-002',
    name: 'Bottle Merchant',
    vanillaItemIds: ['item-023'],
    scope: 'npc',
    price: 100,
    actorId: 'actor-012',
    visualNote: 'Stays in place (random facing animation)',
    sourceFunc: 'Sprite_BottleVendor',
  },
  {
    id: 'check-008',
    gameId: { owScreen: 42, mask: 64 },
    kind: 'dig',
    screenId: 'screen-026',
    regionId: 'region-002',
    name: 'Flute Spot',
    vanillaItemIds: ['item-021'],
    scope: 'world-item',
    // The game keeps no flag for this pickup: it tests the item itself. So does a plain file's row. Any flute: it is upgraded in place.
    requirements: { itemId: 'item-020' },
    fallback: { anyOf: [{ itemId: 'item-021' }, { itemId: 'item-075' }] },
  },
  {
    id: 'check-009',
    gameId: { owScreen: 59, mask: 64 },
    kind: 'standing',
    screenId: 'screen-026',
    regionId: 'region-002',
    name: 'Sunken Treasure',
    vanillaItemIds: ['item-024'],
    scope: 'world-item',
    requirements: { checkId: 'check-326' },
    review: {
      status: 'accepted',
      source: 'person',
      note: 'kind event -> standing: the row is the standing prize sprite 0xEB at OW area 0x3B (ROM OW sprite census stage1/2); grant crosses Sprite_HeartPiece sprite_main.c:6473-6514 | review needs-work -> accepted: HeartUpgrade_SetObtainedFlag sprite_main.c:6516-6523: outdoors save_ow_event_info[screen] |= 0x40; owScreen 59 mask 64 matches the census sprite at area 0x3B',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'check-010',
    gameId: {
      bufferIndex: 2,
      mask: 16,
      flagType: 2,
      flagMask: 16,
      itemId: 22,
      spriteType: 57,
      postGfx: 0,
      owWorld: 'dark',
    },
    kind: 'npc',
    screenId: 'screen-026',
    regionId: 'region-002',
    name: 'Purple Chest',
    vanillaItemIds: ['item-023'],
    scope: 'npc',
    actorId: 'actor-008',
    presence: { and: [{ not: { followerEq: 9 } }, { progressIndicator3: 16, state: 'clear' }] },
    visualNote: 'Chest disappears (sprite killed)',
    sourceFunc: 'Sprite_39_Locksmith',
    requirements: canLiftHeavyRocks,
  },
  {
    id: 'check-042',
    gameId: { bufferIndex: 2, mask: 1, flagType: 2, flagMask: 1, itemId: 22, spriteType: 43, postGfx: 1 },
    kind: 'npc',
    // Under the bridge east of the house, in the open Light World: without a screen the row had no
    // place to be reached from and could never show as available.
    screenId: 'screen-026',
    regionId: 'region-008',
    name: 'Hobo',
    vanillaItemIds: ['item-023'],
    scope: 'npc',
    actorId: 'actor-006',
    visualNote: 'Transitions to sleeping pose (gfx 1)',
    sourceFunc: 'Sprite_Hobo_Bum',
    requirements: { itemId: 'item-031' },
  },
  {
    id: 'check-026',
    gameId: { roomId: 260, chestIndex: 0 },
    kind: 'chest',
    screenId: 'screen-204',
    regionId: 'region-064',
    name: 'Link\'s House',
    vanillaItemIds: ['item-019'],
    review: { status: 'verified', source: 'person', at: '2026-08-26T03:06:52.923Z' },
  },
];

export { LW_OVERWORLD_CENTRAL_HYRULE_CHECKS };
