/* @layer shared-game @kind logic */
import type { TraversalRequirement } from '../../navigation/nav-data.types';
import type { ItemId } from '../../data';
import { ITEM_TO_TOKEN, IMPLIED_TOKENS } from '../../data/native-tables';

const tokensForItem = (itemId: ItemId): TraversalRequirement[] => {
  const token = ITEM_TO_TOKEN[itemId];
  if (!token) return [];
  return [token, ...(IMPLIED_TOKENS[token] ?? [])];
};

export { tokensForItem };
