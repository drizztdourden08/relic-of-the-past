/* @layer shared-game @kind logic */
/**
 * What a price forbids its own slot to hold.
 *
 * A slot priced in a thing it sells can pay for itself: the player needs the
 * Hookshot to buy the Hookshot, so the slot is reachable exactly when its
 * contents are already redundant. The fill has no way out of that on its own,
 * because the access rule and the placement are both true, so the price locks
 * its own subject out of the slot it prices.
 *
 * Only an item price names a pool item, so only an item price locks anything.
 * A counted price names a currency and a bottle price names a content, and
 * neither is a name the pool can place, so a slot priced that way stays open
 * to everything.
 */
import type { ItemRule } from '../world.type';
import type { ShopPrice } from './shop-price.type';

/** The lock this price puts on its own slot, or null when it locks nothing. */
const selfLockRuleOf = (price: ShopPrice): ItemRule | null => {
  if (price.currency !== 'item') return null;
  return (itemName) => itemName !== price.itemName;
};

export { selfLockRuleOf };
