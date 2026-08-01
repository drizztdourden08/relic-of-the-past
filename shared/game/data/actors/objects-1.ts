/* @layer shared-game @kind data */
/**
 * Object census — Phase 8 skeleton, from the native sprite-type table
 * (core/zelda3/assets/tables.py's kSpriteNames, ~line 860). Ids continue
 * the deterministic enemy/boss/object sort after bosses.ts — the last group
 * (kind reassignments below keep their original id regardless of kind).
 *
 * Covers every remaining sprite type not already an npc/obstacle/enemy/boss
 * actor: switches, traps, mechanical fixtures, pickups and a few sprites too
 * minor for a dedicated record elsewhere. Names are re-derived from the
 * decompilation's own function names in core/zelda3/src/sprite_main.h.
 * Several records that are actually townsfolk (npc was out of scope for the
 * package that built this file) or actual creatures (enemy) were moved to
 * their correct kind here — see the naming-pass report for the full list.
 *
 * Part 1 of 4 (size split); see objects-2/3/4.ts for the rest.
 */
import type { ActorRecord } from '../types';

const OBJECT_ACTORS_1: ActorRecord[] = [
  {
    id: 'actor-151',
    gameId: { spriteType: 3 },
    kind: 'object',
    randomizerName: 'BigCanon',
  },
  {
    id: 'actor-152',
    gameId: { spriteType: 4 },
    kind: 'object',
    randomizerName: 'PullSwitch',
  },
  {
    id: 'actor-153',
    gameId: { spriteType: 5 },
    kind: 'object',
    randomizerName: 'DnSwitch',
  },
  {
    id: 'actor-154',
    gameId: { spriteType: 6 },
    kind: 'object',
    randomizerName: 'TrapSwitch',
  },
  {
    id: 'actor-155',
    gameId: { spriteType: 7 },
    kind: 'object',
    randomizerName: 'FloorMove',
  },
  {
    // Sprite_0C_OctorokStone (sprite_main.h) — a crumbling rock hazard, Octorok-family.
    id: 'actor-156',
    gameId: { spriteType: 12 },
    kind: 'object',
    randomizerName: 'Octorok Stone',
  },
  {
    // Sprite_14_ThievesTownGrate (sprite_main.h).
    id: 'actor-157',
    gameId: { spriteType: 20 },
    kind: 'object',
    randomizerName: 'Thieves Town Grate',
  },
  {
    id: 'actor-158',
    gameId: { spriteType: 27 },
    kind: 'object',
    randomizerName: 'AnArrow',
  },
  {
    id: 'actor-159',
    gameId: { spriteType: 28 },
    kind: 'object',
    randomizerName: 'Statue',
  },
  {
    // Sprite_1D_FluteQuest (sprite_main.h) — the flute-summon interaction point.
    id: 'actor-160',
    gameId: { spriteType: 29 },
    kind: 'object',
    randomizerName: 'Flute Quest',
  },
  {
    // Sprite_1E_CrystalSwitch (sprite_main.h).
    id: 'actor-161',
    gameId: { spriteType: 30 },
    kind: 'object',
    randomizerName: 'Crystal Switch',
  },
  {
    // Sprite_21_WaterSwitch (sprite_main.h).
    id: 'actor-162',
    gameId: { spriteType: 33 },
    kind: 'object',
    randomizerName: 'Water Switch',
  },
  {
    // Sprite_26_HardhatBeetle (sprite_main.h) — an enemy, not scenery (damages Link on
    // contact); reclassified from 'object'. NOTE: kept in this file rather than moved to
    // enemies.ts to bound this change's diff — a follow-up should physically relocate it.
    id: 'actor-163',
    gameId: { spriteType: 38 },
    kind: 'enemy',
    randomizerName: 'Hardhat Beetle',
  },
  {
    // Sprite_27_Deadrock (sprite_main.h) — an enemy, not a squirrel; reclassified from
    // 'object' (see actor-163's note on physical file location).
    id: 'actor-164',
    gameId: { spriteType: 39 },
    kind: 'enemy',
    randomizerName: 'Deadrock',
  },
  {
    // Sprite_28_DarkWorldHintNPC (sprite_main.h) — a townsfolk NPC; reclassified from
    // 'object' (npc was out of scope for the package that built this file).
    id: 'actor-165',
    gameId: { spriteType: 40 },
    kind: 'npc',
    randomizerName: 'Dark World Hint NPC',
  },
  {
    // Townsfolk NPC; reclassified from 'object'.
    id: 'actor-166',
    gameId: { spriteType: 42 },
    kind: 'npc',
    randomizerName: 'DustGirl',
  },
  {
    // Townsfolk NPCs (the two brothers blocking the path); reclassified from 'object'.
    id: 'actor-167',
    gameId: { spriteType: 44 },
    kind: 'npc',
    randomizerName: 'Lumberjacks',
  },
  {
    // Townsfolk NPC; reclassified from 'object'.
    id: 'actor-168',
    gameId: { spriteType: 47 },
    kind: 'npc',
    randomizerName: 'Person',
  },
  {
    // Townsfolk NPC; reclassified from 'object'.
    id: 'actor-169',
    gameId: { spriteType: 48 },
    kind: 'npc',
    randomizerName: 'Person',
  },
  {
    // Townsfolk NPC; reclassified from 'object'.
    id: 'actor-170',
    gameId: { spriteType: 49 },
    kind: 'npc',
    randomizerName: 'FortuneTeller',
  },
  {
    // Townsfolk NPC; reclassified from 'object'.
    id: 'actor-171',
    gameId: { spriteType: 50 },
    kind: 'npc',
    randomizerName: 'AngryBrother',
  },
  {
    id: 'actor-172',
    gameId: { spriteType: 51 },
    kind: 'object',
    randomizerName: 'PullForRupees',
  },
  {
    // Townsfolk NPC; reclassified from 'object'.
    id: 'actor-173',
    gameId: { spriteType: 52 },
    kind: 'npc',
    randomizerName: 'ScaredGirl2',
  },
  {
    // Townsfolk NPC; reclassified from 'object'.
    id: 'actor-174',
    gameId: { spriteType: 53 },
    kind: 'npc',
    randomizerName: 'HedgeMan',
  },
  {
    // Townsfolk NPC; reclassified from 'object'.
    id: 'actor-175',
    gameId: { spriteType: 54 },
    kind: 'npc',
    randomizerName: 'Witch',
  },
  {
    id: 'actor-176',
    gameId: { spriteType: 55 },
    kind: 'object',
    randomizerName: 'Waterfall',
  },
  {
    // Sprite_38_EyeStatue (sprite_main.h).
    id: 'actor-177',
    gameId: { spriteType: 56 },
    kind: 'object',
    randomizerName: 'Eye Statue',
  },
];

export { OBJECT_ACTORS_1 };
