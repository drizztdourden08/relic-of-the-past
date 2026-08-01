/* @layer shared-game @kind data */
/** Further split by locality out of checks/{dungeons,light-world,dark-world}.ts — Package T. */
import type { CheckRecord } from '../../types';

const DW_VILLAGE_OF_OUTCASTS_CHECKS: CheckRecord[] = [
  {
    id: 'check-079',
    gameId: { owScreen: 104, mask: 64 },
    kind: 'dig',
    screenId: 'screen-249',
    randomizerName: 'Digging Game',
    vanillaItemIds: ['item-024'],
    requirements: { itemId: 'item-020' },
  },
  {
    id: 'check-081',
    gameId: { bufferIndex: 2, mask: 32, flagType: 2, flagMask: 32, itemId: 255, spriteType: 26, postGfx: 0 },
    kind: 'npc',
    screenId: 'screen-260',
    randomizerName: 'Frog',
    vanillaItemIds: [],
    actorId: 'actor-003',
    visualNote: 'Sprite disappears (becomes tagalong)',
    sourceFunc: 'Smithy_Frog',
  },
];

export { DW_VILLAGE_OF_OUTCASTS_CHECKS };
