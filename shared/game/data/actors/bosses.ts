/* @layer shared-game @kind data */
/**
 * Boss census — Phase 8 skeleton, from the native sprite-type table
 * (core/zelda3/assets/tables.py's kSpriteNames, ~line 860). Ids continue
 * the deterministic enemy/boss/object sort after enemies.ts.
 *
 * Names are re-derived from the decompilation's own function names in
 * core/zelda3/src/sprite_main.h (tables.py's kSpriteNames mislabels 0x09
 * 'Mouldrum' and 0x18 'Moldorm' — inverted from which one is actually the
 * boss; see actor-137 below). Combat stats are deliberately absent (later
 * deliverable).
 */
import type { ActorRecord } from '../types';

const BOSS_ACTORS: ActorRecord[] = [
  {
    // Tower of Hera boss. tables.py's kSpriteNames swaps this with the common
    // enemy at 0x18 (MiniMoldorm) — the decompilation's own function names
    // disambiguate: Sprite_09_GiantMoldorm (this one) vs Sprite_18_MiniMoldorm
    // (actor-056, enemies.ts). kBossRooms (dungeon.c:20) confirms room 51 is
    // a boss room, consistent with this being the Tower of Hera's boss.
    id: 'actor-137',
    gameId: { spriteType: 9 },
    kind: 'boss',
    randomizerName: 'Moldorm',
  },
  {
    id: 'actor-138',
    gameId: { spriteType: 83 },
    kind: 'boss',
    randomizerName: 'ArmosKnight',
  },
  {
    id: 'actor-139',
    gameId: { spriteType: 84 },
    kind: 'boss',
    randomizerName: 'Lanmolas',
  },
  {
    id: 'actor-140',
    gameId: { spriteType: 122 },
    kind: 'boss',
    randomizerName: 'Agahnim',
  },
  {
    id: 'actor-141',
    gameId: { spriteType: 136 },
    kind: 'boss',
    randomizerName: 'Mothula',
  },
  {
    id: 'actor-142',
    gameId: { spriteType: 140 },
    kind: 'boss',
    randomizerName: 'Arrghus',
  },
  {
    // Sprite_92_HelmasaurKing (sprite_main.h:753).
    id: 'actor-143',
    gameId: { spriteType: 146 },
    kind: 'boss',
    randomizerName: 'Helmasaur King',
  },
  {
    id: 'actor-144',
    gameId: { spriteType: 162 },
    kind: 'boss',
    randomizerName: 'KholdStare',
  },
  {
    // Sprite_BD_Vitreous (sprite_main.h:727) — census had a typo ('Viterous').
    id: 'actor-145',
    gameId: { spriteType: 189 },
    kind: 'boss',
    randomizerName: 'Vitreous',
  },
  {
    // Sprite_CB_TrinexxRockHead (sprite_main.h:649).
    id: 'actor-146',
    gameId: { spriteType: 203 },
    kind: 'boss',
    randomizerName: 'Trinexx (Rock Head)',
  },
  {
    // Sprite_CC calls Sprite_TrinexxFire_AddFireGarnish (sprite_main.c:1550) — the fire head.
    id: 'actor-147',
    gameId: { spriteType: 204 },
    kind: 'boss',
    randomizerName: 'Trinexx (Fire Head)',
  },
  {
    // Third Trinexx head, by elimination from Rock (0xCB) and Fire (0xCC).
    id: 'actor-148',
    gameId: { spriteType: 205 },
    kind: 'boss',
    randomizerName: 'Trinexx (Ice Head)',
  },
  {
    id: 'actor-149',
    gameId: { spriteType: 206 },
    kind: 'boss',
    randomizerName: 'Blind',
  },
  {
    id: 'actor-150',
    gameId: { spriteType: 214 },
    kind: 'boss',
    randomizerName: 'Ganon',
  },
];

export { BOSS_ACTORS };
