/* @layer shared-game @kind data */
import type { ItemId } from '@rotp/game-data';

const ITEM = {
  fighterSword: 'item-074', masterSword: 'item-002', temperedSword: 'item-003',
  goldenSword: 'item-004', progressiveSword: 'item-079',
  blueShield: 'item-005', redShield: 'item-006', mirrorShield: 'item-007',
  progressiveShield: 'item-080',
  blueMail: 'item-035', redMail: 'item-036', progressiveMail: 'item-081',
  powerGlove: 'item-028', titansMitts: 'item-029', progressiveGlove: 'item-082',
  bow: 'item-012', silverBow: 'item-060', progressiveBow: 'item-083',
  progressiveBowAlt: 'item-172',
  fireRod: 'item-008', iceRod: 'item-009', caneOfSomaria: 'item-022', caneOfByrna: 'item-025',
  cape: 'item-026', magicPowder: 'item-014', lamp: 'item-019',
  bombos: 'item-016', ether: 'item-017', quake: 'item-018',
  hammer: 'item-010', hookshot: 'item-011', shovel: 'item-020', flute: 'item-021', activatedFlute: 'item-075',
  progressiveOcarina: 'item-179',
  flippers: 'item-031', moonPearl: 'item-032', bugCatchingNet: 'item-034',
  bookOfMudora: 'item-030', magicMirror: 'item-027', mushroom: 'item-042',
  pegasusBoots: 'item-076', blueBoomerang: 'item-013', redBoomerang: 'item-043',
  bottle: 'item-023', bottleRedPotion: 'item-044', bottleGreenPotion: 'item-045',
  bottleBluePotion: 'item-046', bottleBee: 'item-061', bottleFairy: 'item-062',
  bottleGoodBee: 'item-073',
  redPotion: 'item-047', greenPotion: 'item-048', bluePotion: 'item-049', bee: 'item-015',
  heartContainer: 'item-039', bossHeartContainer: 'item-063',
  sanctuaryHeartContainer: 'item-064', pieceOfHeart: 'item-024',
  magicUpgradeHalf: 'item-077', magicUpgradeQuarter: 'item-135',
  bombUpgradePlus5: 'item-132', bombUpgradePlus10: 'item-133', bombUpgrade50: 'item-134',
  arrowUpgradePlus5: 'item-129', arrowUpgradePlus10: 'item-130', arrowUpgrade70: 'item-131',
  singleArrow: 'item-068', arrows10: 'item-069', bombs3: 'item-041', bombs10: 'item-050',
  rupee1: 'item-053', rupees5: 'item-054', rupees20: 'item-055', rupees50: 'item-066',
  rupees100: 'item-065', rupees300: 'item-071',
  smallKey: 'item-037', bigKey: 'item-051', map: 'item-052', compass: 'item-038',
  smallKeyHyruleCastle: 'item-096', bigKeyHyruleCastle: 'item-095',
  smallKeyAgahnimsTower: 'item-099',
  smallKeyEasternPalace: 'item-097', bigKeyEasternPalace: 'item-094',
  smallKeyDesertPalace: 'item-098', bigKeyDesertPalace: 'item-093',
  smallKeyTowerOfHera: 'item-105', bigKeyTowerOfHera: 'item-087',
  smallKeyPalaceOfDarkness: 'item-101', bigKeyPalaceOfDarkness: 'item-091',
  smallKeySwampPalace: 'item-100', bigKeySwampPalace: 'item-092',
  smallKeySkullWoods: 'item-103', bigKeySkullWoods: 'item-089',
  smallKeyThievesTown: 'item-106', bigKeyThievesTown: 'item-086',
  smallKeyIcePalace: 'item-104', bigKeyIcePalace: 'item-088',
  smallKeyMiseryMire: 'item-102', bigKeyMiseryMire: 'item-090',
  smallKeyTurtleRock: 'item-107', bigKeyTurtleRock: 'item-085',
  smallKeyGanonsTower: 'item-108', bigKeyGanonsTower: 'item-084',
  greenPendant: 'item-056', redPendant: 'item-057', bluePendant: 'item-058',
  crystal1: 'item-112', crystal2: 'item-113', crystal3: 'item-114', crystal4: 'item-115',
  crystal5: 'item-116', crystal6: 'item-117', crystal7: 'item-118',
  triforcePiece: 'item-174', powerStar: 'item-169',
} as const satisfies Record<string, ItemId>;

const UNRECORDED_PREFIX = 'unrecorded-';

const UNRECORDED = {
  quiver: 'unrecorded-Quiver',
} as const;

export { ITEM, UNRECORDED, UNRECORDED_PREFIX };
