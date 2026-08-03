/* @layer shared-game @kind logic */
/**
 * Reads over the item-group collection — replaces the old direct
 * `ITEM_GROUPS[groupId]` indexing into the bare taxonomy table.
 */
import { replaceAll } from '../registry';
import { ALL_ITEM_GROUPS } from './item-groups';
import type { ItemGroupId, ItemId } from '../types/ids';
import type { ItemGroupRecord } from '../types/item-group';

const byId = new Map<string, ItemGroupRecord>(ALL_ITEM_GROUPS.map(group => [group.id, group]));

const itemGroupById = (id: string): ItemGroupRecord | undefined => byId.get(id);

/** The item ids in this group — an empty array (never undefined) for an unknown group id. */
const membersOf = (id: ItemGroupId): readonly ItemId[] => byId.get(id)?.memberIds ?? [];

/**
 * Adds a group the allocator minted after seeding, so the session answers for
 * it without a reload — the same bargain `registerTag` makes on the tag side.
 * Ignored when the id is already registered, which a genuinely new allocation
 * never is.
 */
const registerItemGroupRecord = (record: ItemGroupRecord): boolean => {
  if (byId.has(record.id)) return false;
  ALL_ITEM_GROUPS.push(record);
  byId.set(record.id, record);
  replaceAll('item-group', ALL_ITEM_GROUPS);
  return true;
};

/**
 * Folds an edited record back in once its write has already landed on disk, so
 * a relabel resolves in the session without a reload — the same bargain
 * `registerTag` makes on the tag side. Only ever replaces an id already known;
 * minting a brand-new group is `registerItemGroupRecord`'s job above.
 */
const replaceItemGroupRecord = (record: ItemGroupRecord): boolean => {
  const index = ALL_ITEM_GROUPS.findIndex(group => group.id === record.id);
  if (index === -1) return false;
  ALL_ITEM_GROUPS[index] = record;
  byId.set(record.id, record);
  replaceAll('item-group', ALL_ITEM_GROUPS);
  return true;
};

/** Drops a group from every map, once the delete-guard's own write has already removed it from disk. */
const unregisterItemGroupRecord = (id: string): boolean => {
  const index = ALL_ITEM_GROUPS.findIndex(group => group.id === id);
  if (index === -1) return false;
  ALL_ITEM_GROUPS.splice(index, 1);
  byId.delete(id);
  replaceAll('item-group', ALL_ITEM_GROUPS);
  return true;
};

export {
  itemGroupById, membersOf, registerItemGroupRecord, replaceItemGroupRecord, unregisterItemGroupRecord,
};
