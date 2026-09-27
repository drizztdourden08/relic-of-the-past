/* @layer shared-game @kind logic */
/**
 * What a swap chest holds right now. A chest whose item names a stand-in (ItemRecord.aliasOf)
 * pays that stand-in when the player already holds the item, so the same chest reads two ways
 * over a file's life. An open one follows the inventory. A taken one paid the real item only if
 * it is the chest a normal file takes it from first, or if that chest is still closed. Six chests:
 * Link's House, the Secret Passage and Zelda's Chest (Lamp), the castle's Boomerang Chest and the
 * Chicken House (Blue Boomerang), the Brewery (Red Boomerang).
 */
import { getItem } from '../../data';
import type { CheckId, CheckRecord, ItemId, ItemRecord } from '../../data';

interface ChestSwap {
  primary: ItemId;
  standIn: ItemId;
}

/** The swap a check is subject to: a chest with one vanilla item that names a stand-in. */
const chestSwapOf = (check: CheckRecord): ChestSwap | null => {
  if (check.kind !== 'chest' || check.vanillaItemIds.length !== 1) return null;
  const primary = check.vanillaItemIds[0];
  const standIn = getItem(primary).aliasOf;
  return standIn ? { primary, standIn } : null;
};

const holdsSlot = (item: ItemRecord, owned: ReadonlySet<ItemId>): boolean =>
  owned.has(item.id) || (item.sharesSlotWith ?? []).some((id) => owned.has(id));

const shownItem = (check: CheckRecord, swap: ChestSwap, owned: ReadonlySet<ItemId>, completed: ReadonlySet<CheckId>): ItemId => {
  const item = getItem(swap.primary);
  if (!completed.has(check.id)) return holdsSlot(item, owned) ? swap.standIn : swap.primary;
  const usual = item.usualChestId;
  if (usual === check.id) return swap.primary;
  if (usual !== undefined) return completed.has(usual) ? swap.standIn : swap.primary;
  // No usual chest (the Red Boomerang's one chest): it paid the stand-in when the player holds a
  // slot-mate and not the item itself. Holding the item says nothing, it has other sources.
  return !owned.has(item.id) && holdsSlot(item, owned) ? swap.standIn : swap.primary;
};

/** Every swap chest's item as it stands now, by check id. */
const liveChestItems = (
  checks: readonly CheckRecord[], owned: ReadonlySet<ItemId>, completed: ReadonlySet<CheckId>,
): Map<CheckId, ItemId> => {
  const items = new Map<CheckId, ItemId>();
  for (const check of checks) {
    const swap = chestSwapOf(check);
    if (swap) items.set(check.id, shownItem(check, swap, owned, completed));
  }
  return items;
};

export { chestSwapOf, liveChestItems };
export type { ChestSwap };
