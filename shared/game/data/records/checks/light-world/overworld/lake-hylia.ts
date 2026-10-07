/* @layer shared-game @kind data */

import type { CheckRecord } from '@shared/game/data/types';

const LW_OVERWORLD_LAKE_HYLIA_CHECKS: CheckRecord[] = [
  {
    id: 'check-024',
    gameId: { roomId: 267, chestIndex: 0 },
    kind: 'chest',
    screenId: 'screen-170',
    regionId: 'region-063',
    name: 'Floodgate Chest',
    vanillaItemIds: ['item-041'],
    review: {
      status: 'accepted',
      source: 'person',
      note: 'vanillaItemIds[0] item-072 -> item-041: S1 census item byte at the certified position == receive-item id (decomp id-space ruling)',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'check-048',
    gameId: { roomId: 291, chestIndex: 0 },
    kind: 'chest',
    screenId: 'screen-166',
    regionId: 'region-103',
    name: 'Mini Moldorm Cave - Far Left',
    vanillaItemIds: ['item-041'],
    review: {
      status: 'accepted',
      source: 'person',
      note: 'vanillaItemIds[0] item-066 -> item-041: S1 census item byte at the certified position == receive-item id (decomp id-space ruling)',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'check-049',
    gameId: { roomId: 291, chestIndex: 1 },
    kind: 'chest',
    screenId: 'screen-166',
    regionId: 'region-103',
    name: 'Mini Moldorm Cave - Left',
    vanillaItemIds: ['item-055'],
    review: {
      status: 'accepted',
      source: 'person',
      note: 'vanillaItemIds[0] item-072 -> item-055: S1 census item byte at the certified position == receive-item id (decomp id-space ruling)',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'check-050',
    gameId: { roomId: 291, chestIndex: 2 },
    kind: 'chest',
    screenId: 'screen-166',
    regionId: 'region-103',
    name: 'Mini Moldorm Cave - Right',
    vanillaItemIds: ['item-055'],
    review: {
      status: 'accepted',
      source: 'person',
      note: 'vanillaItemIds[0] item-050 -> item-055: S1 census item byte at the certified position == receive-item id (decomp id-space ruling)',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'check-051',
    gameId: { roomId: 291, chestIndex: 3 },
    kind: 'chest',
    screenId: 'screen-166',
    regionId: 'region-103',
    name: 'Mini Moldorm Cave - Far Right',
    vanillaItemIds: ['item-069'],
    review: {
      status: 'accepted',
      source: 'person',
      note: 'vanillaItemIds[0] item-066 -> item-069: S1 census item byte at the certified position == receive-item id (decomp id-space ruling)',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'check-052',
    gameId: {
      bufferIndex: 17,
      mask: 4,
      flagType: 2,
      flagMask: 0,
      itemId: 70,
      roomFlag: { roomId: 291, chestIndex: 6 },
      spriteType: 187,
      postGfx: 0,
      room: 291,
    },
    kind: 'npc',
    screenId: 'screen-166',
    regionId: 'region-103',
    name: 'Mini Moldorm Cave - Generous Guy',
    vanillaItemIds: ['item-071'],
    scope: 'npc',
    actorId: 'actor-230',
    visualNote: 'NPC keeps facing the player; no lasting visual change after the gift',
    sourceFunc: 'NiceThiefWithGift',
  },
  {
    id: 'check-053',
    gameId: { roomId: 288, chestIndex: 0 },
    kind: 'chest',
    screenId: 'screen-174',
    regionId: 'region-104',
    name: 'Ice Rod Cave',
    vanillaItemIds: ['item-009'],
    review: { status: 'verified', source: 'person', at: '2026-08-26T03:06:52.923Z' },
  },
  {
    id: 'check-057',
    gameId: { owScreen: 53, mask: 64 },
    kind: 'standing',
    screenId: 'screen-025',
    regionId: 'region-011',
    name: 'Lake Hylia Island',
    vanillaItemIds: ['item-024'],
    scope: 'world-item',
  },
  // The Happiness Pond's counter-bump slots (sprite_main.c:11416
  // Sprite_HappinessPond, dungeon_room_index 21 = the low byte of room
  // 0x115); no chest/NPC table entry exists for any of them, so completion reads
  // the save-block byte the purchase writes (variables.h:1103-1104).
  //
  // The pond sells SEVEN upgrades per family, not one: the byte counts 0-7 and each
  // purchase adds a tier, so a row per tier is what the player actually collects and
  // what makes 3/7 legible in the tracker. Only the FIRST of each family is a location
  // of the randomizer world (its capacity-shuffle fairy slot holds one pool item), which is why
  // only those two carry the standard name the crosswalk needs
  // (check-name-overrides.data.ts) and the other twelve appear on a vanilla profile
  // alone: placementCheckRecords drops any check the placement does not name.
  //
  // Each family is one ladder of the fairy's, numbered from one, so the two read as
  // what they are and never as a side of a pond. The family word is load-bearing: the
  // pond's own prize rungs are numbered "<fairy> N" with nothing between, so a tier
  // named that way would be a second location answering to a rung's name.
  // The Happiness Pond's counter-bump slots (sprite_main.c:11416
  // Sprite_HappinessPond, dungeon_room_index 21 = the low byte of room
  // 0x115); no chest/NPC table entry exists for any of them, so completion reads
  // the save-block byte the purchase writes (variables.h:1103-1104).
  //
  // The pond sells SEVEN upgrades per family, not one: the byte counts 0-7 and each
  // purchase adds a tier, so a row per tier is what the player actually collects and
  // what makes 3/7 legible in the tracker. Only the FIRST of each family is a location
  // of the randomizer world (its capacity-shuffle fairy slot holds one pool item), so the
  // other twelve appear on a normal profile alone: placementCheckRecords drops any check
  // the placement does not name.
  //
  // Each family is one ladder of the fairy's, numbered from one, so the two read as
  // what they are and never as a side of a pond. The family word is load-bearing: the
  // pond's own prize rungs are numbered "<fairy> N" with nothing between, so a tier
  // named that way would be a second location answering to a rung's name.
  {
    id: 'check-273',
    gameId: { bufferIndex: 23, compare: 'gte', value: 1 },
    kind: 'pond-slot',
    screenId: 'screen-217',
    regionId: 'region-113',
    name: 'Hylia Fairy Bombs 1',
    vanillaItemIds: ['item-132'],
    scope: 'capacity',
    price: 100,
    pond: { pondId: 'capacity', rung: 1, ladder: 'Bombs' },
    review: {
      status: 'accepted',
      source: 'person',
      note: 'record absent -> created (npc, bufferIndex 23 gte 1, vanilla item-132): Sprite_HappinessPond room gate sprite_main.c:11407 (room 21); explosives purchase ai state 8 writes link_bomb_upgrades (sprite_main.c:11511-11523), persisted at g_ram+0xF370 in the save block (variables.h:1103), exposed as progress buffer [23]; no other persistence exists (nothing else in the handler writes the save block beyond the deposit accumulator); substitution is the dedicated pond seam (call-site at case 8)',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'check-275',
    gameId: { bufferIndex: 23, compare: 'gte', value: 2 },
    kind: 'npc',
    screenId: 'screen-217',
    regionId: 'region-113',
    name: 'Hylia Fairy Bombs 2',
    vanillaItemIds: ['item-132'],
  },
  {
    id: 'check-276',
    gameId: { bufferIndex: 23, compare: 'gte', value: 3 },
    kind: 'npc',
    screenId: 'screen-217',
    regionId: 'region-113',
    name: 'Hylia Fairy Bombs 3',
    vanillaItemIds: ['item-132'],
  },
  {
    id: 'check-277',
    gameId: { bufferIndex: 23, compare: 'gte', value: 4 },
    kind: 'npc',
    screenId: 'screen-217',
    regionId: 'region-113',
    name: 'Hylia Fairy Bombs 4',
    vanillaItemIds: ['item-132'],
  },
  {
    id: 'check-278',
    gameId: { bufferIndex: 23, compare: 'gte', value: 5 },
    kind: 'npc',
    screenId: 'screen-217',
    regionId: 'region-113',
    name: 'Hylia Fairy Bombs 5',
    vanillaItemIds: ['item-132'],
  },
  {
    id: 'check-279',
    gameId: { bufferIndex: 23, compare: 'gte', value: 6 },
    kind: 'npc',
    screenId: 'screen-217',
    regionId: 'region-113',
    name: 'Hylia Fairy Bombs 6',
    vanillaItemIds: ['item-132'],
  },
  {
    id: 'check-280',
    gameId: { bufferIndex: 23, compare: 'gte', value: 7 },
    kind: 'npc',
    screenId: 'screen-217',
    regionId: 'region-113',
    name: 'Hylia Fairy Bombs 7',
    vanillaItemIds: ['item-132'],
  },
  {
    id: 'check-274',
    gameId: { bufferIndex: 24, compare: 'gte', value: 1 },
    kind: 'pond-slot',
    screenId: 'screen-217',
    regionId: 'region-113',
    name: 'Hylia Fairy Arrows 1',
    vanillaItemIds: ['item-129'],
    scope: 'capacity',
    price: 100,
    pond: { pondId: 'capacity', rung: 1, ladder: 'Arrows' },
    review: {
      status: 'accepted',
      source: 'person',
      note: 'record absent -> created (npc, bufferIndex 24 gte 1, vanilla item-129): same handler, projectiles purchase ai state 12 writes link_arrow_upgrades (sprite_main.c:11548-11560), g_ram+0xF371 (variables.h:1104), progress buffer [24]; substitution at the case-12 call-site',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
  {
    id: 'check-281',
    gameId: { bufferIndex: 24, compare: 'gte', value: 2 },
    kind: 'npc',
    screenId: 'screen-217',
    regionId: 'region-113',
    name: 'Hylia Fairy Arrows 2',
    vanillaItemIds: ['item-129'],
  },
  {
    id: 'check-282',
    gameId: { bufferIndex: 24, compare: 'gte', value: 3 },
    kind: 'npc',
    screenId: 'screen-217',
    regionId: 'region-113',
    name: 'Hylia Fairy Arrows 3',
    vanillaItemIds: ['item-129'],
  },
  {
    id: 'check-283',
    gameId: { bufferIndex: 24, compare: 'gte', value: 4 },
    kind: 'npc',
    screenId: 'screen-217',
    regionId: 'region-113',
    name: 'Hylia Fairy Arrows 4',
    vanillaItemIds: ['item-129'],
  },
  {
    id: 'check-284',
    gameId: { bufferIndex: 24, compare: 'gte', value: 5 },
    kind: 'npc',
    screenId: 'screen-217',
    regionId: 'region-113',
    name: 'Hylia Fairy Arrows 5',
    vanillaItemIds: ['item-129'],
  },
  {
    id: 'check-285',
    gameId: { bufferIndex: 24, compare: 'gte', value: 6 },
    kind: 'npc',
    screenId: 'screen-217',
    regionId: 'region-113',
    name: 'Hylia Fairy Arrows 6',
    vanillaItemIds: ['item-129'],
  },
  {
    id: 'check-286',
    gameId: { bufferIndex: 24, compare: 'gte', value: 7 },
    kind: 'npc',
    screenId: 'screen-217',
    regionId: 'region-113',
    name: 'Hylia Fairy Arrows 7',
    vanillaItemIds: ['item-129'],
  },
  // The cave shelf by the lake. It shares room 0x0112 with the dark mountain cave's door, so
  // the overworld area the player walked in from tells the two apart (CheckGameId.shopSeam).
  {
    id: 'check-641',
    gameId: { shopSeam: { roomId: 274, entrance: 88, owArea: 53, subtype: 7 } },
    kind: 'shop-slot',
    screenId: 'screen-214',
    regionId: 'region-107',
    name: 'Cave Shop (Lake Hylia) Left',
    vanillaItemIds: ['item-047'],
    price: 150,
    shop: { shopId: 'cave-shop-lake-hylia', slot: 15, position: 'Left', seam: 'shelf' },
  },
  {
    id: 'check-642',
    gameId: { shopSeam: { roomId: 274, entrance: 88, owArea: 53, subtype: 10 } },
    kind: 'shop-slot',
    screenId: 'screen-214',
    regionId: 'region-107',
    name: 'Cave Shop (Lake Hylia) Center',
    vanillaItemIds: ['item-125'],
    price: 10,
    shop: { shopId: 'cave-shop-lake-hylia', slot: 16, position: 'Center', seam: 'shelf' },
  },
  {
    id: 'check-643',
    gameId: { shopSeam: { roomId: 274, entrance: 88, owArea: 53, subtype: 12 } },
    kind: 'shop-slot',
    screenId: 'screen-214',
    regionId: 'region-107',
    name: 'Cave Shop (Lake Hylia) Right',
    vanillaItemIds: ['item-050'],
    price: 50,
    shop: { shopId: 'cave-shop-lake-hylia', slot: 17, position: 'Right', seam: 'shelf' },
  },
];

export { LW_OVERWORLD_LAKE_HYLIA_CHECKS };
