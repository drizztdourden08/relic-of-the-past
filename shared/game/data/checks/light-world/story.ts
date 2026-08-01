/* @layer shared-game @kind data */
/** Further split by locality out of checks/{dungeons,light-world,dark-world}.ts — Package T. */
import type { CheckRecord } from '../../types';

const LW_STORY_CHECKS: CheckRecord[] = [
  {
    id: 'check-002',
    gameId: { bufferIndex: 0, compare: 'gte', value: 1 },
    kind: 'event',
    randomizerName: 'Zelda Rescue Started',
    vanillaItemIds: [],
  },
  {
    id: 'check-003',
    gameId: { bufferIndex: 19, compare: 'eq', value: 4 },
    kind: 'event',
    randomizerName: 'Throne Room Shelf Moved',
    vanillaItemIds: [],
  },
  {
    id: 'check-004',
    gameId: { bufferIndex: 0, compare: 'gte', value: 2 },
    kind: 'event',
    randomizerName: 'Rescued Zelda',
    vanillaItemIds: [],
  },
  {
    id: 'check-042',
    gameId: { bufferIndex: 2, mask: 1, flagType: 2, flagMask: 1, itemId: 22, spriteType: 43, postGfx: 1 },
    kind: 'npc',
    randomizerName: 'Hobo',
    vanillaItemIds: ['item-023'],
    actorId: 'actor-006',
    visualNote: 'Transitions to sleeping pose (gfx 1)',
    sourceFunc: 'Sprite_Hobo_Bum',
    requirements: { itemId: 'item-031' },
  },
];

export { LW_STORY_CHECKS };
