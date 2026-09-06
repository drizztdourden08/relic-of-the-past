/* @layer shared-game @kind data */
/** Package T split checks/{dungeons,light-world,dark-world}.ts further by locality. */
import type { CheckRecord } from '@shared/game/data/types';
import { canLiftHeavyRocks } from '@shared/game/data/requirements/helpers';

const LW_CENTRAL_HYRULE_CHECKS: CheckRecord[] = [
  {
    id: 'check-006',
    gameId: { owScreen: 0, mask: 64 },
    kind: 'standing',
    screenId: 'screen-026',
    randomizerName: 'Mushroom',
    vanillaItemIds: ['item-042'],
  },
  {
    id: 'check-007',
    gameId: { bufferIndex: 2, mask: 2, flagType: 2, flagMask: 2, itemId: 22, spriteType: 117, postGfx: 0 },
    kind: 'npc',
    screenId: 'screen-026',
    randomizerName: 'Bottle Merchant',
    vanillaItemIds: ['item-023'],
    actorId: 'actor-012',
    visualNote: 'Stays in place (random facing animation)',
    sourceFunc: 'Sprite_BottleVendor',
  },
  {
    id: 'check-008',
    gameId: { owScreen: 42, mask: 64 },
    kind: 'dig',
    screenId: 'screen-026',
    randomizerName: 'Flute Spot',
    vanillaItemIds: ['item-021'],
    requirements: { itemId: 'item-020' },
  },
  {
    id: 'check-009',
    gameId: { owScreen: 59, mask: 64 },
    kind: 'event',
    screenId: 'screen-026',
    randomizerName: 'Sunken Treasure',
    vanillaItemIds: ['item-024'],
    requirements: { checkId: 'check-025' },
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
    randomizerName: 'Purple Chest',
    vanillaItemIds: ['item-023'],
    actorId: 'actor-008',
    presence: { and: [{ not: { followerEq: 9 } }, { progressIndicator3: 16, state: 'clear' }] },
    visualNote: 'Chest disappears (sprite killed)',
    sourceFunc: 'Sprite_39_Locksmith',
    requirements: canLiftHeavyRocks,
  },
  {
    id: 'check-011',
    gameId: {},
    kind: 'event',
    screenId: 'screen-026',
    randomizerName: 'Flute Activation Spot',
    vanillaItemIds: [],
    requirements: { itemId: 'item-021' },
  },
];

export { LW_CENTRAL_HYRULE_CHECKS };
