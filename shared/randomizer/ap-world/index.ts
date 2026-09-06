/* @layer shared-game @kind logic */
/** Barrel for the ported world model (region graph + collection state). */
export { buildWorld } from './build-world';
export { createCollectionState } from './collection-state';
export type { CollectionState } from './collection-state';
export { computeReachableRegions, updateReachableRegions } from './graph';
export { markWorldZones } from './world-zones';
export {
  BASELINE,
  hasSword,
  hasBeamSword,
  hasMeleeWeapon,
  canLiftRocks,
  canLiftHeavyRocks,
  hasFireSource,
  canMeltThings,
  canBuy,
  canBuyUnlimited,
  canHoldArrows,
  canShootArrows,
  canUseBombs,
  canBombOrBonk,
  bottleCount,
  heartCount,
  hasHearts,
  canExtendMagic,
} from './state-helpers';
export {
  isNotBunny,
  canBombClip,
  hasCrystals,
  hasTriforcePieces,
  canActivateCrystalSwitch,
  canKillMostThings,
  canKillStandardStart,
  canGetGoodBee,
  canRetrieveTablet,
  hasMireMedallion,
  hasTurtleRockMedallion,
  canBootsClipLw,
  canBootsClipDw,
  canGetGlitchedSpeedDw,
} from './state-helpers-world';
export {
  ITEM, BOTTLE_ITEMS, CRYSTAL_ITEMS, MEDALLION_ITEMS, PROGRESSION_TIERS, REGION_NAME,
  VANILLA_MEDALLIONS,
} from './item-names.data';
export { AP_DUNGEONS } from './dungeons.data';
export {
  KEY_DROP_LOCATIONS, CAPACITY_UPGRADE_LOCATIONS, EVENT_LOCATIONS, PRIZE_LOCATIONS,
} from './special-locations.data';
export { VANILLA_PRIZES } from './vanilla-prizes.data';
export { registerRules } from './rules/register';
export type { RuleCoverageReport } from './rules/register';
export { canCollectLocation, collectableLocations, sweepEvents } from './rules/collect';
export { buildItemPool } from './pool/build-item-pool';
export type { BottlePicker } from './pool/build-item-pool';
export type { ApItemPool } from './pool/item-pool.type';
export { EVENT_ITEMS, PRIZE_ITEMS, VICTORY_ITEM } from './pool/event-items.data';
export type { Rule, ItemRule, AlwaysAllowRule, ApWorld, ApWorldOptions } from './world.type';
export type {
  ApRegionType,
  ApRegionDef,
  ApConnection,
  ApLocation,
  ApExit,
  ApRegion,
  ApDungeonDef,
} from './region.type';
export { buildFillWorld, fillEligibleLocations } from './fill/fill-world';
export type { FillWorld, FillWorldOptions } from './fill/fill-world.type';
export { ApFillError, canFillLocation, fillRestrictive } from './fill/ap-fill';
export type { FillRestrictiveInput } from './fill/ap-fill';
export { prefillDungeonItems } from './fill/dungeon-fill';
export { createAssumedState, sweepPlacedItems } from './fill/sweep';
export type { AssumedState } from './fill/sweep';
export { sweepPlacementSpheres } from './fill/verify-placement';
export { verifyStandardEscape } from './fill/verify-standard';
export { takeUncleWeapon, uncleWeaponCandidates } from './pool/uncle-weapon';
export type { WeaponPicker } from './pool/uncle-weapon';
export {
  UNCLE_LOCATION, UNCLE_USABLE_WEAPONS,
} from './pool/standard-escape.data';
export type { PlacementSphere, PlacementSweep } from './fill/verify-placement';
export { generateApPlacement, MAX_AP_ATTEMPTS } from './fill/generate-ap';
export type { ApPlacement, ApPlacementStats } from './fill/ap-placement.type';
export { fillFlagsOf, fillOptionsFromSnapshot } from './fill/fill-options-from-snapshot';
export type { DeliverableSets, FillPickers, SnapshotFillFlags } from './fill/fill-options-from-snapshot';
export { capacityProfileOfStats } from './fill/placement-capacity';
export {
  explosivesCapacity, hasMeterCapacity, meterUsesMultiplier, projectilesCapacity, walletCapacity, walletRungFor,
} from './state-helpers-capacity';
export { isItemUsable } from './item-usability';
export { METER_CONSUMING_ITEMS } from './magic-items.data';
export { canAfford, registerPriceRules } from './rules/prices';
export { MAX_PRICE, PRICED_ENTRIES } from './rules/tables/prices.data';
export type { PricedEntry } from './rules/tables/prices.data';
export { uncleWeaponUsableAtStart } from './pool/uncle-usability';
export { isProgressionUnder } from './pool/progression-class';
export type { WeaponFilter } from './pool/uncle-weapon';
export { accountingOf } from './pool/pool-accounting';
export type { PoolAccounting } from './pool/pool-accounting';
export { poolImpactOf } from './pool/pool-impact';
export type { PoolImpact } from './pool/pool-impact';
