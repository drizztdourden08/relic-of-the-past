/* @layer shared-game @kind barrel */
export { buildWorld } from '../../build-world';
export { createCollectionState } from '../../collection-state';
export type { CollectionState } from '../../collection-state';
export { computeReachableRegions } from '../../compute-reachable-regions';
export { updateReachableRegions } from '@drizztdourden08/brock-randomizer/world';
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
  canShootArrows,
  canUseBombs,
  canBombOrBonk,
  hasHearts,
  canExtendMagic,
} from '../../state-helpers';
export {
  hasCrystals,
  canActivateCrystalSwitch,
  canKillMostThings,
  canKillStandardStart,
  canGetGoodBee,
  canRetrieveTablet,
  hasMireMedallion,
  hasTurtleRockMedallion,
} from '../../state-helpers-world';
export { REGION } from '../../region-ids.constants';
export { PROGRESSION_TIERS } from '../../progressive/progression-tiers.constants';
export { registerRules } from '../../rules/register';
export { canCollectLocation } from '../../rules/collect';
export { GOAL_EVENT, STORY_EVENT } from '../../events';
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
export { registerPriceRules } from '../../rules/prices';
export { MAX_PRICE, PRICED_ENTRIES } from '../../rules/priced-entries';
