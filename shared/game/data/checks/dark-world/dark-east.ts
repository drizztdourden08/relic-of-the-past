/* @layer shared-game @kind data */
/** Further split by locality out of checks/{dungeons,light-world,dark-world}.ts — Package T. */
import type { CheckRecord } from '../../types';
import { hasBeamSword } from '../../requirements/helpers';

const DW_DARK_EAST_CHECKS: CheckRecord[] = [
  {
    id: 'check-077',
    gameId: { bufferIndex: 7, mask: 255, flagType: 2, flagMask: 0, itemId: 17, spriteType: 255, postGfx: 0 },
    kind: 'npc',
    screenId: 'screen-231',
    randomizerName: 'Catfish',
    vanillaItemIds: ['item-018'],
    visualNote: 'Catfish submerges; spawns bouncing medallion',
    sourceFunc: 'Catfish_BigFish',
  },
  {
    id: 'check-097',
    gameId: { roomId: 0, mask: 2048 },
    kind: 'boss',
    screenId: 'screen-452',
    randomizerName: 'Ganon',
    vanillaItemIds: [],
    requirements: { allOf: [hasBeamSword, { itemId: 'item-019' }, { itemId: 'item-078' }] },
    tags: ['tag-086'],
  },
];

export { DW_DARK_EAST_CHECKS };
