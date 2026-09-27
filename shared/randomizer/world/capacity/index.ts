/* @layer shared-game @kind barrel */
/** Barrel for the capacity-profile model (families, curves, plans, snapshot rows). */
export {
  EXPLOSIVES_TIERS, METER_LEVEL_LABELS, METER_TIERS, PROJECTILES_TIERS, VANILLA_RUNG, WALLET_LADDER,
  WALLET_LADDER_LAST,
} from './capacity-ladders.data';
export { EXPLOSIVES, FAMILIES, METER, PROJECTILES, WALLET, familyById, maxSpanOf } from './capacity-family';
export type { CapacityFamily } from './capacity-family';
export {
  DEFAULT_CAPACITY_PROFILE, LEGACY_SHUFFLE_ON_PROFILE, REFERENCE_CAPACITY_PROFILE, VANILLA_CAPACITY_PROFILE,
  customSetting, legacyCapacityProfile,
} from './capacity-profile-defaults';
export { capacityPlansOf, capacityPoolCountsOf, maxTierOf, planOf, startTierOf } from './family-plan';
export { reachableTopOf } from './reachable-top';
export { heldMaxRungOf, maxFloorReasonOf, maxRungFloorOf } from './max-floor';
export { NO_WALLET_FLOOR, holdWalletToFloor, walletFloorOf } from './wallet-floor';
export type { WalletDemand, WalletFloor } from './wallet-floor';
export { RETRO_PINNED_FAMILIES, isPinnedUnderRetro, withRetroBow } from './retro-projectiles';
export {
  CAPACITY_ENABLED_KEY, CAPACITY_OPTION_KEYS, CAPACITY_PROGRESSIVE_KEY, LEGACY_CAPACITY_KEY, capacityFieldsOf,
  capacityKeyOf, familyOfOptionKey,
} from './capacity-option-keys';
export type { CapacityField } from './capacity-option-keys';
export {
  capacityEnabledFromSnapshot, capacityEnabledOf, capacityProfileFromSnapshot, capacityProgressiveFromSnapshot,
  capacityProgressiveOf, capacityValuesOf, parseCapacityProfile,
} from './capacity-profile-from-snapshot';
export type { ParsedCapacityProfile } from './capacity-profile-from-snapshot';
export {
  CAPACITY_BONUS_KEYS, CAPACITY_BONUS_MAX, CAPACITY_BONUS_STEP, DEFAULT_CAPACITY_BONUS, LEGACY_CAPACITY_BONUS,
  capacityBonusBaseKeyOf, capacityBonusKeyOf, clampBonusPercent, defaultFamilyBonus, isCapacityBonusKey,
} from './bonus/capacity-bonus.data';
export { capacityBonusFromSnapshot, capacityBonusOfValues, capacityBonusValuesOf } from './bonus/capacity-bonus-from-snapshot';
export type { CapacityBonusSetting, FamilyBonus } from './bonus/capacity-bonus.type';
export { CURVE_IDS, CURVE_LABELS, CURVES } from './curves/curves.data';
export type { Proportions } from './curves/curves.data';
export { scaleToSpan } from './curves/scale-to-span';
export { clampCount, jumpsOf } from './curves/jumps-of';
export { capJumps, minCountFor } from './curves/cap-jumps';
export { ladderClamps, ladderOf } from './curves/ladder-of';
export {
  formatFreeJumps, freeSequenceProblem, isValidFreeSequence, parseFreeJumps,
} from './curves/free-sequence';
export { CURVE_PRESETS, presetMatching } from './curves/curve-presets.data';
export type { CurvePreset, CurvePresetId } from './curves/curve-presets.data';
export type {
  CapacityFamilyId, CapacityMode, CapacityPoolCounts, CapacityProfile, CurveId, CurveShape,
  CustomFamilySetting, FamilyPlan, FamilySetting, WalletSetting,
} from './capacity-profile.type';
