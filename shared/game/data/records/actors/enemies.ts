/* @layer shared-game @kind data */

import type { ActorRecord } from '@shared/game/data/types';

const ENEMIES_ACTORS: ActorRecord[] = [
  {
    id: 'actor-053',
    gameId: { spriteType: 0 },
    kind: 'enemy',
    name: 'Raven',
  },
  {
    id: 'actor-054',
    gameId: { spriteType: 1 },
    kind: 'enemy',
    name: 'Vulture',
  },
  {
    id: 'actor-055',
    gameId: { spriteType: 8 },
    kind: 'enemy',
    name: 'Octorok',
  },
  {
    // Sprite_18_MiniMoldorm (sprite_main.h:385) was swapped with actor-137
    // (the boss), which wrongly held this spriteType. See bosses.ts.
    id: 'actor-056',
    gameId: { spriteType: 24 },
    kind: 'enemy',
    name: 'Mini Moldorm',
  },
  {
    id: 'actor-057',
    gameId: { spriteType: 10 },
    kind: 'enemy',
    name: '4WayOctorok',
  },
  {
    // Sprite_0B_Cucco (sprite_main.h).
    id: 'actor-058',
    gameId: { spriteType: 11 },
    kind: 'enemy',
    name: 'Cucco',
  },
  {
    // Sprite_0D_Buzzblob (sprite_main.h).
    id: 'actor-059',
    gameId: { spriteType: 13 },
    kind: 'enemy',
    name: 'Buzzblob',
  },
  {
    id: 'actor-060',
    gameId: { spriteType: 14 },
    kind: 'enemy',
    name: 'SnapDragon',
  },
  {
    // Sprite_0F_Octoballoon (sprite_main.h).
    id: 'actor-061',
    gameId: { spriteType: 15 },
    kind: 'enemy',
    name: 'Octoballoon',
  },
  {
    id: 'actor-062',
    gameId: { spriteType: 17 },
    kind: 'enemy',
    name: 'Hinox',
  },
  {
    // The census's 'PigSpearMan' was a truncated, wrong guess for Sprite_12_Moblin (sprite_main.h).
    id: 'actor-063',
    gameId: { spriteType: 18 },
    kind: 'enemy',
    name: 'Moblin',
  },
  {
    id: 'actor-064',
    gameId: { spriteType: 19 },
    kind: 'enemy',
    name: 'MiniHelmasaur',
  },
  {
    id: 'actor-065',
    gameId: { spriteType: 21 },
    kind: 'enemy',
    name: 'Bubble',
  },
  {
    // Sprite_17_Hoarder (sprite_main.h) is a covered rupee-hoarding crab (CoveredRupeeCrab_Draw).
    id: 'actor-066',
    gameId: { spriteType: 23 },
    kind: 'enemy',
    name: 'Hoarder',
  },
  {
    // The census's 'Poe/Ghini' was a malformed dual-guess for Sprite_19_Poe (sprite_main.h).
    id: 'actor-067',
    gameId: { spriteType: 25 },
    kind: 'enemy',
    name: 'Poe',
  },
  {
    // Sprite_20_Sluggula (sprite_main.h).
    id: 'actor-068',
    gameId: { spriteType: 32 },
    kind: 'enemy',
    name: 'Sluggula',
  },
  {
    // The census's 'HoppingBulbPlan' was a wrong, truncated guess for Sprite_22_Ropa (sprite_main.h).
    id: 'actor-069',
    gameId: { spriteType: 34 },
    kind: 'enemy',
    name: 'Ropa',
  },
  {
    // The census misspelled 'Bari' as 'Miri' for Sprite_23_RedBari (sprite_main.h).
    id: 'actor-070',
    gameId: { spriteType: 35 },
    kind: 'enemy',
    name: 'Red Bari',
  },
  {
    // spriteType 0x24 dispatches to the SAME Sprite_23_RedBari handler as 0x23
    // (sprite_main.c:502-503). It is a color variant of the same enemy, not a
    // separate function, so it is renamed to match ('Bari' not 'Miri').
    id: 'actor-071',
    gameId: { spriteType: 36 },
    kind: 'enemy',
    name: 'Blue Bari',
  },
  {
    // Sprite_25_TalkingTree (sprite_main.h).
    id: 'actor-072',
    gameId: { spriteType: 37 },
    kind: 'enemy',
    name: 'TalkingTree',
  },
  {
    id: 'actor-073',
    gameId: { spriteType: 41 },
    kind: 'enemy',
    name: 'Thief',
  },
  {
    id: 'actor-074',
    gameId: { spriteType: 62 },
    kind: 'enemy',
    name: 'RockCrab',
  },
  {
    id: 'actor-075',
    gameId: { spriteType: 63 },
    kind: 'enemy',
    name: 'PalaceGuard',
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
    name: 'Blue Guard',
  },
  {
    id: 'actor-077',
    gameId: { spriteType: 66 },
    kind: 'enemy',
    name: 'GreenSoldier',
  },
  {
    id: 'actor-078',
    gameId: { spriteType: 67 },
    kind: 'enemy',
    name: 'RedSpearSoldier',
  },
  {
    id: 'actor-079',
    gameId: { spriteType: 68 },
    kind: 'enemy',
    name: 'Warrior',
  },
  {
    id: 'actor-080',
    gameId: { spriteType: 69 },
    kind: 'enemy',
    name: 'HogSpearMan',
  },
  {
    id: 'actor-081',
    gameId: { spriteType: 70 },
    kind: 'enemy',
    name: 'BlueArcher',
  },
  {
    // The census's 'GreenGrassArche' was truncated and wrong for Sprite_47_GreenBushGuard
    // (sprite_main.h). It guessed 'archer'; the real mechanic is an ambush soldier in a bush.
    id: 'actor-082',
    gameId: { spriteType: 71 },
    kind: 'enemy',
    name: 'Green Bush Guard',
  },
  {
    // Sprite_48_RedJavelinGuard (sprite_main.h).
    id: 'actor-083',
    gameId: { spriteType: 72 },
    kind: 'enemy',
    name: 'Red Javelin Guard',
  },
  {
    // The census's 'RedGrassSpearSo' was a truncated name for Sprite_49_RedBushGuard (sprite_main.h).
    id: 'actor-084',
    gameId: { spriteType: 73 },
    kind: 'enemy',
    name: 'Red Bush Guard',
  },
  {
    // Sprite_4A_BombGuard (sprite_main.h).
    id: 'actor-085',
    gameId: { spriteType: 74 },
    kind: 'enemy',
    name: 'Bomb Guard',
  },
  {
    // Sprite_4B_GreenKnifeGuard (sprite_main.h).
    id: 'actor-086',
    gameId: { spriteType: 75 },
    kind: 'enemy',
    name: 'Green Knife Guard',
  },
  {
    id: 'actor-087',
    gameId: { spriteType: 76 },
    kind: 'enemy',
    name: 'Geldman',
  },
  {
    id: 'actor-088',
    gameId: { spriteType: 78 },
    kind: 'enemy',
    name: 'Tentacle2',
  },
  {
    id: 'actor-089',
    gameId: { spriteType: 79 },
    kind: 'enemy',
    name: 'Tentacle',
  },
  {
    id: 'actor-090',
    gameId: { spriteType: 81 },
    kind: 'enemy',
    name: 'Armos',
  },
  {
    id: 'actor-091',
    gameId: { spriteType: 85 },
    kind: 'enemy',
    name: 'FireBallZora',
  },
  {
    id: 'actor-092',
    gameId: { spriteType: 86 },
    kind: 'enemy',
    name: 'WalkingZora',
  },
  {
    id: 'actor-093',
    gameId: { spriteType: 88 },
    kind: 'enemy',
    name: 'Crab',
  },
  {
    // Sprite_5B_Spark_Clockwise (sprite_main.h) is a wall-crawling spark, not a "bubble".
    id: 'actor-094',
    gameId: { spriteType: 91 },
    kind: 'enemy',
    name: 'Spark (Clockwise)',
  },
  {
    // spriteType 0x5C dispatches to the SAME Sprite_5B_Spark_Clockwise handler
    // (sprite_main.c:559-560). It is the counter-clockwise variant of that sprite.
    id: 'actor-095',
    gameId: { spriteType: 92 },
    kind: 'enemy',
    name: 'Spark (Counter-Clockwise)',
  },
  {
    id: 'actor-096',
    gameId: { spriteType: 97 },
    kind: 'enemy',
    name: 'Beamos',
  },
  {
    id: 'actor-097',
    gameId: { spriteType: 99 },
    kind: 'enemy',
    name: 'SandCrab1',
  },
  {
    id: 'actor-098',
    gameId: { spriteType: 100 },
    kind: 'enemy',
    name: 'SandCrab2',
  },
  {
    // Sprite_6A_BallNChain (sprite_main.h).
    id: 'actor-099',
    gameId: { spriteType: 106 },
    kind: 'enemy',
    name: 'Ball N Chain',
  },
  {
    // Sprite_6B_CannonTrooper (sprite_main.h).
    id: 'actor-100',
    gameId: { spriteType: 107 },
    kind: 'enemy',
    name: 'Cannon Trooper',
  },
  {
    id: 'actor-101',
    gameId: { spriteType: 109 },
    kind: 'enemy',
    name: 'Rat',
  },
  {
    id: 'actor-102',
    gameId: { spriteType: 110 },
    kind: 'enemy',
    name: 'Rope',
  },
  {
    id: 'actor-103',
    gameId: { spriteType: 111 },
    kind: 'enemy',
    name: 'Keese',
  },
  {
    id: 'actor-104',
    gameId: { spriteType: 113 },
    kind: 'enemy',
    name: 'Leever',
  },
  {
    // Spelling fix only. No decompilation ground truth found for this spriteType.
    id: 'actor-105',
    gameId: { spriteType: 119 },
    kind: 'enemy',
    name: 'WeirdBubble',
  },
  {
    id: 'actor-106',
    gameId: { spriteType: 121 },
    kind: 'enemy',
    name: 'Bee',
  },
  {
    // Sprite_7C_GreenStalfos (sprite_main.h).
    id: 'actor-107',
    gameId: { spriteType: 124 },
    kind: 'enemy',
    name: 'Green Stalfos',
  },
  {
    // Sprite_80_Firesnake (sprite_main.h). The census's 'Lanmola' wrongly reused the
    // boss's name (actor-139, spriteType 84); this is a different, common enemy.
    id: 'actor-108',
    gameId: { spriteType: 128 },
    kind: 'enemy',
    name: 'Firesnake',
  },
  {
    // Sprite_81_Hover (sprite_main.h).
    id: 'actor-109',
    gameId: { spriteType: 129 },
    kind: 'enemy',
    name: 'Hover',
  },
  {
    id: 'actor-110',
    gameId: { spriteType: 130 },
    kind: 'enemy',
    name: '4Bubbles',
  },
  {
    // Sprite_83_GreenEyegore (sprite_main.h).
    id: 'actor-111',
    gameId: { spriteType: 131 },
    kind: 'enemy',
    name: 'Green Eyegore',
  },
  {
    id: 'actor-112',
    gameId: { spriteType: 132 },
    kind: 'enemy',
    name: 'RedRocklops',
  },
  {
    // Sprite_86_Kodongo (sprite_main.h). The census's 'Triceritops' was an appearance-based
    // guess at an unrelated dinosaur; the real decompiled enemy is Kodongo.
    id: 'actor-113',
    gameId: { spriteType: 134 },
    kind: 'enemy',
    name: 'Kodongo',
  },
  {
    // Sprite_87_KodongoFire (sprite_main.h) is the fire-breathing Kodongo variant, not a Keese.
    id: 'actor-114',
    gameId: { spriteType: 135 },
    kind: 'enemy',
    name: 'Kodongo (Fire)',
  },
  {
    id: 'actor-115',
    gameId: { spriteType: 139 },
    kind: 'enemy',
    name: 'Gibdo',
  },
  {
    // Sprite_8D_Arrghi (sprite_main.h) is the fuzzball Arrghus spawns/throws.
    id: 'actor-116',
    gameId: { spriteType: 141 },
    kind: 'enemy',
    name: 'Arrghi',
  },
  {
    // Sprite_8E_Terrorpin (sprite_main.h).
    id: 'actor-117',
    gameId: { spriteType: 142 },
    kind: 'enemy',
    name: 'Terrorpin',
  },
  {
    id: 'actor-118',
    gameId: { spriteType: 143 },
    kind: 'enemy',
    name: 'Blob',
  },
  {
    id: 'actor-119',
    gameId: { spriteType: 144 },
    kind: 'enemy',
    name: 'WallMaster',
  },
  {
    id: 'actor-120',
    gameId: { spriteType: 145 },
    kind: 'enemy',
    name: 'StalfosKnight',
  },
  {
    id: 'actor-121',
    gameId: { spriteType: 155 },
    kind: 'enemy',
    name: 'Wizzrobe',
  },
  {
    id: 'actor-122',
    gameId: { spriteType: 157 },
    kind: 'enemy',
    name: 'VRat',
  },
  {
    id: 'actor-123',
    gameId: { spriteType: 160 },
    kind: 'enemy',
    name: 'Uglybird',
  },
  {
    // Sprite_A1_Freezor (sprite_main.h).
    id: 'actor-124',
    gameId: { spriteType: 161 },
    kind: 'enemy',
    name: 'Freezor',
  },
  {
    id: 'actor-125',
    gameId: { spriteType: 165 },
    kind: 'enemy',
    name: 'GreenLizard',
  },
  {
    id: 'actor-126',
    gameId: { spriteType: 166 },
    kind: 'enemy',
    name: 'RedLizard',
  },
  {
    id: 'actor-127',
    gameId: { spriteType: 167 },
    kind: 'enemy',
    name: 'Stalfos',
  },
  {
    // Sprite_A8_GreenZirro (sprite_main.h).
    id: 'actor-128',
    gameId: { spriteType: 168 },
    kind: 'enemy',
    name: 'Green Zirro',
  },
  {
    id: 'actor-129',
    gameId: { spriteType: 169 },
    kind: 'enemy',
    name: 'BlueAirBomber',
  },
  {
    // Sprite_AA_Pikit (sprite_main.h) is an item-stealing thief creature, not a Like Like.
    id: 'actor-130',
    gameId: { spriteType: 170 },
    kind: 'enemy',
    name: 'Pikit',
  },
  {
    // Sprite_C3_Gibo (sprite_main.h).
    id: 'actor-131',
    gameId: { spriteType: 195 },
    kind: 'enemy',
    name: 'Gibo',
  },
  {
    // Sprite_C7_Pokey (sprite_main.h) is the cactus enemy.
    id: 'actor-132',
    gameId: { spriteType: 199 },
    kind: 'enemy',
    name: 'Pokey',
  },
  {
    id: 'actor-133',
    gameId: { spriteType: 201 },
    kind: 'enemy',
    name: 'Tektite',
  },
  {
    id: 'actor-134',
    gameId: { spriteType: 202 },
    kind: 'enemy',
    name: 'Chomp',
  },
  {
    // Sprite_CF_Swamola (sprite_main.h).
    id: 'actor-135',
    gameId: { spriteType: 207 },
    kind: 'enemy',
    name: 'Swamola',
  },
  {
    id: 'actor-136',
    gameId: { spriteType: 208 },
    kind: 'enemy',
    name: 'Lynel',
  },
  {
    // Sprite_26_HardhatBeetle (sprite_main.h) is an enemy, not scenery: it damages the
    // player character on contact. Reclassified from 'object'. Kept in this file instead
    // of enemies.ts to bound the diff; a follow-up should relocate it.
    id: 'actor-163',
    gameId: { spriteType: 38 },
    kind: 'enemy',
    name: 'Hardhat Beetle',
  },
  {
    // Sprite_27_Deadrock (sprite_main.h) is an enemy, not a squirrel. Reclassified from
    // 'object'; see actor-163's note on file location.
    id: 'actor-164',
    gameId: { spriteType: 39 },
    kind: 'enemy',
    name: 'Deadrock',
  },
  {
    // Sprite_85_YellowStalfos (sprite_main.h) is an enemy, not a spike block. The census
    // copy-pasted 'BigSpikeBlock' from actor-203 for a different sprite.
    // Reclassified from 'object'.
    id: 'actor-206',
    gameId: { spriteType: 133 },
    kind: 'enemy',
    name: 'Yellow Stalfos',
  },
  {
    // Sprite_99_Pengator (sprite_main.h) is an enemy, not scenery. Reclassified from
    // 'object'; see actor-163's note on file location.
    id: 'actor-213',
    gameId: { spriteType: 153 },
    kind: 'enemy',
    name: 'Pengator',
  },
  {
    // Sprite_C5_Medusa (sprite_main.h) is an enemy, a stone head that shoots at the player
    // character, not a generic 'Shooter' fixture. Reclassified from 'object'.
    id: 'actor-236',
    gameId: { spriteType: 197 },
    kind: 'enemy',
    name: 'Medusa',
  },
];

export { ENEMIES_ACTORS };
