/* @layer shared-game @kind data */
/** Further split by locality out of checks/{dungeons,light-world,dark-world}.ts — Package T. */
import type { CheckRecord } from '../../types';

const LW_HYRULE_CASTLE_CHECKS: CheckRecord[] = [
  {
    id: 'check-017',
    gameId: { bufferIndex: 1, mask: 1, flagType: 0, flagMask: 1, itemId: 0, spriteType: 115, postGfx: 1, room: 85 },
    kind: 'npc',
    screenId: 'screen-171',
    randomizerName: 'Link\'s Uncle',
    vanillaItemIds: ['item-074', 'item-005'],
    actorId: 'actor-011',
    visualNote: 'Sword/shield disappear from hands (lying down pose)',
    sourceFunc: 'Uncle_InPassage',
  },
  {
    id: 'check-018',
    gameId: { roomId: 85, chestIndex: 0 },
    kind: 'chest',
    screenId: 'screen-171',
    randomizerName: 'Secret Passage',
    vanillaItemIds: ['item-054'],
  },
];

export { LW_HYRULE_CASTLE_CHECKS };
