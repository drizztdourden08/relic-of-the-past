/* @layer shared-game @kind data */

import type { ActorRecord } from '@shared/game/data/types';

const NPCS_ACTORS: ActorRecord[] = [
  {
    id: 'actor-001',
    gameId: { spriteType: 22 },
    kind: 'npc',
    name: 'Sahasrahla',
  },
  {
    id: 'actor-002',
    gameId: { spriteType: 26 },
    kind: 'npc',
    name: 'Blacksmith',
  },
  {
    id: 'actor-003',
    gameId: { spriteType: 26 },
    kind: 'npc',
    name: 'Frog',
  },
  {
    id: 'actor-004',
    gameId: { spriteType: 26 },
    kind: 'npc',
    name: 'Missing Smith',
  },
  {
    id: 'actor-005',
    gameId: { spriteType: 31 },
    kind: 'npc',
    name: 'Sick Kid',
  },
  {
    id: 'actor-006',
    gameId: { spriteType: 43 },
    kind: 'npc',
    name: 'Hobo',
  },
  {
    id: 'actor-007',
    gameId: { spriteType: 46 },
    kind: 'npc',
    name: 'Stumpy',
  },
  {
    id: 'actor-008',
    gameId: { spriteType: 57 },
    kind: 'npc',
    name: 'Purple Chest',
  },
  {
    id: 'actor-009',
    gameId: { spriteType: 58 },
    kind: 'npc',
    name: 'Magic Bat',
  },
  {
    id: 'actor-010',
    gameId: { spriteType: 82 },
    kind: 'npc',
    name: 'King Zora',
  },
  {
    id: 'actor-011',
    gameId: { spriteType: 115 },
    kind: 'npc',
    name: 'Uncle',
    combat: {
      health: 0,
      flags4: 10,
      damageByClass: {
        '0': 0,
        '1': 0,
        '2': 0,
        '3': 0,
        '4': 0,
        '5': 0,
        '6': 0,
        '7': 0,
        '8': 0,
        '9': 0,
        '10': 0,
        '11': 0,
        '12': 0,
        '13': 0,
        '14': 0,
        '15': 0,
      },
    },
  },
  {
    id: 'actor-012',
    gameId: { spriteType: 117 },
    kind: 'npc',
    name: 'Bottle Merchant',
  },
  {
    id: 'actor-013',
    gameId: { spriteType: 173 },
    kind: 'npc',
    name: 'Old Man',
  },
  {
    id: 'actor-014',
    gameId: { spriteType: 192 },
    kind: 'npc',
    name: 'Catfish',
  },
  {
    // Sprite_28_DarkWorldHintNPC (sprite_main.h) is a townsfolk NPC. Reclassified from
    // 'object' because npc was out of scope for the package that built this file.
    id: 'actor-165',
    gameId: { spriteType: 40 },
    kind: 'npc',
    name: 'Dark World Hint NPC',
  },
  {
    // Townsfolk NPC; reclassified from 'object'.
    id: 'actor-166',
    gameId: { spriteType: 42 },
    kind: 'npc',
    name: 'DustGirl',
  },
  {
    // Townsfolk NPCs (the two brothers blocking the path); reclassified from 'object'.
    id: 'actor-167',
    gameId: { spriteType: 44 },
    kind: 'npc',
    name: 'Lumberjacks',
  },
  {
    // Townsfolk NPC; reclassified from 'object'.
    id: 'actor-168',
    gameId: { spriteType: 47 },
    kind: 'npc',
    name: 'Person',
  },
  {
    // Townsfolk NPC; reclassified from 'object'.
    id: 'actor-169',
    gameId: { spriteType: 48 },
    kind: 'npc',
    name: 'Person',
  },
  {
    // Townsfolk NPC; reclassified from 'object'.
    id: 'actor-170',
    gameId: { spriteType: 49 },
    kind: 'npc',
    name: 'FortuneTeller',
  },
  {
    // Townsfolk NPC; reclassified from 'object'.
    id: 'actor-171',
    gameId: { spriteType: 50 },
    kind: 'npc',
    name: 'AngryBrother',
  },
  {
    // Townsfolk NPC; reclassified from 'object'.
    id: 'actor-173',
    gameId: { spriteType: 52 },
    kind: 'npc',
    name: 'ScaredGirl2',
  },
  {
    // Townsfolk NPC; reclassified from 'object'.
    id: 'actor-174',
    gameId: { spriteType: 53 },
    kind: 'npc',
    name: 'HedgeMan',
  },
  {
    // Townsfolk NPC; reclassified from 'object'.
    id: 'actor-175',
    gameId: { spriteType: 54 },
    kind: 'npc',
    name: 'Witch',
  },
  {
    // Townsfolk NPC; reclassified from 'object'.
    id: 'actor-179',
    gameId: { spriteType: 60 },
    kind: 'npc',
    name: 'FarmBoy',
  },
  {
    // Townsfolk NPC; reclassified from 'object'.
    id: 'actor-180',
    gameId: { spriteType: 61 },
    kind: 'npc',
    name: 'ScaredGirl1',
  },
  {
    // The princess NPC, reclassified from 'object'. Real names are legitimate in
    // DATA per the copyright rule, and this is a data file, not code.
    id: 'actor-200',
    gameId: { spriteType: 118 },
    kind: 'npc',
    name: 'Zelda',
  },
  {
    // Sprite_78_MrsSahasrahla (sprite_main.h) is the elder's wife, a townsfolk NPC
    // reclassified from 'object'.
    id: 'actor-201',
    gameId: { spriteType: 120 },
    kind: 'npc',
    name: 'Mrs Sahasrahla',
  },
  {
    // A named NPC character; reclassified from 'object'.
    id: 'actor-226',
    gameId: { spriteType: 182 },
    kind: 'npc',
    name: 'Kiki',
  },
  {
    // Sprite_B7_BlindMaiden (sprite_main.h) is the boss's captive-maiden illusion. The
    // census had the wrong gender. Townsfolk NPC, reclassified from 'object'.
    id: 'actor-227',
    gameId: { spriteType: 183 },
    kind: 'npc',
    name: 'Blind Maiden',
  },
  {
    // Sprite_B9_BullyAndPinkBall (sprite_main.h) is townsfolk NPCs, reclassified from
    // 'object'; spelling fix ('Whimp' -> 'Wimp').
    id: 'actor-228',
    gameId: { spriteType: 185 },
    kind: 'npc',
    name: 'Bully & Wimp (DW)',
  },
  {
    // Sprite_BB_Shopkeeper (sprite_main.h) is a townsfolk NPC, reclassified from 'object'.
    id: 'actor-230',
    gameId: { spriteType: 187 },
    kind: 'npc',
    name: 'Shopkeeper',
  },
  {
    // Sprite_BC_Drunkard (sprite_main.h) is a townsfolk NPC, reclassified from 'object'.
    id: 'actor-231',
    gameId: { spriteType: 188 },
    kind: 'npc',
    name: 'Drunkard',
  },
  {
    // Sprite_D5_DigGameGuy (sprite_main.h) is a townsfolk NPC, reclassified from 'object'.
    id: 'actor-243',
    gameId: { spriteType: 213 },
    kind: 'npc',
    name: 'Dig Game Guy',
  },
  {
    // Townsfolk NPC; reclassified from 'object'.
    id: 'actor-261',
    gameId: { spriteType: 234 },
    kind: 'npc',
    name: 'WitchAssistant',
  },
];

export { NPCS_ACTORS };
