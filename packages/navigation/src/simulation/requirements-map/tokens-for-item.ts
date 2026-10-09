/* @layer shared-game @kind logic */
import type { TraversalRequirement, ItemId } from '@rotp/game-data';
import { ITEM_TO_TOKEN, IMPLIED_TOKENS } from '@rotp/game-data';

const tokensForItem = (itemId: ItemId): TraversalRequirement[] => {
  const token = ITEM_TO_TOKEN[itemId];
  if (!token) return [];
  return [token, ...(IMPLIED_TOKENS[token] ?? [])];
};

export { tokensForItem };
