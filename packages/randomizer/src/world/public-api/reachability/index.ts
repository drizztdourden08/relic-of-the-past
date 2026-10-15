/* @layer shared-game @kind barrel */
export { buildWorld } from '../../build-world';
export { createCollectionState } from '../../collection-state';
export type { CollectionState } from '../../collection-state';
export { computeReachableRegions } from '../../compute-reachable-regions';
export { updateReachableRegions } from '../../update-reachable-regions';
export { markWorldZones } from '../../world-zones';
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
} from '../../state-helpers';
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
} from '../../state-helpers-world';
export { REGION } from '../../region-ids.constants';
export { PROGRESSION_TIERS } from '../../progressive/progression-tiers.constants';
export { registerRules } from '../../rules/register';
export type { RuleCoverageReport } from '../../rules/register';
export { canCollectLocation, collectableLocations } from '../../rules/collect';
export { canReachEvent, collectReachableEvents, GOAL_EVENT, STORY_EVENT, WORLD_EVENT_IDS } from '../../events';
export type { Rule, ItemRule, AlwaysAllowRule, World, WorldOptions } from '../../world.type';
export type {
  RegionGraphRow,
  WorldLocation,
  WorldEvent,
  Exit,
  Region,
  WorldDungeon,
} from '../../region.type';
export {
  explosivesCapacity, hasMeterCapacity, meterUsesMultiplier, projectilesCapacity, walletCapacity, walletRungFor,
} from '../../state-helpers-capacity';
export { canAfford, registerPriceRules } from '../../rules/prices';
export { MAX_PRICE, PRICED_ENTRIES } from '../../rules/priced-entries';
export type { PricedEntry } from '../../rules/priced-entries';
