/* @layer shared-game @kind data */
/** Enemy census, part 2 of 4 (size split); see enemies-1.ts for context. */
import type { ActorRecord } from '../types';

const ENEMY_ACTORS_2: ActorRecord[] = [
  {
    // Sprite_25_TalkingTree (sprite_main.h).
    id: 'actor-072',
    gameId: { spriteType: 37 },
    kind: 'enemy',
    randomizerName: 'TalkingTree',
  },
  {
    id: 'actor-073',
    gameId: { spriteType: 41 },
    kind: 'enemy',
    randomizerName: 'Thief',
  },
  {
    id: 'actor-074',
    gameId: { spriteType: 62 },
    kind: 'enemy',
    randomizerName: 'RockCrab',
  },
  {
    id: 'actor-075',
    gameId: { spriteType: 63 },
    kind: 'enemy',
    randomizerName: 'PalaceGuard',
    combat: {
      health: 255,
      flags4: 0,
      damageByClass: {
        '0': 0,
        '1': 0,
        '2': 64,
        '3': 8,
        '4': 16,
        '5': 16,
        '6': 4,
        '7': 255,
        '8': 4,
        '9': 100,
        '10': 0,
        '11': 8,
        '12': 8,
        '13': 16,
        '14': 254,
        '15': 32,
      },
    },
  },
  {
    // Sprite_41_BlueGuard (sprite_main.h).
    id: 'actor-076',
    gameId: { spriteType: 65 },
    kind: 'enemy',
    randomizerName: 'Blue Guard',
  },
  {
    id: 'actor-077',
    gameId: { spriteType: 66 },
    kind: 'enemy',
    randomizerName: 'GreenSoldier',
  },
  {
    id: 'actor-078',
    gameId: { spriteType: 67 },
    kind: 'enemy',
    randomizerName: 'RedSpearSoldier',
  },
  {
    id: 'actor-079',
    gameId: { spriteType: 68 },
    kind: 'enemy',
    randomizerName: 'Warrior',
  },
  {
    id: 'actor-080',
    gameId: { spriteType: 69 },
    kind: 'enemy',
    randomizerName: 'HogSpearMan',
  },
  {
    id: 'actor-081',
    gameId: { spriteType: 70 },
    kind: 'enemy',
    randomizerName: 'BlueArcher',
  },
  {
    // Sprite_47_GreenBushGuard (sprite_main.h) — census's 'GreenGrassArche' was truncated
    // and wrong ('archer' guess; the real mechanic is an ambush soldier hiding in a bush).
    id: 'actor-082',
    gameId: { spriteType: 71 },
    kind: 'enemy',
    randomizerName: 'Green Bush Guard',
  },
  {
    // Sprite_48_RedJavelinGuard (sprite_main.h).
    id: 'actor-083',
    gameId: { spriteType: 72 },
    kind: 'enemy',
    randomizerName: 'Red Javelin Guard',
  },
  {
    // Sprite_49_RedBushGuard (sprite_main.h) — census's 'RedGrassSpearSo' was truncated.
    id: 'actor-084',
    gameId: { spriteType: 73 },
    kind: 'enemy',
    randomizerName: 'Red Bush Guard',
  },
  {
    // Sprite_4A_BombGuard (sprite_main.h).
    id: 'actor-085',
    gameId: { spriteType: 74 },
    kind: 'enemy',
    randomizerName: 'Bomb Guard',
  },
  {
    // Sprite_4B_GreenKnifeGuard (sprite_main.h).
    id: 'actor-086',
    gameId: { spriteType: 75 },
    kind: 'enemy',
    randomizerName: 'Green Knife Guard',
  },
  {
    id: 'actor-087',
    gameId: { spriteType: 76 },
    kind: 'enemy',
    randomizerName: 'Geldman',
  },
  {
    id: 'actor-088',
    gameId: { spriteType: 78 },
    kind: 'enemy',
    randomizerName: 'Tentacle2',
  },
  {
    id: 'actor-089',
    gameId: { spriteType: 79 },
    kind: 'enemy',
    randomizerName: 'Tentacle',
  },
  {
    id: 'actor-090',
    gameId: { spriteType: 81 },
    kind: 'enemy',
    randomizerName: 'Armos',
  },
  {
    id: 'actor-091',
    gameId: { spriteType: 85 },
    kind: 'enemy',
    randomizerName: 'FireBallZora',
  },
  {
    id: 'actor-092',
    gameId: { spriteType: 86 },
    kind: 'enemy',
    randomizerName: 'WalkingZora',
  },
  {
    id: 'actor-093',
    gameId: { spriteType: 88 },
    kind: 'enemy',
    randomizerName: 'Crab',
  },
];

export { ENEMY_ACTORS_2 };
