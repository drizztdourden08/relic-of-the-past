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
  // The Happiness Pond's counter-bump slots (sprite_main.c:11416
  // Sprite_HappinessPond, dungeon_room_index 21 = the low byte of room
  // 0x115); no chest/NPC table entry exists for any of them, so completion reads
  // the save-block byte the purchase writes (variables.h:1103-1104).
  //
  // The pond sells SEVEN upgrades per family, not one: the byte counts 0-7 and each
  // purchase adds a tier, so a row per tier is what the player actually collects and
  // what makes 3/7 legible in the tracker. Only the FIRST of each family is a location
  // of the AP world (its capacity-shuffle fairy slot holds one pool item), which is why
  // only those two carry the standard name the crosswalk needs
  // (check-name-overrides.data.ts) and the other twelve appear on a vanilla profile
  // alone: apAlignedCheckRecords drops any check the placement does not name.
  {
    id: 'check-273',
    gameId: { bufferIndex: 23, compare: 'gte', value: 1 },
    kind: 'npc',
    screenId: 'screen-217',
    randomizerName: 'Bomb Capacity Upgrade 1',
    vanillaItemIds: ['item-132'],
  },
  {
    id: 'check-275',
    gameId: { bufferIndex: 23, compare: 'gte', value: 2 },
    kind: 'npc',
    screenId: 'screen-217',
    randomizerName: 'Bomb Capacity Upgrade 2',
    vanillaItemIds: ['item-132'],
  },
  {
    id: 'check-276',
    gameId: { bufferIndex: 23, compare: 'gte', value: 3 },
    kind: 'npc',
    screenId: 'screen-217',
    randomizerName: 'Bomb Capacity Upgrade 3',
    vanillaItemIds: ['item-132'],
  },
  {
    id: 'check-277',
    gameId: { bufferIndex: 23, compare: 'gte', value: 4 },
    kind: 'npc',
    screenId: 'screen-217',
    randomizerName: 'Bomb Capacity Upgrade 4',
    vanillaItemIds: ['item-132'],
  },
  {
    id: 'check-278',
    gameId: { bufferIndex: 23, compare: 'gte', value: 5 },
    kind: 'npc',
    screenId: 'screen-217',
    randomizerName: 'Bomb Capacity Upgrade 5',
    vanillaItemIds: ['item-132'],
  },
  {
    id: 'check-279',
    gameId: { bufferIndex: 23, compare: 'gte', value: 6 },
    kind: 'npc',
    screenId: 'screen-217',
    randomizerName: 'Bomb Capacity Upgrade 6',
    vanillaItemIds: ['item-132'],
  },
  {
    id: 'check-280',
    gameId: { bufferIndex: 23, compare: 'gte', value: 7 },
    kind: 'npc',
    screenId: 'screen-217',
    randomizerName: 'Bomb Capacity Upgrade 7',
    vanillaItemIds: ['item-132'],
  },
  {
    id: 'check-274',
    gameId: { bufferIndex: 24, compare: 'gte', value: 1 },
    kind: 'npc',
    screenId: 'screen-217',
    randomizerName: 'Arrow Capacity Upgrade 1',
    vanillaItemIds: ['item-129'],
  },
  {
    id: 'check-281',
    gameId: { bufferIndex: 24, compare: 'gte', value: 2 },
    kind: 'npc',
    screenId: 'screen-217',
    randomizerName: 'Arrow Capacity Upgrade 2',
    vanillaItemIds: ['item-129'],
  },
  {
    id: 'check-282',
    gameId: { bufferIndex: 24, compare: 'gte', value: 3 },
    kind: 'npc',
    screenId: 'screen-217',
    randomizerName: 'Arrow Capacity Upgrade 3',
    vanillaItemIds: ['item-129'],
  },
  {
    id: 'check-283',
    gameId: { bufferIndex: 24, compare: 'gte', value: 4 },
    kind: 'npc',
    screenId: 'screen-217',
    randomizerName: 'Arrow Capacity Upgrade 4',
    vanillaItemIds: ['item-129'],
  },
  {
    id: 'check-284',
    gameId: { bufferIndex: 24, compare: 'gte', value: 5 },
    kind: 'npc',
    screenId: 'screen-217',
    randomizerName: 'Arrow Capacity Upgrade 5',
    vanillaItemIds: ['item-129'],
  },
  {
    id: 'check-285',
    gameId: { bufferIndex: 24, compare: 'gte', value: 6 },
    kind: 'npc',
    screenId: 'screen-217',
    randomizerName: 'Arrow Capacity Upgrade 6',
    vanillaItemIds: ['item-129'],
  },
  {
    id: 'check-286',
    gameId: { bufferIndex: 24, compare: 'gte', value: 7 },
    kind: 'npc',
    screenId: 'screen-217',
    randomizerName: 'Arrow Capacity Upgrade 7',
    vanillaItemIds: ['item-129'],
  },];

export { LW_LAKE_HYLIA_CHECKS };
