/* @layer shared-game @kind barrel */
export { buildWorld } from './build-world';
export { createCollectionState } from './collection-state';
export type { CollectionState } from './collection-state';
export { computeReachableRegions } from './compute-reachable-regions';
export { updateReachableRegions } from './update-reachable-regions';
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
export { ITEM, UNRECORDED, isUnrecordedItem } from './item-ids';
export type { ItemKey, UnrecordedItem } from './item-ids';
export { itemKeyName } from './display-names/item-key-name';
export { BOTTLE_ITEMS, CRYSTAL_ITEMS, MEDALLION_ITEMS, VANILLA_MEDALLIONS } from './item-groups';
export type { MedallionId } from './item-groups';
export { REGION } from './region-ids.constants';
export { PROGRESSION_TIERS } from './progressive/progression-tiers.constants';
export { isSlotKey, pondRungKey, shopLocationKey } from './location-key';
export type { LocationKey, ShopLocationKey, SlotKey } from './location-key';
export { checkIdOfLocation, locationKeyOfCheck } from './location-record';
export { isSeedLocation } from './seed-locations';
export { locationDisplayName } from './display-names/location-display-name';
export { DUNGEON_ORDER } from './fill/dungeon-order.constants';
export { worldDungeonOf } from './world-dungeon';
export {
  CAPACITY_UPGRADE_LOCATIONS, KEY_DROP_LOCATIONS, NPC_SCOPE_LOCATIONS, PRIZE_LOCATIONS, VANILLA_PRIZES,
  WORLD_ITEM_SCOPE_LOCATIONS,
} from './scope-tables';
export { registerRules } from './rules/register';
export type { RuleCoverageReport } from './rules/register';
export { canCollectLocation, collectableLocations } from './rules/collect';
export { canReachEvent, collectReachableEvents, GOAL_EVENT, STORY_EVENT, WORLD_EVENT_IDS } from './events';
export { buildItemPool } from './pool/build-item-pool';
export type { BottlePicker } from './pool/build-item-pool';
export type { ItemPool } from './pool/item-pool.type';
export { PRIZE_ITEMS } from './pool/prize-items.constants';
export type { Rule, ItemRule, AlwaysAllowRule, World, WorldOptions } from './world.type';
export type {
  RegionGraphRow,
  WorldLocation,
  WorldEvent,
  Exit,
  Region,
  WorldDungeon,
} from './region.type';
export { buildFillWorld, fillEligibleLocations } from './fill/fill-world';
export type { FillWorld, FillWorldOptions } from './fill/fill-world.type';
export { FillError } from './fill/fill-error';
export { canFillLocation } from './fill/can-fill-location';
export { fillRestrictive } from './fill/fill-restrictive';
export type { FillRestrictiveInput, AssumedState, PlacementSphere, PlacementSweep } from './fill/fill.type';
export { prefillDungeonItems } from './fill/dungeon-fill';
export { createAssumedState } from './fill/create-assumed-state';
export { sweepPlacedItems } from './fill/sweep-placed-items';
export { sweepPlacementSpheres } from './fill/verify-placement';
export { verifyStandardEscape } from './fill/verify-standard';
export { takeUncleWeapon, uncleWeaponCandidates } from './pool/uncle-weapon';
export type { WeaponPicker, WeaponFilter } from './pool/uncle-weapon';
export {
  UNCLE_LOCATION, UNCLE_USABLE_WEAPONS,
} from './pool/standard-escape';
export { generatePlacement } from './fill/generate';
export { MAX_PLACEMENT_ATTEMPTS } from './fill/fill.constants';
export type { Placement, PlacementStats } from './fill/placement.type';
export { fillFlagsOf, fillOptionsFromSnapshot } from './fill/fill-options-from-snapshot';
export type { DeliverableSets, FillPickers, SnapshotFillFlags } from './fill/fill-options-from-snapshot';
export {
  explosivesCapacity, hasMeterCapacity, meterUsesMultiplier, projectilesCapacity, walletCapacity, walletRungFor,
} from './state-helpers-capacity';
export { isItemUsable, meterConsumingItems } from './item-usability';
export { canAfford, registerPriceRules } from './rules/prices';
export { MAX_PRICE, PRICED_ENTRIES } from './rules/priced-entries';
export type { PricedEntry } from './rules/priced-entries';
export { uncleWeaponUsableAtStart } from './pool/uncle-usability';
export { isProgressionUnder } from './pool/progression-class';
export { accountingOf } from './pool/pool-accounting';
export type { PoolAccounting } from './pool/pool-accounting';
export { poolImpactOf } from './pool/pool-impact';
export type { PoolImpact } from './pool/pool-impact';
