/* @layer shared-game @kind data */
/** Package T split checks/{dungeons,light-world,dark-world}.ts further by locality. */
import type { CheckRecord } from '@shared/game/data/types';

const LW_LAKE_HYLIA_CHECKS: CheckRecord[] = [
  {
    id: 'check-053',
    gameId: { roomId: 288, chestIndex: 0 },
    kind: 'chest',
    screenId: 'screen-174',
    randomizerName: 'Ice Rod Cave',
    vanillaItemIds: ['item-009'],
  },
  {
    id: 'check-057',
    gameId: { owScreen: 53, mask: 64 },
    kind: 'standing',
    screenId: 'screen-025',
    randomizerName: 'Lake Hylia Island',
    vanillaItemIds: ['item-024'],
  },
  // The Happiness Pond's two counter-bump slots (sprite_main.c:11416
  // Sprite_HappinessPond, dungeon_room_index 21 = the low byte of room
  // 0x115); no chest/NPC table entry exists for either, so completion reads
  // the save-block byte the purchase writes (variables.h:1103-1104).
  {
    id: 'check-273',
    gameId: { bufferIndex: 23, compare: 'gte', value: 1 },
    kind: 'npc',
    screenId: 'screen-217',
    randomizerName: 'Capacity Upgrade Left',
    vanillaItemIds: ['item-132'],
  },
  {
    id: 'check-274',
    gameId: { bufferIndex: 24, compare: 'gte', value: 1 },
    kind: 'npc',
    screenId: 'screen-217',
    randomizerName: 'Capacity Upgrade Right',
    vanillaItemIds: ['item-129'],
  },
];

export { LW_LAKE_HYLIA_CHECKS };
