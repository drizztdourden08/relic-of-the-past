/* @layer shared-game @kind data */

import type { CheckRecord } from '@shared/game/data/types';

const LW_CASTLE_TOWER_CHECKS: CheckRecord[] = [
  {
    id: 'check-112',
    gameId: { roomId: 224, chestIndex: 0 },
    kind: 'chest',
    screenId: 'screen-157',
    regionId: 'region-175',
    dungeonId: 'dungeon-002',
    name: 'Room 03',
    vanillaItemIds: ['item-037'],
    tags: ['tag-083'],
    review: {
      status: 'accepted',
      source: 'person',
      note: 'vanillaItemIds[0] item-053 -> item-037: S1 census item byte at the certified position == receive-item id (decomp id-space ruling)',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'check-113',
    gameId: { roomId: 208, chestIndex: 0 },
    kind: 'chest',
    screenId: 'screen-153',
    regionId: 'region-175',
    dungeonId: 'dungeon-002',
    name: 'Dark Maze',
    vanillaItemIds: ['item-037'],
    tags: ['tag-083'],
    review: {
      status: 'accepted',
      source: 'person',
      note: 'gameId.roomId/chestIndex (64, 0) -> (208, 0): S2 reference address -> chest-table crosswalk; target entry confirmed present in the S1 census | vanillaItemIds[0] item-053 -> item-037: S1 census item byte at the certified position == receive-item id (decomp id-space ruling)',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'check-114',
    gameId: { roomId: 176, mask: 1024 },
    kind: 'keyDrop',
    screenId: 'screen-146',
    regionId: 'region-175',
    dungeonId: 'dungeon-002',
    name: 'Dark Archer Key Drop',
    vanillaItemIds: ['item-099'],
    scope: 'key-drop',
    tags: ['tag-083'],
    review: { status: 'accepted', source: 'person', at: '2026-08-26T03:06:52.923Z' },
  },
  {
    id: 'check-115',
    gameId: { roomId: 192, mask: 1024 },
    kind: 'keyDrop',
    screenId: 'screen-150',
    regionId: 'region-175',
    dungeonId: 'dungeon-002',
    name: 'Circle of Pots Key Drop',
    vanillaItemIds: ['item-099'],
    scope: 'key-drop',
    tags: ['tag-083'],
    review: { status: 'accepted', source: 'person', at: '2026-08-26T03:06:52.923Z' },
  },
];

export { LW_CASTLE_TOWER_CHECKS };
