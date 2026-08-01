/* @layer shared-game @kind data */
/** Object census, part 2 of 4 (size split); see objects-1.ts for context. */
import type { ActorRecord } from '../types';

const OBJECT_ACTORS_2: ActorRecord[] = [
  {
    id: 'actor-178',
    gameId: { spriteType: 59 },
    kind: 'object',
    randomizerName: 'DashItem',
  },
  {
    // Townsfolk NPC; reclassified from 'object'.
    id: 'actor-179',
    gameId: { spriteType: 60 },
    kind: 'npc',
    randomizerName: 'FarmBoy',
  },
  {
    // Townsfolk NPC; reclassified from 'object'.
    id: 'actor-180',
    gameId: { spriteType: 61 },
    kind: 'npc',
    randomizerName: 'ScaredGirl1',
  },
  {
    id: 'actor-181',
    gameId: { spriteType: 64 },
    kind: 'object',
    randomizerName: 'ElectricBarrier',
  },
  {
    // Sprite_4D_Toppo (sprite_main.h) — not Link's bunny-transformation; a distinct creature.
    id: 'actor-182',
    gameId: { spriteType: 77 },
    kind: 'object',
    randomizerName: 'Toppo',
  },
  {
    // Sprite_50_Cannonball (sprite_main.h) — census's 'GlassSquirrel' does not match.
    id: 'actor-183',
    gameId: { spriteType: 80 },
    kind: 'object',
    randomizerName: 'Cannonball',
  },
  {
    // Sprite_57_DesertStatue (sprite_main.h) — census's 'HyliaObstacle' was the wrong area.
    id: 'actor-184',
    gameId: { spriteType: 87 },
    kind: 'object',
    randomizerName: 'Desert Statue',
  },
  {
    // Sprite_59_LostWoodsBird (sprite_main.h).
    id: 'actor-185',
    gameId: { spriteType: 89 },
    kind: 'object',
    randomizerName: 'Lost Woods Bird',
  },
  {
    // Sprite_5A_LostWoodsSquirrel (sprite_main.h).
    id: 'actor-186',
    gameId: { spriteType: 90 },
    kind: 'object',
    randomizerName: 'Lost Woods Squirrel',
  },
  {
    id: 'actor-187',
    gameId: { spriteType: 93 },
    kind: 'object',
    randomizerName: 'Roller_1',
  },
  {
    id: 'actor-188',
    gameId: { spriteType: 94 },
    kind: 'object',
    randomizerName: 'Roller_2',
  },
  {
    id: 'actor-189',
    gameId: { spriteType: 95 },
    kind: 'object',
    randomizerName: 'Roller_3',
  },
  {
    id: 'actor-190',
    gameId: { spriteType: 96 },
    kind: 'object',
    randomizerName: 'Roller_4',
  },
  {
    id: 'actor-191',
    gameId: { spriteType: 98 },
    kind: 'object',
    randomizerName: 'Master Sword',
  },
  {
    id: 'actor-192',
    gameId: { spriteType: 101 },
    kind: 'object',
    randomizerName: 'Archery Game',
  },
  {
    id: 'actor-193',
    gameId: { spriteType: 102 },
    kind: 'object',
    randomizerName: 'Cannon(Right)',
  },
  {
    id: 'actor-194',
    gameId: { spriteType: 103 },
    kind: 'object',
    randomizerName: 'Cannon(Left)',
  },
  {
    id: 'actor-195',
    gameId: { spriteType: 104 },
    kind: 'object',
    randomizerName: 'Cannon(Down)',
  },
  {
    id: 'actor-196',
    gameId: { spriteType: 105 },
    kind: 'object',
    randomizerName: 'Cannon(Up)',
  },
  {
    // Sprite_6C_MirrorPortal (sprite_main.h).
    id: 'actor-197',
    gameId: { spriteType: 108 },
    kind: 'object',
    randomizerName: 'Mirror Portal',
  },
  {
    id: 'actor-198',
    gameId: { spriteType: 114 },
    kind: 'object',
    randomizerName: 'Fairy Pond',
  },
  {
    id: 'actor-199',
    gameId: { spriteType: 116 },
    kind: 'object',
    randomizerName: 'Runner',
  },
  {
    // The princess NPC; reclassified from 'object' (real names are legitimate in
    // DATA per the copyright rule — this is a data file, not code).
    id: 'actor-200',
    gameId: { spriteType: 118 },
    kind: 'npc',
    randomizerName: 'Zelda',
  },
  {
    // Sprite_78_MrsSahasrahla (sprite_main.h) — Sahasrahla's wife; townsfolk NPC,
    // reclassified from 'object'.
    id: 'actor-201',
    gameId: { spriteType: 120 },
    kind: 'npc',
    randomizerName: 'Mrs Sahasrahla',
  },
  {
    // Sprite_7B_AgahnimBalls (sprite_main.h) — census's 'OneShotMagicBal' was truncated.
    id: 'actor-202',
    gameId: { spriteType: 123 },
    kind: 'object',
    randomizerName: 'Agahnim Balls',
  },
  {
    // Sprite_7D_BigSpike (sprite_main.h).
    id: 'actor-203',
    gameId: { spriteType: 125 },
    kind: 'object',
    randomizerName: 'Big Spike',
  },
  {
    // Sprite_7E_Firebar_Clockwise (sprite_main.h) — the rotating fire-bar hazard, not a "blade".
    id: 'actor-204',
    gameId: { spriteType: 126 },
    kind: 'object',
    randomizerName: 'Firebar (Clockwise)',
  },
  {
    // Counter-clockwise sibling of actor-204 (spriteType 0x7E, adjacent 0x7F) — no direct
    // decompilation name found for 0x7F, inferred from the paired numbering the census itself uses.
    id: 'actor-205',
    gameId: { spriteType: 127 },
    kind: 'object',
    randomizerName: 'Firebar (Counter-Clockwise)',
  },
  {
    // Sprite_85_YellowStalfos (sprite_main.h) — an enemy, not a spike block; census had
    // copy-pasted 'BigSpikeBlock' from actor-203 for a completely different sprite.
    // Reclassified from 'object'.
    id: 'actor-206',
    gameId: { spriteType: 133 },
    kind: 'enemy',
    randomizerName: 'Yellow Stalfos',
  },
];

export { OBJECT_ACTORS_2 };
