/* @layer shared-game @kind logic */
import type { TraversalRequirement } from '@rotp/game-data';
import type { ItemId } from '@rotp/game-data';
import { BARE_HANDS_LIFT } from './requirements-map.constants';
import { tokensForItem } from './tokens-for-item';

const inventoryToReachTokens = (inventory: ReadonlySet<ItemId>): Set<TraversalRequirement> => {
  const tokens = new Set<TraversalRequirement>();
  tokens.add(BARE_HANDS_LIFT);
  for (const itemId of inventory) {
    for (const token of tokensForItem(itemId)) tokens.add(token);
  }
  return tokens;
};

export { inventoryToReachTokens };
