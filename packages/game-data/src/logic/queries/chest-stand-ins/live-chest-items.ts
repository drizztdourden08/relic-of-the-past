/* @layer shared-game @kind logic */
import { getItem } from '../../../data';
import type { CheckId, CheckRecord, ItemId, ItemRecord } from '../../../data';
import type { ChestSwap } from './chest-stand-ins.type';
import { chestSwapOf } from './chest-swap-of';

const holdsSlot = (item: ItemRecord, owned: ReadonlySet<ItemId>): boolean =>
  owned.has(item.id) || (item.sharesSlotWith ?? []).some((id) => owned.has(id));

const holdsOnlySlotMate = (item: ItemRecord, owned: ReadonlySet<ItemId>): boolean =>
  !owned.has(item.id) && holdsSlot(item, owned);

const shownItem = (check: CheckRecord, swap: ChestSwap, owned: ReadonlySet<ItemId>, completed: ReadonlySet<CheckId>): ItemId => {
  const item = getItem(swap.primary);
  if (!completed.has(check.id)) return holdsSlot(item, owned) ? swap.standIn : swap.primary;
  const usual = item.usualChestId;
  if (usual === check.id) return swap.primary;
  if (usual !== undefined) return completed.has(usual) ? swap.standIn : swap.primary;
  return holdsOnlySlotMate(item, owned) ? swap.standIn : swap.primary;
};

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

export { liveChestItems };
