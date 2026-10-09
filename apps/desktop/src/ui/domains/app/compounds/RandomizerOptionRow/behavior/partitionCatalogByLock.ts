/* @layer renderer-components @kind logic */
import {
  CAPACITY_ENABLED_KEY, CAPACITY_PROGRESSIVE_KEY, familyOfOptionKey, isCapacityBonusKey,
} from '@shared/randomizer/world/capacity';
import { isShopPriceOptionKey } from '@shared/randomizer/world/shops/shop-price-options.data';
import { isShopScopeOptionKey } from '@shared/randomizer/world/shops/shop-slot-options.data';
import { isDarkRoomOptionKey } from '@shared/randomizer/world/dark-rooms/dark-room-option-keys';
import { isDifficultyOptionKey } from '@shared/randomizer/world/difficulty/difficulty-option-keys';
import { isPondValueKey } from '@shared/randomizer/world/pond/pond-option-keys';
import { isProgressiveTierKey } from '@shared/randomizer/world/progressive/progressive-option-keys';
import { isProgressiveModeKey } from '@shared/randomizer/world/progressive/progressive-mode-keys';
import { RETRO_BOW_KEY } from '@shared/randomizer/world/retro/retro-bow.data';
import { isRetroOptionKey } from '@shared/randomizer/world/retro/retro-options.data';
import type { OptionDef, OptionGroup } from '@shared/randomizer/world/options.type';
import type { CatalogByLock, LockedOptionGroup } from '../RandomizerOptionRow.type';

const partitionCatalogByLock = (
  catalog: readonly OptionDef[],
  groups: readonly OptionGroup[],
): CatalogByLock => {
  const unlocked = catalog.filter((option) =>
    !option.locked && familyOfOptionKey(option.key) === undefined && option.key !== CAPACITY_PROGRESSIVE_KEY
    && option.key !== CAPACITY_ENABLED_KEY && !isCapacityBonusKey(option.key)
    && !isShopPriceOptionKey(option.key) && !isShopScopeOptionKey(option.key)
    && !isPondValueKey(option.key) && !isProgressiveTierKey(option.key)
    && !isProgressiveModeKey(option.key)
    && option.key !== RETRO_BOW_KEY && !isRetroOptionKey(option.key)
    && !isDarkRoomOptionKey(option.key) && !isDifficultyOptionKey(option.key));
  const byGroup = (wanted: readonly OptionDef[]): LockedOptionGroup[] => groups
    .map((group) => ({ group, options: wanted.filter((option) => option.group === group.id) }))
    .filter((entry) => entry.options.length > 0);
  const lockedGroups = byGroup(catalog.filter((option) => option.locked));
  return { unlocked, unlockedGroups: byGroup(unlocked), lockedGroups };
};

export { partitionCatalogByLock };
export type { CatalogByLock, LockedOptionGroup };
