/* @layer shared-game @kind data */
/** Object census, part 4 of 4 (size split); see objects-1.ts for context. */
import type { ActorRecord } from '@shared/game/data/types';

const OBJECT_ACTORS_4: ActorRecord[] = [
  {
    id: 'actor-237',
    gameId: { spriteType: 198 },
    kind: 'object',
    randomizerName: '4WayShooter',
  },
  {
    id: 'actor-238',
    gameId: { spriteType: 200 },
    kind: 'object',
    randomizerName: 'BigFairy',
  },
  {
    // The census's 'Transform/Smoke' was a malformed dual-guess for Sprite_D1_BunnyBeam (sprite_main.h).
    id: 'actor-239',
    gameId: { spriteType: 209 },
    kind: 'object',
    randomizerName: 'Bunny Beam',
  },
  {
    id: 'actor-240',
    gameId: { spriteType: 210 },
    kind: 'object',
    randomizerName: 'Fish',
  },
  {
    id: 'actor-241',
    gameId: { spriteType: 211 },
    kind: 'object',
    randomizerName: 'AliveRock',
  },
  {
    id: 'actor-242',
    gameId: { spriteType: 212 },
    kind: 'object',
    randomizerName: 'GroundBomb',
  },
  {
    // Sprite_D5_DigGameGuy (sprite_main.h) is a townsfolk NPC, reclassified from 'object'.
    id: 'actor-243',
    gameId: { spriteType: 213 },
    kind: 'npc',
    randomizerName: 'Dig Game Guy',
  },
  {
    id: 'actor-244',
    gameId: { spriteType: 216 },
    kind: 'object',
    randomizerName: 'Heart',
  },
  {
    id: 'actor-245',
    gameId: { spriteType: 217 },
    kind: 'object',
    randomizerName: 'Rupee-G',
  },
  {
    id: 'actor-246',
    gameId: { spriteType: 218 },
    kind: 'object',
    randomizerName: 'Rupee-B',
  },
  {
    id: 'actor-247',
    gameId: { spriteType: 219 },
    kind: 'object',
    randomizerName: 'InTreeRocks',
  },
  {
    id: 'actor-248',
    gameId: { spriteType: 220 },
    kind: 'object',
    randomizerName: 'Bomb',
  },
  {
    id: 'actor-249',
    gameId: { spriteType: 221 },
    kind: 'object',
    randomizerName: '4_bombs',
  },
  {
    id: 'actor-250',
    gameId: { spriteType: 222 },
    kind: 'object',
    randomizerName: '8_bombs',
  },
  {
    id: 'actor-251',
    gameId: { spriteType: 223 },
    kind: 'object',
    randomizerName: 'Magic',
  },
  {
    id: 'actor-252',
    gameId: { spriteType: 224 },
    kind: 'object',
    randomizerName: 'BigMagic',
  },
  {
    id: 'actor-253',
    gameId: { spriteType: 225 },
    kind: 'object',
    randomizerName: 'Arrow',
  },
  {
    id: 'actor-254',
    gameId: { spriteType: 226 },
    kind: 'object',
    randomizerName: '10-Arrows',
  },
  {
    id: 'actor-255',
    gameId: { spriteType: 227 },
    kind: 'object',
    randomizerName: 'Fairy',
  },
  {
    id: 'actor-256',
    gameId: { spriteType: 228 },
    kind: 'object',
    randomizerName: 'Key',
  },
  {
    id: 'actor-257',
    gameId: { spriteType: 229 },
    kind: 'object',
    randomizerName: 'Big_Key',
  },
  {
    id: 'actor-258',
    gameId: { spriteType: 231 },
    kind: 'object',
    randomizerName: 'Mushroom',
  },
  {
    id: 'actor-259',
    gameId: { spriteType: 232 },
    kind: 'object',
    randomizerName: 'FakeSword',
  },
  {
    // Sprite_E9_PotionShop (sprite_main.h).
    id: 'actor-260',
    gameId: { spriteType: 233 },
    kind: 'object',
    randomizerName: 'Potion Shop',
  },
  {
    // Townsfolk NPC; reclassified from 'object'.
    id: 'actor-261',
    gameId: { spriteType: 234 },
    kind: 'npc',
    randomizerName: 'WitchAssistant',
  },
  {
    id: 'actor-262',
    gameId: { spriteType: 235 },
    kind: 'object',
    randomizerName: 'HeartPie',
  },
  {
    // Sprite_EC_ThrownItem (sprite_main.h).
    id: 'actor-263',
    gameId: { spriteType: 236 },
    kind: 'object',
    randomizerName: 'Thrown Item',
  },
  {
    id: 'actor-264',
    gameId: { spriteType: 238 },
    kind: 'object',
    randomizerName: 'Mantle',
  },
  {
    // Spelling fix ('Medallian' -> 'Medallion'), matches Sprite_F2_MedallionTablet.
    id: 'actor-265',
    gameId: { spriteType: 242 },
    kind: 'object',
    randomizerName: 'Medallion Tablet',
  },
  {
    id: 'actor-266',
    gameId: { spriteType: 243 },
    kind: 'object',
    randomizerName: 'PersonsDoor',
  },
  {
    id: 'actor-267',
    gameId: { spriteType: 244 },
    kind: 'object',
    randomizerName: 'FallingRocks',
  },
];

export { OBJECT_ACTORS_4 };
