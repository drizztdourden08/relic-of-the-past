/* @layer renderer-components @kind logic */
/**
 * Splits the option catalog by lock state so every consumer shows the same
 * shape: the unlocked options first, as the player's own choices, flat in
 * catalog order, and also grouped by section so a panel can put a newly
 * supported option under its real heading instead of in one undifferentiated
 * block; then the locked remainder grouped in catalog group order with empty
 * groups dropped. Driven entirely by each entry's `locked` flag, so unlocking
 * an option in the catalog moves it into the choices block on its own. The
 * capacity rows are the exception: the panels render them as one family row
 * each (CapacityUpgradesBlock), with the master switch, the progressive
 * switch and the pickup-bonus rows in that same block, so they are left out of the plain list. The shop rows follow the same
 * rule: the slot ticks, the shuffle mode and the two counted rows are one
 * block, and the price rows another; the pond's value rows likewise, though
 * the pond's MODE row stays in the list, under its section, because that is
 * the choice being offered there. The progressive tier ticks are one block per
 * family (ProgressiveTiersBlock) and follow the shop rule exactly. The five
 * dark-room rows are one block too (DarkRoomsSection): the requirement is the
 * switch at its head and the four lights are the sprite tiles under it, so
 * none of the five is listed again as a plain row. The tier block owns the
 * per-family ORDER rows on the same terms as the ticks they qualify, and the
 * retro switch owns its two arrow prices, so neither is listed twice either.
 * The difficulty block owns the five copy multiples and the heart ceiling
 * (difficulty/) on exactly those terms.
 */
import { AP_OPTION_GROUPS, apOptionCatalog } from '@shared/randomizer/ap-world/options.data';
import {
  CAPACITY_ENABLED_KEY, CAPACITY_PROGRESSIVE_KEY, familyOfOptionKey, isCapacityBonusKey,
} from '@shared/randomizer/ap-world/capacity';
import { isShopPriceOptionKey } from '@shared/randomizer/ap-world/shops/shop-price-options.data';
import { isShopScopeOptionKey } from '@shared/randomizer/ap-world/shops/shop-slot-options.data';
import { isDarkRoomOptionKey } from '@shared/randomizer/ap-world/dark-rooms/dark-room-option-keys';
import { isDifficultyOptionKey } from '@shared/randomizer/ap-world/difficulty/difficulty-option-keys';
import { isPondValueKey } from '@shared/randomizer/ap-world/pond/pond-option-keys';
import { isProgressiveTierKey } from '@shared/randomizer/ap-world/progressive/progressive-option-keys';
import { isProgressiveModeKey } from '@shared/randomizer/ap-world/progressive/progressive-mode-keys';
import { RETRO_BOW_KEY } from '@shared/randomizer/ap-world/retro/retro-bow.data';
import { isRetroOptionKey } from '@shared/randomizer/ap-world/retro/retro-options.data';
import type { ApOptionDef, ApOptionGroup } from '@shared/randomizer/ap-world/options.type';

interface LockedOptionGroup {
  group: ApOptionGroup;
  options: ApOptionDef[];
}

interface CatalogByLock {
  /** Options the player may change at creation time, in catalog order, the capacity rows excepted. */
  unlocked: ApOptionDef[];
  /** The same options, grouped by section in catalog group order; empty groups dropped. */
  unlockedGroups: LockedOptionGroup[];
  /** Everything fixed by this app, grouped; groups with no locked option are omitted. */
  lockedGroups: LockedOptionGroup[];
}

const partitionCatalogByLock = (
  catalog: readonly ApOptionDef[],
  groups: readonly ApOptionGroup[],
): CatalogByLock => {
  const unlocked = catalog.filter((option) =>
    !option.locked && familyOfOptionKey(option.key) === undefined && option.key !== CAPACITY_PROGRESSIVE_KEY
    && option.key !== CAPACITY_ENABLED_KEY && !isCapacityBonusKey(option.key)
    && !isShopPriceOptionKey(option.key) && !isShopScopeOptionKey(option.key)
    && !isPondValueKey(option.key) && !isProgressiveTierKey(option.key)
    && !isProgressiveModeKey(option.key)
    && option.key !== RETRO_BOW_KEY && !isRetroOptionKey(option.key)
    && !isDarkRoomOptionKey(option.key) && !isDifficultyOptionKey(option.key));
  const byGroup = (wanted: readonly ApOptionDef[]): LockedOptionGroup[] => groups
    .map((group) => ({ group, options: wanted.filter((option) => option.group === group.id) }))
    .filter((entry) => entry.options.length > 0);
  const lockedGroups = byGroup(catalog.filter((option) => option.locked));
  return { unlocked, unlockedGroups: byGroup(unlocked), lockedGroups };
};

/** The shipped catalog, partitioned once, since the catalog is static module data. */
const apCatalogByLock: CatalogByLock = partitionCatalogByLock(apOptionCatalog, AP_OPTION_GROUPS);

export { apCatalogByLock, partitionCatalogByLock };
export type { CatalogByLock, LockedOptionGroup };
