/* @layer shared-game @kind data */
/** Enemy census, part 3 of 4 (size split); see enemies-1.ts for context. */
import type { ActorRecord } from '@shared/game/data/types';

const ENEMY_ACTORS_3: ActorRecord[] = [
  {
    // Sprite_5B_Spark_Clockwise (sprite_main.h) is a wall-crawling spark, not a "bubble".
    id: 'actor-094',
    gameId: { spriteType: 91 },
    kind: 'enemy',
    randomizerName: 'Spark (Clockwise)',
  },
  {
    // spriteType 0x5C dispatches to the SAME Sprite_5B_Spark_Clockwise handler
    // (sprite_main.c:559-560). It is the counter-clockwise variant of that sprite.
    id: 'actor-095',
    gameId: { spriteType: 92 },
    kind: 'enemy',
    randomizerName: 'Spark (Counter-Clockwise)',
  },
  {
    id: 'actor-096',
    gameId: { spriteType: 97 },
    kind: 'enemy',
    randomizerName: 'Beamos',
  },
  {
    id: 'actor-097',
    gameId: { spriteType: 99 },
    kind: 'enemy',
    randomizerName: 'SandCrab1',
  },
  {
    id: 'actor-098',
    gameId: { spriteType: 100 },
    kind: 'enemy',
    randomizerName: 'SandCrab2',
  },
  {
    // Sprite_6A_BallNChain (sprite_main.h).
    id: 'actor-099',
    gameId: { spriteType: 106 },
    kind: 'enemy',
    randomizerName: 'Ball N Chain',
  },
  {
    // Sprite_6B_CannonTrooper (sprite_main.h).
    id: 'actor-100',
    gameId: { spriteType: 107 },
    kind: 'enemy',
    randomizerName: 'Cannon Trooper',
  },
  {
    id: 'actor-101',
    gameId: { spriteType: 109 },
    kind: 'enemy',
    randomizerName: 'Rat',
  },
  {
    id: 'actor-102',
    gameId: { spriteType: 110 },
    kind: 'enemy',
    randomizerName: 'Rope',
  },
  {
    id: 'actor-103',
    gameId: { spriteType: 111 },
    kind: 'enemy',
    randomizerName: 'Keese',
  },
  {
    id: 'actor-104',
    gameId: { spriteType: 113 },
    kind: 'enemy',
    randomizerName: 'Leever',
  },
  {
    // Spelling fix only. No decompilation ground truth found for this spriteType.
    id: 'actor-105',
    gameId: { spriteType: 119 },
    kind: 'enemy',
    randomizerName: 'WeirdBubble',
  },
  {
    id: 'actor-106',
    gameId: { spriteType: 121 },
    kind: 'enemy',
    randomizerName: 'Bee',
  },
  {
    // Sprite_7C_GreenStalfos (sprite_main.h).
    id: 'actor-107',
    gameId: { spriteType: 124 },
    kind: 'enemy',
    randomizerName: 'Green Stalfos',
  },
  {
    // Sprite_80_Firesnake (sprite_main.h). The census's 'Lanmola' wrongly reused the
    // boss's name (actor-139, spriteType 84); this is a different, common enemy.
    id: 'actor-108',
    gameId: { spriteType: 128 },
    kind: 'enemy',
    randomizerName: 'Firesnake',
  },
  {
    // Sprite_81_Hover (sprite_main.h).
    id: 'actor-109',
    gameId: { spriteType: 129 },
    kind: 'enemy',
    randomizerName: 'Hover',
  },
  {
    id: 'actor-110',
    gameId: { spriteType: 130 },
    kind: 'enemy',
    randomizerName: '4Bubbles',
  },
  {
    // Sprite_83_GreenEyegore (sprite_main.h).
    id: 'actor-111',
    gameId: { spriteType: 131 },
    kind: 'enemy',
    randomizerName: 'Green Eyegore',
  },
  {
    id: 'actor-112',
    gameId: { spriteType: 132 },
    kind: 'enemy',
    randomizerName: 'RedRocklops',
  },
  {
    // Sprite_86_Kodongo (sprite_main.h). The census's 'Triceritops' was an appearance-based
    // guess at an unrelated dinosaur; the real decompiled enemy is Kodongo.
    id: 'actor-113',
    gameId: { spriteType: 134 },
    kind: 'enemy',
    randomizerName: 'Kodongo',
  },
  {
    // Sprite_87_KodongoFire (sprite_main.h) is the fire-breathing Kodongo variant, not a Keese.
    id: 'actor-114',
    gameId: { spriteType: 135 },
    kind: 'enemy',
    randomizerName: 'Kodongo (Fire)',
  },
];

export { ENEMY_ACTORS_3 };
