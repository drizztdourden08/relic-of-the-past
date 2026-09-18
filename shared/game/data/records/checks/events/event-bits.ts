/* @layer shared-game @kind data */
/**
 * The event ledger's bit indexes, mirrored from core/game-hooks/events/event_ids.h. The
 * order there is frozen, so these numbers are save-file facts; a new event is appended
 * at the end of both. Boss and prize bits are indexed by the game's palace index.
 */

const EVENT_BIT = {
  bossKilled: (palace: number): number => palace,
  rematchArmos: 14, rematchLanmolas: 15, rematchMoldorm: 16,
  ganonBeaten: 17, gameCompleted: 18,
  prizeTaken: (palace: number): number => 19 + palace,
  oldManRescued: 33, magicBat: 34, powderBag: 35, shovelFromStump: 36,
  sahasrahlaGift: 37, sahasrahlaMapHint: 38, temperingPaid: 39, temperedSwordCollected: 40,
  zeldaFreed: 41, shelfPushed: 42, agahnimAltar: 43, firstDarkWorld: 44, desertPrayer: 45,
  followerKiki: 46, followerBigBomb: 47, followerFrog: 48, followerOldMan: 49, followerMaiden: 50, followerPurpleChest: 51,
  fairyLakeHylia: 52, fairySwamp: 53, fairyDesert: 54, fairyBonkLight: 55, fairyBonkDark: 56,
  fairyDarkLakeHylia: 57, fairyDarkLakeHyliaLedge: 58, fairyDarkDesert: 59, fairyDarkDeathMountain: 60,
  areaDeathMountain: 61, areaEastDeathMountain: 62, areaMimicLedge: 63, areaDeathMountainEntrance: 64,
  areaCastleGrounds: 65, areaDesert: 66, areaLakeHylia: 67, areaPedestalMeadow: 68, areaZorasDomain: 69,
  areaEastDarkWorld: 70, areaNorthEastDarkWorld: 71, areaCatfish: 72, areaWestDarkWorld: 73, areaSouthDarkWorld: 74,
  areaDarkLakeHylia: 75, areaDarkDesert: 76, areaSkullWoods: 77, areaBumperCave: 78,
  areaDarkDeathMountainWest: 79, areaDarkDeathMountainEast: 80, areaTurtleRockTop: 81,
  areaDeathMountainTop: 82, areaEastDeathMountainTop: 83, areaLakeHyliaIsland: 84, areaCastleTerrace: 85,
  areaDesertPalaceStairs: 86, areaDarkDeathMountainTop: 87, areaPyramidLedge: 88, areaDarkLakeHyliaIsland: 89,
  skullWoodsEntrance: (n: number): number => 90 + n,
  turtleRockBigChestLedge: 95, turtleRockLaserBridge: 96,
  floodgatePulled: 97,
} as const;

export { EVENT_BIT };
