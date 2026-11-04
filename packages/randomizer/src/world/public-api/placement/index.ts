/* @layer shared-game @kind barrel */
export { isSlotKey, pondRungKey, shopLocationKey } from '../../location-key';
export type { LocationKey, ShopLocationKey } from '../../location-key';
export { checkIdOfLocation, locationKeyOfCheck } from '../../location-record';
export { isSeedLocation } from '../../seed-locations';
export { DUNGEON_ORDER } from '../../fill/dungeon-order.constants';
export { worldDungeonOf } from '../../world-dungeon';
export {
  CAPACITY_UPGRADE_LOCATIONS, KEY_DROP_LOCATIONS, NPC_SCOPE_LOCATIONS, PRIZE_LOCATIONS, VANILLA_PRIZES,
  WORLD_ITEM_SCOPE_LOCATIONS,
} from '../../scope-tables';
export { buildItemPool } from '../../pool/build-item-pool';
export type { ItemPool } from '../../pool/item-pool.type';
export { PRIZE_ITEMS } from '../../pool/prize-items.constants';
export { buildFillWorld, fillEligibleLocations } from '../../fill/fill-world';
export type { FillWorld, FillWorldOptions } from '../../fill/fill-world.type';
export {
  FillError, MAX_PLACEMENT_ATTEMPTS, canFillLocation, createAssumedState, fillRestrictive, sweepPlacedItems,
} from '@drizztdourden08/brock-randomizer/world';
export type { PlacementSphere, PlacementSweep } from '../../fill/fill.type';
export { prefillDungeonItems } from '../../fill/dungeon-fill';
export { sweepPlacementSpheres } from '../../fill/verify-placement';
export { verifyStandardEscape } from '../../fill/verify-standard';
export { takeUncleWeapon, uncleWeaponCandidates } from '../../pool/uncle-weapon';
export {
  UNCLE_LOCATION, UNCLE_USABLE_WEAPONS,
} from '../../pool/standard-escape';
export { generatePlacement } from '../../fill/generate';
export type { Placement, PlacementStats } from '../../fill/placement.type';
export { fillFlagsOf, fillOptionsFromSnapshot } from '../../fill/fill-options-from-snapshot';
export type { DeliverableSets } from '../../fill/fill-options-from-snapshot';
export { isItemUsable, meterConsumingItems } from '../../item-usability';
export { uncleWeaponUsableAtStart } from '../../pool/uncle-usability';
export { isProgressionUnder } from '../../pool/progression-class';
export { accountingOf } from '../../pool/pool-accounting';
export type { PoolAccounting } from '../../pool/pool-accounting';
export { poolImpactOf } from '../../pool/pool-impact';
export type { PoolImpact } from '../../pool/pool-impact';
