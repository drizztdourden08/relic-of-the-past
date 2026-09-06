/* @layer shared-game @kind barrel */
/** Barrel for the pond model (modes, price ladder, plan, prize slots, rupee gems). */
export {
  POND_GAMBLE_CHANCES, POND_GAMBLE_PRICE_STEP, POND_MAX_ITEMS, POND_MAX_THROWS, POND_PRICE_LADDER,
  POND_VANILLA_PRICE, POND_VANILLA_THROWS, gamblePriceOf, gambleRefundOf,
} from './pond-ladder.data';
export { POND_EXTRA_LOCATIONS, POND_LOCATION_SET, POND_PRIZE_LOCATIONS } from './pond-locations.data';
export {
  DEFAULT_POND_CUSTOM, DEFAULT_POND_ITEMS, DEFAULT_POND_SETTING, LEGACY_POND_SETTING, POND_PRICE_CEILING,
  POND_PRICE_FLOOR,
} from './pond-profile-defaults';
export { POND_MODES, pondSettingForMode } from './pond-mode-switch';
export { POND_FIELDS, POND_MODE_KEY, POND_OPTION_KEYS, isPondValueKey, pondKeyOf } from './pond-option-keys';
export type { PondField } from './pond-option-keys';
export { customPricesOf, gambleWinnersOf, pondPlanOf, rungOf } from './pond-plan';
export { parsePondSetting, pondSettingFromSnapshot, pondValuesOf } from './pond-from-snapshot';
export type { ParsedPondSetting } from './pond-from-snapshot';
export {
  POND_CERTIFIED_SPOTS, isPondDeliverable, isPondExtraLocation, presentPondLocations,
} from './pond-spots';
export { POND_GEM_SLOTS, RUPEE_DENOMINATIONS } from './rupee-gems.data';
export type { RupeeDenomination } from './rupee-gems.data';
export { decomposeRupees, describeRupees, rupeeVolleysOf } from './rupee-gems';
export { holdPondToWallet, pondCeilingRungOf, pondWalletTopOf } from './pond-wallet-top';
export type { HeldPondSetting } from './pond-wallet-top';
export type {
  PondCustomSetting, PondFixedSetting, PondMode, PondPlan, PondSetting, PondThrow,
} from './pond-profile.type';
