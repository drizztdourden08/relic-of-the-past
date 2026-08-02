/* @layer shared-game @kind types */
import type { ItemGroupId, ItemId } from './ids';

/**
 * A named set of items a count-based Requirement leaf (`{ count: { groupId, n } }`)
 * counts against — "own N of the Crystals", "own N of the Pendants". Promoted
 * out of the old bare `Record<ItemGroupId, ItemId[]>` taxonomy table so the
 * relationship is a real, id-keyed dataset rather than an untyped string key.
 */
interface ItemGroupRecord {
  id: ItemGroupId;
  label: string;
  memberIds: readonly ItemId[];
}

export type { ItemGroupRecord };
