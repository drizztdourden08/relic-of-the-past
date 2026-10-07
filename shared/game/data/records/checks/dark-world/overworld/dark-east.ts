/* @layer shared-game @kind data */

import type { CheckRecord } from '@shared/game/data/types';
import { hasBeamSword } from '@shared/game/data/requirements/helpers';

const DW_OVERWORLD_DARK_EAST_CHECKS: CheckRecord[] = [
  {
    id: 'check-077',
    gameId: { bufferIndex: 7, mask: 255, flagType: 2, flagMask: 0, itemId: 17, spriteType: 255, postGfx: 0 },
    kind: 'npc',
    screenId: 'screen-231',
    regionId: 'region-035',
    name: 'Catfish',
    vanillaItemIds: ['item-018'],
    scope: 'npc',
    visualNote: 'Catfish submerges; spawns bouncing medallion',
    sourceFunc: 'Catfish_BigFish',
  },
  // The cursed pond: same sprite and grant seam as Waterfall Fairy (check-021/022),
  // one room over. Left/right share spriteType 114, disambiguated by room.
];

export { DW_OVERWORLD_DARK_EAST_CHECKS };
