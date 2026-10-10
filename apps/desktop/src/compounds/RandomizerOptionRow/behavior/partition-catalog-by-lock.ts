/* @layer renderer-components @kind logic */
import { CAPACITY_ENABLED_KEY, CAPACITY_PROGRESSIVE_KEY, familyOfOptionKey, isCapacityBonusKey, isShopPriceOptionKey, isShopScopeOptionKey, isDarkRoomOptionKey, isDifficultyOptionKey, isPondValueKey, isProgressiveTierKey, isProgressiveModeKey, RETRO_BOW_KEY, isRetroOptionKey } from '@rotp/randomizer';
import type { OptionDef, OptionGroup } from '@rotp/randomizer';
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
