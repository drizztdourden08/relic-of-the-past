/* @layer shared-game @kind data */

import type { ActorRecord } from '@shared/game/data/types';

const BOSSES_ACTORS: ActorRecord[] = [
  {
    // Boss of the mountain tower dungeon. tables.py's kSpriteNames swaps this
    // with the common enemy at 0x18 (MiniMoldorm). The decompilation's own
    // function names disambiguate: Sprite_09_GiantMoldorm (this one) vs
    // Sprite_18_MiniMoldorm (actor-056, enemies.ts). kBossRooms (dungeon.c:20)
    // confirms room 51 is a boss room, consistent with that dungeon's boss.
    id: 'actor-137',
    gameId: { spriteType: 9 },
    kind: 'boss',
    name: 'Moldorm',
  },
  {
    id: 'actor-138',
    gameId: { spriteType: 83 },
    kind: 'boss',
    name: 'ArmosKnight',
  },
  {
    id: 'actor-139',
    gameId: { spriteType: 84 },
    kind: 'boss',
    name: 'Lanmolas',
  },
  {
    id: 'actor-140',
    gameId: { spriteType: 122 },
    kind: 'boss',
    name: 'Agahnim',
  },
  {
    id: 'actor-141',
    gameId: { spriteType: 136 },
    kind: 'boss',
    name: 'Mothula',
  },
  {
    id: 'actor-142',
    gameId: { spriteType: 140 },
    kind: 'boss',
    name: 'Arrghus',
  },
  {
    // Sprite_92_HelmasaurKing (sprite_main.h:753).
    id: 'actor-143',
    gameId: { spriteType: 146 },
    kind: 'boss',
    name: 'Helmasaur King',
  },
  {
    id: 'actor-144',
    gameId: { spriteType: 162 },
    kind: 'boss',
    name: 'KholdStare',
  },
  {
    // The census had a typo ('Viterous') for Sprite_BD_Vitreous (sprite_main.h:727).
    id: 'actor-145',
    gameId: { spriteType: 189 },
    kind: 'boss',
    name: 'Vitreous',
  },
  {
    // Sprite_CB_TrinexxRockHead (sprite_main.h:649).
    id: 'actor-146',
    gameId: { spriteType: 203 },
    kind: 'boss',
    name: 'Trinexx (Rock Head)',
  },
  {
    // Sprite_CC calls Sprite_TrinexxFire_AddFireGarnish (sprite_main.c:1550), so it is the fire head.
    id: 'actor-147',
    gameId: { spriteType: 204 },
    kind: 'boss',
    name: 'Trinexx (Fire Head)',
  },
  {
    // Third Trinexx head, by elimination from Rock (0xCB) and Fire (0xCC).
    id: 'actor-148',
    gameId: { spriteType: 205 },
    kind: 'boss',
    name: 'Trinexx (Ice Head)',
  },
  {
    id: 'actor-149',
    gameId: { spriteType: 206 },
    kind: 'boss',
    name: 'Blind',
  },
  {
    id: 'actor-150',
    gameId: { spriteType: 214 },
    kind: 'boss',
    name: 'Ganon',
  },
];

export { BOSSES_ACTORS };
