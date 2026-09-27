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
export { ITEM, UNRECORDED, isUnrecordedItem } from './item-ids.data';
export type { ItemKey, UnrecordedItem } from './item-ids.data';
export { itemKeyName } from './display-names/item-key-name';
export { BOTTLE_ITEMS, CRYSTAL_ITEMS, MEDALLION_ITEMS, VANILLA_MEDALLIONS } from './item-groups';
export type { MedallionId } from './item-groups';
export { REGION } from './region-ids.data';
export { PROGRESSION_TIERS } from './progressive/progression-tiers.data';
export { CAPACITY_SHOP_EVENT, isSlotKey, pondRungKey, restockKey } from './location-key';
export type { LocationKey, SlotKey } from './location-key';
export { isSeedLocation } from './seed-locations';
export { locationDisplayName } from './display-names/location-display-name';
export { DUNGEON_ORDER } from './fill/dungeon-order.data';
export { worldDungeonOf } from './world-dungeon';
export {
  CAPACITY_UPGRADE_LOCATIONS, EVENT_LOCATIONS, KEY_DROP_LOCATIONS, NPC_SCOPE_LOCATIONS,
  PRIZE_LOCATIONS, VANILLA_PRIZES, WORLD_ITEM_SCOPE_LOCATIONS,
} from './scope-tables';
export { registerRules } from './rules/register';
export type { RuleCoverageReport } from './rules/register';
export { canCollectLocation, collectableLocations, sweepEvents } from './rules/collect';
export { buildItemPool } from './pool/build-item-pool';
export type { BottlePicker } from './pool/build-item-pool';
export type { ItemPool } from './pool/item-pool.type';
export { EVENT_ITEMS, PRIZE_ITEMS, VICTORY_ITEM } from './pool/event-items.data';
export type { Rule, ItemRule, AlwaysAllowRule, World, WorldOptions } from './world.type';
export type {
  RegionGraphRow,
  WorldLocation,
  Exit,
  Region,
  WorldDungeon,
} from './region.type';
export { buildFillWorld, fillEligibleLocations } from './fill/fill-world';
export type { FillWorld, FillWorldOptions } from './fill/fill-world.type';
export { FillError, canFillLocation, fillRestrictive } from './fill/fill';
export type { FillRestrictiveInput } from './fill/fill';
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
export { generatePlacement, MAX_PLACEMENT_ATTEMPTS } from './fill/generate';
export type { Placement, PlacementStats } from './fill/placement.type';
export { fillFlagsOf, fillOptionsFromSnapshot } from './fill/fill-options-from-snapshot';
export type { DeliverableSets, FillPickers, SnapshotFillFlags } from './fill/fill-options-from-snapshot';
export { capacityProfileOfStats } from './fill/placement-capacity';
export {
  explosivesCapacity, hasMeterCapacity, meterUsesMultiplier, projectilesCapacity, walletCapacity, walletRungFor,
} from './state-helpers-capacity';
export { isItemUsable, meterConsumingItems } from './item-usability';
export { canAfford, registerPriceRules } from './rules/prices';
export { MAX_PRICE, PRICED_ENTRIES } from './rules/priced-entries';
export type { PricedEntry } from './rules/priced-entries';
export { uncleWeaponUsableAtStart } from './pool/uncle-usability';
export { isProgressionUnder } from './pool/progression-class';
export type { WeaponFilter } from './pool/uncle-weapon';
export { accountingOf } from './pool/pool-accounting';
export type { PoolAccounting } from './pool/pool-accounting';
export { poolImpactOf } from './pool/pool-impact';
export type { PoolImpact } from './pool/pool-impact';
