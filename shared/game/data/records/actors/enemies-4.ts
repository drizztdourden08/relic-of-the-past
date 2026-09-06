/* @layer shared-game @kind data */
/** Enemy census, part 4 of 4 (size split); see enemies-1.ts for context. */
import type { ActorRecord } from '@shared/game/data/types';

const ENEMY_ACTORS_4: ActorRecord[] = [
  {
    id: 'actor-115',
    gameId: { spriteType: 139 },
    kind: 'enemy',
    randomizerName: 'Gibdo',
  },
  {
    // Sprite_8D_Arrghi (sprite_main.h) is the fuzzball Arrghus spawns/throws.
    id: 'actor-116',
    gameId: { spriteType: 141 },
    kind: 'enemy',
    randomizerName: 'Arrghi',
  },
  {
    // Sprite_8E_Terrorpin (sprite_main.h).
    id: 'actor-117',
    gameId: { spriteType: 142 },
    kind: 'enemy',
    randomizerName: 'Terrorpin',
  },
  {
    id: 'actor-118',
    gameId: { spriteType: 143 },
    kind: 'enemy',
    randomizerName: 'Blob',
  },
  {
    id: 'actor-119',
    gameId: { spriteType: 144 },
    kind: 'enemy',
    randomizerName: 'WallMaster',
  },
  {
    id: 'actor-120',
    gameId: { spriteType: 145 },
    kind: 'enemy',
    randomizerName: 'StalfosKnight',
  },
  {
    id: 'actor-121',
    gameId: { spriteType: 155 },
    kind: 'enemy',
    randomizerName: 'Wizzrobe',
  },
  {
    id: 'actor-122',
    gameId: { spriteType: 157 },
    kind: 'enemy',
    randomizerName: 'VRat',
  },
  {
    id: 'actor-123',
    gameId: { spriteType: 160 },
    kind: 'enemy',
    randomizerName: 'Uglybird',
  },
  {
    // Sprite_A1_Freezor (sprite_main.h).
    id: 'actor-124',
    gameId: { spriteType: 161 },
    kind: 'enemy',
    randomizerName: 'Freezor',
  },
  {
    id: 'actor-125',
    gameId: { spriteType: 165 },
    kind: 'enemy',
    randomizerName: 'GreenLizard',
  },
  {
    id: 'actor-126',
    gameId: { spriteType: 166 },
    kind: 'enemy',
    randomizerName: 'RedLizard',
  },
  {
    id: 'actor-127',
    gameId: { spriteType: 167 },
    kind: 'enemy',
    randomizerName: 'Stalfos',
  },
  {
    // Sprite_A8_GreenZirro (sprite_main.h).
    id: 'actor-128',
    gameId: { spriteType: 168 },
    kind: 'enemy',
    randomizerName: 'Green Zirro',
  },
  {
    id: 'actor-129',
    gameId: { spriteType: 169 },
    kind: 'enemy',
    randomizerName: 'BlueAirBomber',
  },
  {
    // Sprite_AA_Pikit (sprite_main.h) is an item-stealing thief creature, not a Like Like.
    id: 'actor-130',
    gameId: { spriteType: 170 },
    kind: 'enemy',
    randomizerName: 'Pikit',
  },
  {
    // Sprite_C3_Gibo (sprite_main.h).
    id: 'actor-131',
    gameId: { spriteType: 195 },
    kind: 'enemy',
    randomizerName: 'Gibo',
  },
  {
    // Sprite_C7_Pokey (sprite_main.h) is the cactus enemy.
    id: 'actor-132',
    gameId: { spriteType: 199 },
    kind: 'enemy',
    randomizerName: 'Pokey',
  },
  {
    id: 'actor-133',
    gameId: { spriteType: 201 },
    kind: 'enemy',
    randomizerName: 'Tektite',
  },
  {
    id: 'actor-134',
    gameId: { spriteType: 202 },
    kind: 'enemy',
    randomizerName: 'Chomp',
  },
  {
    // Sprite_CF_Swamola (sprite_main.h).
    id: 'actor-135',
    gameId: { spriteType: 207 },
    kind: 'enemy',
    randomizerName: 'Swamola',
  },
  {
    id: 'actor-136',
    gameId: { spriteType: 208 },
    kind: 'enemy',
    randomizerName: 'Lynel',
  },
];

export { ENEMY_ACTORS_4 };
