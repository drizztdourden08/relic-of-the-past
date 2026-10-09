/* @layer shared-game @kind logic */
import type { ItemGroupId, ItemId } from '../types/ids';
import { itemGroupByIdMap } from './item-group-by-id-map';

const membersOf = (id: ItemGroupId): readonly ItemId[] => itemGroupByIdMap.get(id)?.memberIds ?? [];

export { membersOf };
