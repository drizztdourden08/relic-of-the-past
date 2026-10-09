/* @layer shared-game @kind logic */
import type { ItemId } from '../../data';
import { ITEM_TO_TOKEN } from '../../data/native-tables';
import { logicReferencedItems } from '../logic-referenced-items';
import { keyKindOf } from '../key-items';

const itemAffectsTraversal = (itemId: ItemId): boolean =>
  ITEM_TO_TOKEN[itemId] !== undefined
  || keyKindOf(itemId) !== null
  || logicReferencedItems.has(itemId);

export { itemAffectsTraversal };
