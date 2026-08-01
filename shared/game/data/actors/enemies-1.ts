/* @layer shared-game @kind data */
/**
 * Enemy census — Phase 8 skeleton, from the native sprite-type table
 * (core/zelda3/assets/tables.py's kSpriteNames, ~line 860). Ids start at
 * actor-053 (actor-001..052 are frozen); assignment is sorted by kind
 * (enemy, boss, object) then spriteType ascending, so it is reproducible
 * (spriteType order does not change even where a name below was corrected).
 *
 * Names are re-derived from the decompilation's own function names in
 * core/zelda3/src/sprite_main.h — tables.py's kSpriteNames is an internal
 * tool table (some entries truncated, some flatly wrong) and is no longer
 * trusted for identity. Combat stats are deliberately absent (a separate
 * later deliverable) per docs/contributing/coding-standards.md.
 *
 * Part 1 of 4 (size split); see enemies-2/3/4.ts for the rest.
 */
import type { ActorRecord } from '../types';

const ENEMY_ACTORS_1: ActorRecord[] = [
  {
    id: 'actor-053',
    gameId: { spriteType: 0 },
    kind: 'enemy',
    randomizerName: 'Raven',
  },
  {
    id: 'actor-054',
    gameId: { spriteType: 1 },
    kind: 'enemy',
    randomizerName: 'Vulture',
  },
  {
    id: 'actor-055',
    gameId: { spriteType: 8 },
    kind: 'enemy',
    randomizerName: 'Octorok',
  },
  {
    // Sprite_18_MiniMoldorm (sprite_main.h:385) — swapped with actor-137
    // (the boss), which wrongly held this spriteType; see bosses.ts.
    id: 'actor-056',
    gameId: { spriteType: 24 },
    kind: 'enemy',
    randomizerName: 'Mini Moldorm',
  },
  {
    id: 'actor-057',
    gameId: { spriteType: 10 },
    kind: 'enemy',
    randomizerName: '4WayOctorok',
  },
  {
    // Sprite_0B_Cucco (sprite_main.h).
    id: 'actor-058',
    gameId: { spriteType: 11 },
    kind: 'enemy',
    randomizerName: 'Cucco',
  },
  {
    // Sprite_0D_Buzzblob (sprite_main.h).
    id: 'actor-059',
    gameId: { spriteType: 13 },
    kind: 'enemy',
    randomizerName: 'Buzzblob',
  },
  {
    id: 'actor-060',
    gameId: { spriteType: 14 },
    kind: 'enemy',
    randomizerName: 'SnapDragon',
  },
  {
    // Sprite_0F_Octoballoon (sprite_main.h).
    id: 'actor-061',
    gameId: { spriteType: 15 },
    kind: 'enemy',
    randomizerName: 'Octoballoon',
  },
  {
    id: 'actor-062',
    gameId: { spriteType: 17 },
    kind: 'enemy',
    randomizerName: 'Hinox',
  },
  {
    // Sprite_12_Moblin (sprite_main.h) — census's 'PigSpearMan' was a truncated/wrong guess.
    id: 'actor-063',
    gameId: { spriteType: 18 },
    kind: 'enemy',
    randomizerName: 'Moblin',
  },
  {
    id: 'actor-064',
    gameId: { spriteType: 19 },
    kind: 'enemy',
    randomizerName: 'MiniHelmasaur',
  },
  {
    id: 'actor-065',
    gameId: { spriteType: 21 },
    kind: 'enemy',
    randomizerName: 'Bubble',
  },
  {
    // Sprite_17_Hoarder (sprite_main.h) — a covered rupee-hoarding crab (CoveredRupeeCrab_Draw).
    id: 'actor-066',
    gameId: { spriteType: 23 },
    kind: 'enemy',
    randomizerName: 'Hoarder',
  },
  {
    // Sprite_19_Poe (sprite_main.h) — census's 'Poe/Ghini' was a malformed dual-guess.
    id: 'actor-067',
    gameId: { spriteType: 25 },
    kind: 'enemy',
    randomizerName: 'Poe',
  },
  {
    // Sprite_20_Sluggula (sprite_main.h).
    id: 'actor-068',
    gameId: { spriteType: 32 },
    kind: 'enemy',
    randomizerName: 'Sluggula',
  },
  {
    // Sprite_22_Ropa (sprite_main.h) — census's 'HoppingBulbPlan' was a wrong, truncated guess.
    id: 'actor-069',
    gameId: { spriteType: 34 },
    kind: 'enemy',
    randomizerName: 'Ropa',
  },
  {
    // Sprite_23_RedBari (sprite_main.h) — census misspelled 'Bari' as 'Miri'.
    id: 'actor-070',
    gameId: { spriteType: 35 },
    kind: 'enemy',
    randomizerName: 'Red Bari',
  },
  {
    // spriteType 0x24 dispatches to the SAME Sprite_23_RedBari handler as 0x23
    // (sprite_main.c:502-503) — a color-variant of the same enemy, not a
    // separate function; renamed to match ('Bari' not 'Miri').
    id: 'actor-071',
    gameId: { spriteType: 36 },
    kind: 'enemy',
    randomizerName: 'Blue Bari',
  },
];

export { ENEMY_ACTORS_1 };
