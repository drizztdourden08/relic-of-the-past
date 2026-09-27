/* @layer shared-game @kind data */

import type { CheckRecord } from '@shared/game/data/types';
import { canRetrieveTablet } from '@shared/game/data/requirements/helpers';

const LW_OVERWORLD_DESERT_CHECKS: CheckRecord[] = [
  {
    id: 'check-029',
    gameId: { roomId: 266, chestIndex: 0 },
    kind: 'chest',
    screenId: 'screen-160',
    regionId: 'region-087',
    name: 'Aginah\'s Cave',
    vanillaItemIds: ['item-024'],
    review: { status: 'verified', source: 'person', at: '2026-08-26T03:06:52.923Z' },
  },
  {
    id: 'check-047',
    gameId: { roomId: 294, mask: 512 },
    kind: 'standing',
    screenId: 'screen-168',
    regionId: 'region-101',
    name: 'Checkerboard Cave',
    vanillaItemIds: ['item-024'],
    scope: 'world-item',
    review: {
      status: 'accepted',
      source: 'person',
      note: 'kind chest -> standing: AP location address 0x180005 is a custom expanded-ROM slot (not the native chest table); the vanilla item is the standing 0xEB piece | gameId { roomId: 292, chestIndex: 0 } -> { roomId: 294, mask: 512 }: ROM entrance table: desert-ledge area 0x30 entrance 114 -> room 0x126 (294), matching EntranceShuffle.py \'Checkerboard Cave\' (0x0126, 0x30); room 0x126 sprite census: 0xEB at x=28 right half -> saved 0x200 (512). Room 292 c0 is Bonk Rock Cave\'s chest (the old collision)',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'check-059',
    gameId: { owScreen: 48, mask: 64 },
    kind: 'standing',
    screenId: 'screen-009',
    regionId: 'region-013',
    name: 'Desert Ledge',
    vanillaItemIds: ['item-024'],
    scope: 'world-item',
  },
  {
    id: 'check-080',
    gameId: { bufferIndex: 22, mask: 1 },
    kind: 'standing',
    screenId: 'screen-002',
    regionId: 'region-030',
    name: 'Bombos Tablet',
    vanillaItemIds: ['item-016'],
    scope: 'world-item',
    // The bit above is a seed's own; a plain file answers from the medallion itself.
    requirements: canRetrieveTablet,
    fallback: { itemId: 'item-016' },
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId { owScreen: 108, mask: 64 } -> { bufferIndex: 22, mask: 1 }: same evidence as check-070 (no tablet ow-bit writer; no 0xEB sprite on area 0x6C in the OW census); desert tablet substitution bit is byte 1 mask 0x01 (npc_overrides.c), progress buffer [22]',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
];

export { LW_OVERWORLD_DESERT_CHECKS };
