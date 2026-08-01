/* @layer shared-game @kind data */
/** Object census, part 3 of 4 (size split); see objects-1.ts for context. */
import type { ActorRecord } from '../types';

const OBJECT_ACTORS_3: ActorRecord[] = [
  {
    id: 'actor-207',
    gameId: { spriteType: 138 },
    kind: 'object',
    randomizerName: 'SpikeBlock',
  },
  {
    // Sprite_93_Bumper (sprite_main.h) — the pinball-style bounce obstacle.
    id: 'actor-208',
    gameId: { spriteType: 147 },
    kind: 'object',
    randomizerName: 'Bumper',
  },
  {
    // Sprite_95_LaserEyeLeft (sprite_main.h) — term order corrected ('LaserEye' not
    // 'EyeLaser'); direction label kept as the census assigned it (not independently
    // re-verified per direction — see report).
    id: 'actor-209',
    gameId: { spriteType: 149 },
    kind: 'object',
    randomizerName: 'LaserEye (Right)',
  },
  {
    id: 'actor-210',
    gameId: { spriteType: 150 },
    kind: 'object',
    randomizerName: 'LaserEye (Left)',
  },
  {
    id: 'actor-211',
    gameId: { spriteType: 151 },
    kind: 'object',
    randomizerName: 'LaserEye (Down)',
  },
  {
    id: 'actor-212',
    gameId: { spriteType: 152 },
    kind: 'object',
    randomizerName: 'LaserEye (Up)',
  },
  {
    // Sprite_99_Pengator (sprite_main.h) — an enemy, not scenery; reclassified from
    // 'object' (see actor-163's note on physical file location).
    id: 'actor-213',
    gameId: { spriteType: 153 },
    kind: 'enemy',
    randomizerName: 'Pengator',
  },
  {
    id: 'actor-214',
    gameId: { spriteType: 154 },
    kind: 'object',
    randomizerName: 'Splash',
  },
  {
    id: 'actor-215',
    gameId: { spriteType: 158 },
    kind: 'object',
    randomizerName: 'Ostrich',
  },
  {
    id: 'actor-216',
    gameId: { spriteType: 159 },
    kind: 'object',
    randomizerName: 'Rabbit',
  },
  {
    id: 'actor-217',
    gameId: { spriteType: 172 },
    kind: 'object',
    randomizerName: 'Apples',
  },
  {
    id: 'actor-218',
    gameId: { spriteType: 174 },
    kind: 'object',
    randomizerName: 'DownPipe',
  },
  {
    id: 'actor-219',
    gameId: { spriteType: 175 },
    kind: 'object',
    randomizerName: 'UpPipe',
  },
  {
    id: 'actor-220',
    gameId: { spriteType: 176 },
    kind: 'object',
    randomizerName: 'RightPipe',
  },
  {
    id: 'actor-221',
    gameId: { spriteType: 177 },
    kind: 'object',
    randomizerName: 'LeftPipe',
  },
  {
    id: 'actor-222',
    gameId: { spriteType: 178 },
    kind: 'object',
    randomizerName: 'Good-Bee',
  },
  {
    id: 'actor-223',
    gameId: { spriteType: 179 },
    kind: 'object',
    randomizerName: 'Inscription',
  },
  {
    // Sprite_B4_PurpleChest (sprite_main.h) — the chest prop itself (distinct from the
    // 'Purple Chest' NPC merchant, actor-008, spriteType 57 / Sprite_39_Locksmith).
    id: 'actor-224',
    gameId: { spriteType: 180 },
    kind: 'object',
    randomizerName: 'Purple Chest (prop)',
  },
  {
    id: 'actor-225',
    gameId: { spriteType: 181 },
    kind: 'object',
    randomizerName: 'BombShop',
  },
  {
    // A named NPC character; reclassified from 'object'.
    id: 'actor-226',
    gameId: { spriteType: 182 },
    kind: 'npc',
    randomizerName: 'Kiki',
  },
  {
    // Sprite_B7_BlindMaiden (sprite_main.h) — the boss's captive-maiden illusion; census
    // had the wrong gender. Townsfolk NPC; reclassified from 'object'.
    id: 'actor-227',
    gameId: { spriteType: 183 },
    kind: 'npc',
    randomizerName: 'Blind Maiden',
  },
  {
    // Sprite_B9_BullyAndPinkBall (sprite_main.h) — townsfolk NPCs, reclassified from
    // 'object'; spelling fix ('Whimp' -> 'Wimp').
    id: 'actor-228',
    gameId: { spriteType: 185 },
    kind: 'npc',
    randomizerName: 'Bully & Wimp (DW)',
  },
  {
    id: 'actor-229',
    gameId: { spriteType: 186 },
    kind: 'object',
    randomizerName: 'Whirlpool',
  },
  {
    // Sprite_BB_Shopkeeper (sprite_main.h) — townsfolk NPC, reclassified from 'object'.
    id: 'actor-230',
    gameId: { spriteType: 187 },
    kind: 'npc',
    randomizerName: 'Shopkeeper',
  },
  {
    // Sprite_BC_Drunkard (sprite_main.h) — townsfolk NPC, reclassified from 'object'.
    id: 'actor-231',
    gameId: { spriteType: 188 },
    kind: 'npc',
    randomizerName: 'Drunkard',
  },
  {
    id: 'actor-232',
    gameId: { spriteType: 191 },
    kind: 'object',
    randomizerName: 'Lighting',
  },
  {
    id: 'actor-233',
    gameId: { spriteType: 193 },
    kind: 'object',
    randomizerName: 'AgahTalk',
  },
  {
    id: 'actor-234',
    gameId: { spriteType: 194 },
    kind: 'object',
    randomizerName: 'RockChip',
  },
  {
    id: 'actor-235',
    gameId: { spriteType: 196 },
    kind: 'object',
    randomizerName: 'Bully',
  },
  {
    // Sprite_C5_Medusa (sprite_main.h) — an enemy (a stone head that shoots at Link), not
    // a generic 'Shooter' fixture; reclassified from 'object'.
    id: 'actor-236',
    gameId: { spriteType: 197 },
    kind: 'enemy',
    randomizerName: 'Medusa',
  },
];

export { OBJECT_ACTORS_3 };
