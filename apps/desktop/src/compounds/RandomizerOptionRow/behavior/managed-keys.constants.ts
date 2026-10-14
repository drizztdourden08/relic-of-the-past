/* @layer renderer-components @kind constants */
import {
  CAPACITY_ENABLED_KEY, CAPACITY_PROGRESSIVE_KEY, RETRO_BOW_KEY, familyOfOptionKey, isCapacityBonusKey,
  isDarkRoomOptionKey, isDifficultyOptionKey, isPondValueKey, isProgressiveModeKey, isProgressiveTierKey,
  isRetroOptionKey, isShopPriceOptionKey, isShopScopeOptionKey,
} from '@rotp/randomizer';

const MANAGED_KEY_TESTS: readonly ((key: string) => boolean)[] = [
  (key) => familyOfOptionKey(key) !== undefined,
  (key) => key === CAPACITY_PROGRESSIVE_KEY,
  (key) => key === CAPACITY_ENABLED_KEY,
  isCapacityBonusKey,
  isShopPriceOptionKey,
  isShopScopeOptionKey,
  isPondValueKey,
  isProgressiveTierKey,
  isProgressiveModeKey,
  (key) => key === RETRO_BOW_KEY,
  isRetroOptionKey,
  isDarkRoomOptionKey,
  isDifficultyOptionKey,
];

export { MANAGED_KEY_TESTS };
