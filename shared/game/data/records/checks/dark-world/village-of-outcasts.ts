/* @layer shared-game @kind data */
/** Package T split checks/{dungeons,light-world,dark-world}.ts by locality. */
import type { CheckRecord } from '@shared/game/data/types';

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
  {
    id: 'check-268',
    gameId: { roomId: 262, chestIndex: 0 },
    kind: 'chest',
    screenId: 'screen-473',
    randomizerName: 'Brewery',
    vanillaItemIds: ['item-043'],
  },
  {
    id: 'check-269',
    gameId: { roomId: 284, chestIndex: 0 },
    kind: 'chest',
    screenId: 'screen-471',
    randomizerName: 'C-Shaped House',
    vanillaItemIds: ['item-071'],
  },
  // Shares room 262 with Brewery on purpose: vanilla puts both in one underworld
  // room, told apart by chest bit (0x10 vs 0x400), never aliasing each other.
  // The top prize of the once-only minigame roll (OpenMiniGameChest).
  {
    id: 'check-270',
    gameId: { roomId: 262, chestIndex: 6 },
    kind: 'chest',
    screenId: 'screen-470',
    randomizerName: 'Chest Game',
    vanillaItemIds: ['item-024'],
    sourceFunc: 'OpenMiniGameChest',
  },
];

export { DW_VILLAGE_OF_OUTCASTS_CHECKS };
