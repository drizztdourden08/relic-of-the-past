/* @layer renderer-components @kind logic */
import type { OptionDef, OptionGroup } from '@rotp/randomizer';
import type { CatalogByLock, LockedOptionGroup } from '../RandomizerOptionRow.type';
import { isManagedKey } from './is-managed-key';

const partitionCatalogByLock = (
  catalog: readonly OptionDef[],
  groups: readonly OptionGroup[],
): CatalogByLock => {
  const unlocked = catalog.filter((option) => !option.locked && !isManagedKey(option.key));
  const byGroup = (wanted: readonly OptionDef[]): LockedOptionGroup[] => groups
    .map((group) => ({ group, options: wanted.filter((option) => option.group === group.id) }))
    .filter((entry) => entry.options.length > 0);
  const lockedGroups = byGroup(catalog.filter((option) => option.locked));
  return { unlocked, unlockedGroups: byGroup(unlocked), lockedGroups };
};

export { partitionCatalogByLock };
