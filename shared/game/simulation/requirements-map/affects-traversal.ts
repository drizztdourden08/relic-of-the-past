/* @layer shared-game @kind logic */
import type { ItemId } from '../../data';
import type { FlagDiff } from '../types';
import { itemAffectsTraversal } from './item-affects-traversal';

const gatesTraversal = (diff: FlagDiff): boolean => diff.kind === 'progress' || diff.kind === 'overworld';

const affectsTraversal = (itemId: ItemId | undefined, diff: FlagDiff[]): boolean => {
  if (itemId && itemAffectsTraversal(itemId)) return true;
  return diff.some(gatesTraversal);
};

export { affectsTraversal };
