/* @layer shared-game @kind barrel */
/** Barrel for the pond model (instances, modes, price ladder, plan, prize slots, rupee gems). */
export {
  POND_MAX_ITEMS, POND_MAX_THROWS, POND_PRICE_LADDER, POND_VANILLA_PRICE, POND_VANILLA_THROWS,
} from './pond-ladder.data';
export {
  CAPACITY_POND, POND_IDS, POND_INSTANCES, POND_INSTANCE_BY_ID, pondInstanceOf,
} from './pond-instances.data';
export type { PondHardFamily, PondId, PondInstance, PondSlot, PondSlotLock } from './pond-instance.type';
export {
  LEGACY_POND_RUNG_NAMES, POND_EXTRA_LOCATIONS, POND_LOCATION_SET, POND_PRIZE_LOCATIONS, POND_RUNGS_BY_ID,
  REFERENCE_CAPACITY_POND_SLOT_NAMES, REFERENCE_POND_SLOT_NAMES, pondRungsOf, pondSlotRenamesOf,
} from './pond-locations.data';
export {
  DEFAULT_POND_CUSTOM, DEFAULT_POND_ITEMS, DEFAULT_POND_PROFILES, DEFAULT_POND_SETTING,
  DEFAULT_WISH_POND_SETTING, LEGACY_POND_PROFILES, LEGACY_POND_SETTING, POND_PRICE_CEILING,
  POND_PRICE_FLOOR, defaultPondSettingOf,
} from './pond-profile-defaults';
export { POND_MODES, pondSettingForMode } from './pond-mode-switch';
export { SHIPPED_POND_KEYS, withMigratedPondKeys } from './pond-key-migration.data';
export {
  POND_ARROW_STOPS, POND_ASK_BOTTLE_CONTENTS, POND_ASK_ROWS, POND_ASK_ROW_BY_CURRENCY,
  POND_ASK_ROW_BY_KIND, POND_BOMB_STOPS, POND_BOTTLE_ROW, POND_BOTTLE_STOPS, asksOnlyRupees,
  pondRupeesOnlyAsk,
} from './pond-ask.data';
export type { PondAskRow, PondCurrencyRow } from './pond-ask.data';
export type {
  PondAskAmountKind, PondAskCurrency, PondAskSetting, PondBottleAsk, PondDemandView,
} from './pond-ask.type';
export {
  pondAskBottleContentKeyOf, pondAskBottleKeyOf, pondAskItemKeyOf, pondAskKeyOf, pondAskKeysOf,
  pondAskMaxKeyOf, pondAskMinKeyOf,
} from './pond-ask-keys';
export { askOfSetting, parsePondAsk, pondAskValuesOf, readPondAsk } from './pond-ask-from-snapshot';
export { demandCandidatesOf, pickDemandItem } from './pond-demand-item';
export { isDemandableItem } from './pond-demand-eligibility';
export { HOLDABLE_CATEGORIES, UNHELD_ITEMS } from './pond-demand-eligibility.data';
export { DEMAND_ITEM_ORDER, DEMAND_ITEM_RANK } from './pond-demand-order.data';
export { rollPondDemands } from './pond-demand-roll';
export { amountAt, curvePositionsOf, stopIndexOf } from './pond-demand-ramp';
export type { PondAskRange } from './pond-demand-ramp';
export { POND_SHARE_KEY, effectivePondProfiles, readsPondShare } from './pond-share';
export {
  POND_FIELDS, POND_MODE_KEYS, POND_OPTION_KEYS, isPondValueKey, pondIdOfModeKey, pondKeyOf, pondModeKeyOf,
} from './pond-option-keys';
export type { PondField } from './pond-option-keys';
export { customPricesOf, pondPlanOf, rungOf } from './pond-plan';
export { parsePondSetting, pondSettingFromSnapshot, pondValuesOf } from './pond-from-snapshot';
export type { ParsedPondSetting } from './pond-from-snapshot';
export {
  parsePondProfiles, pondProfileValuesOf, pondProfilesFromSnapshot,
} from './pond-profiles-from-snapshot';
export type { ParsedPondProfiles } from './pond-profiles-from-snapshot';
export type { PondProfiles } from './pond-profiles.type';
export {
  POND_CERTIFIED_SPOTS, isPondDeliverable, isPondExtraLocation, pondCertifiedSpotsOf, presentPondLocations,
} from './pond-spots';
export { POND_GEM_SLOTS, RUPEE_DENOMINATIONS } from './rupee-gems.data';
export type { RupeeDenomination } from './rupee-gems.data';
export { decomposeRupees, describeRupees, rupeeVolleysOf } from './rupee-gems';
export { holdPondToWallet, pondCeilingRungOf, pondWalletTopOf } from './pond-wallet-top';
export type { HeldPondSetting } from './pond-wallet-top';
export { VANILLA_POND_CEILINGS, pondCeilingsOf } from './pond-ceilings';
export type { PondCeilings } from './pond-ceilings';
export type {
  PondCustomSetting, PondFixedSetting, PondMode, PondPlan, PondSetting, PondThrow,
} from './pond-profile.type';
