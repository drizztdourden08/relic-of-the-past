/* @layer shared-game @kind data */
/** Package T split checks/{dungeons,light-world,dark-world}.ts further by locality. */
import type { CheckRecord } from '@shared/game/data/types';

const DW_DARK_SOUTH_CHECKS: CheckRecord[] = [
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
    randomizerName: 'Stumpy',
    vanillaItemIds: ['item-020'],
    actorId: 'actor-007',
    visualNote: 'Changes to tree stump form (gfx 3)',
    sourceFunc: 'Sprite_FluteKid_Stumpy',
  },
  {
    id: 'check-084',
    gameId: { roomId: 286, chestIndex: 0 },
    kind: 'chest',
    screenId: 'screen-455',
    randomizerName: 'Hype Cave - Top',
    vanillaItemIds: ['item-066'],
  },
  {
    id: 'check-085',
    gameId: { roomId: 286, chestIndex: 1 },
    kind: 'chest',
    screenId: 'screen-455',
    randomizerName: 'Hype Cave - Middle Right',
    vanillaItemIds: ['item-072'],
  },
  {
    id: 'check-086',
    gameId: { roomId: 286, chestIndex: 2 },
    kind: 'chest',
    screenId: 'screen-455',
    randomizerName: 'Hype Cave - Middle Left',
    vanillaItemIds: ['item-072'],
  },
  {
    id: 'check-087',
    gameId: { roomId: 286, chestIndex: 3 },
    kind: 'chest',
    screenId: 'screen-455',
    randomizerName: 'Hype Cave - Bottom',
    vanillaItemIds: ['item-072'],
  },
  {
    id: 'check-088',
    gameId: {
      bufferIndex: 18,
      mask: 4,
      flagType: 2,
      flagMask: 0,
      itemId: 70,
      roomFlag: { roomId: 286, chestIndex: 6 },
      spriteType: 187,
      postGfx: 0,
      room: 286,
    },
    kind: 'npc',
    screenId: 'screen-455',
    randomizerName: 'Hype Cave - Generous Guy',
    vanillaItemIds: ['item-071'],
    actorId: 'actor-230',
    visualNote: 'NPC keeps facing the player; no lasting visual change after the gift',
    sourceFunc: 'NiceThiefWithGift',
  },
];

export { DW_DARK_SOUTH_CHECKS };
