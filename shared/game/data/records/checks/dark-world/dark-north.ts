/* @layer shared-game @kind data */
/** Package T split checks/{dungeons,light-world,dark-world}.ts by locality. */
import type { CheckRecord } from '@shared/game/data/types';

const DW_DARK_NORTH_CHECKS: CheckRecord[] = [
  {
    id: 'check-076',
    gameId: { owScreen: 91, mask: 64 },
    kind: 'standing',
    screenId: 'screen-280',
    randomizerName: 'Pyramid',
    vanillaItemIds: ['item-024'],
  },
  {
    id: 'check-083',
    gameId: { owScreen: 99, mask: 64 },
    kind: 'standing',
    screenId: 'screen-281',
    randomizerName: 'Dark Blacksmith Ruins',
    vanillaItemIds: ['item-072'],
  },
  {
    id: 'check-271',
    gameId: { roomId: 295, mask: 1024 },
    kind: 'standing',
    screenId: 'screen-468',
    randomizerName: 'Peg Cave',
    vanillaItemIds: ['item-024'],
  },
  // The cursed pond: same sprite and grant seam as Waterfall Fairy (check-021/022),
  // one room over. Left/right share spriteType 114, disambiguated by room.
  {
    id: 'check-266',
    gameId: {
      bufferIndex: 22, mask: 32, flagType: 2, flagMask: 0, itemId: 3, spriteType: 114, postGfx: 0, room: 278,
    },
    kind: 'npc',
    screenId: 'screen-484',
    randomizerName: 'Pyramid Fairy - Left',
    vanillaItemIds: ['item-004'],
    sourceFunc: 'Sprite_WishPond3',
  },
  {
    id: 'check-267',
    gameId: {
      bufferIndex: 22, mask: 64, flagType: 2, flagMask: 0, itemId: 59, spriteType: 114, postGfx: 0, room: 278,
    },
    kind: 'npc',
    screenId: 'screen-484',
    randomizerName: 'Pyramid Fairy - Right',
    vanillaItemIds: ['item-060'],
    sourceFunc: 'Sprite_WishPond3',
  },
];

export { DW_DARK_NORTH_CHECKS };
