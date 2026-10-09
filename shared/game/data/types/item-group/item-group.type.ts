/* @layer shared-game @kind types */
import type { ItemGroupId, ItemId } from '../ids';
import type { ReviewMark } from '../review';

interface ItemGroupRecord {
  id: ItemGroupId;
  label: string;
  memberIds: readonly ItemId[];
  review?: ReviewMark;
}

export type { ItemGroupRecord };
