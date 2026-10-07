/* @layer shared-game @kind logic */
/**
 * What to CALL an item the engine holds, read back off the record.
 *
 * The engine keys items by id, so this is the only place a name is produced, and only for
 * something that gets shown: a receipt line, a spoiler line, a tracker row. An item with no
 * record carries its own name behind the unrecorded prefix (item-ids.data.ts says which and
 * why), so the same call answers for both and no caller has to know the difference. Another
 * player's item (an online placement) has no record either, and answers with its own name.
 */
import { all, getItem } from '@shared/game/data';
import { FOREIGN_ITEM_NAME, isForeignItem } from '@shared/randomizer/archipelago/foreign-item';
import { isUnrecordedItem, nameOfUnrecorded, unrecordedItem } from '../item-ids.data';
import type { ItemId } from '@shared/game/data/types/ids';
import type { ItemKey } from '../item-ids.data';

/** The name to show for one item. */
const itemKeyName = (item: ItemKey): string => {
  if (isForeignItem(item)) return FOREIGN_ITEM_NAME;
  return isUnrecordedItem(item) ? nameOfUnrecorded(item) : getItem(item).name;
};

/**
 * The other direction. Two callers need it, and both stand at a boundary where a NAME is what
 * arrives: an online server sends the item it granted as a name, because a name is the wire
 * protocol, and the counter catalog mints its rungs as names by formula. A name no record
 * answers for comes back as the unrecorded key for that name, never undefined, so a caller
 * never has to carry a second shape for it.
 */
let byName: Map<string, ItemId> | null = null;

const itemKeyOfName = (name: string): ItemKey => {
  byName ??= new Map(all('item').map((item) => [item.name, item.id]));
  return byName.get(name) ?? unrecordedItem(name);
};

export { itemKeyName, itemKeyOfName };
