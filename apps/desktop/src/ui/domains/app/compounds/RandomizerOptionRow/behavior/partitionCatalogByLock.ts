/* @layer renderer-components @kind logic */
import { CAPACITY_ENABLED_KEY, CAPACITY_PROGRESSIVE_KEY, familyOfOptionKey, isCapacityBonusKey } from '@rotp/randomizer';
import { isShopPriceOptionKey } from '@rotp/randomizer';
import { isShopScopeOptionKey } from '@rotp/randomizer';
import { isDarkRoomOptionKey } from '@rotp/randomizer';
import { isDifficultyOptionKey } from '@rotp/randomizer';
import { isPondValueKey } from '@rotp/randomizer';
import { isProgressiveTierKey } from '@rotp/randomizer';
import { isProgressiveModeKey } from '@rotp/randomizer';
import { RETRO_BOW_KEY } from '@rotp/randomizer';
import { isRetroOptionKey } from '@rotp/randomizer';
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
