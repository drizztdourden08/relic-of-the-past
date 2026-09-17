/* @layer shared-game @kind logic */
/**
 * A slot never sells the thing its own price is counted in.
 *
 * A price is gated on the ceiling the file can hold (rules/shop-prices.ts),
 * so a slot charging five bombs asks for a bomb bag before it hands anything
 * over. Put that family's own upgrade on that slot and the shelf sells the
 * capacity its price is measured in. The fill takes it, because the assumed
 * state owns every copy still unplaced, and only the post-fill sweep can tell
 * whether another copy was actually reachable first: when none was, the seed
 * is thrown away and rerolled, and when the sweep's answer is yes by a thread
 * the player still reads a spoiler telling them to buy a bomb bag with bombs.
 * Two playtest seeds died on exactly this shape (issue #219), so it is refused
 * at placement instead of being left to a sweep to catch after the fact.
 *
 * A bottle price reads the same way: the vessel a shelf demands may not be the
 * vessel it is selling. Hearts have no upgrade item in the pool, so a heart
 * price locks nothing out.
 *
 * An item price is the plainest case: the player needs the Hookshot to get
 * the Hookshot, so the slot may not hold the item it names.
 */
import { capacityFamilyOfItemName } from '@shared/game/data/capacity-upgrade-item';
import { BOTTLE_ITEMS } from '../item-names.data';
import type { CapacityFamilyId } from '../capacity/capacity-profile.type';
import type { ItemRule } from '../world.type';
import type { ShopCountedCurrency, ShopPrice } from './shop-price.type';

const BOTTLE_SET: ReadonlySet<string> = new Set(BOTTLE_ITEMS);

/** The capacity family a counted price is measured in; hearts have none. */
const FAMILY_OF_CURRENCY: Readonly<Record<ShopCountedCurrency, CapacityFamilyId | undefined>> = {
  rupees: 'wallet',
  arrows: 'projectiles',
  bombs: 'explosives',
  hearts: undefined,
};

/**
 * The placement predicate a priced slot carries, or undefined when the price
 * locks nothing out and the slot keeps whatever rule it already had.
 */
const selfLockRuleOf = (price: ShopPrice): ItemRule | undefined => {
  if (price.currency === 'item') return (itemName) => itemName !== price.itemName;
  if (price.currency === 'bottle') return (itemName) => !BOTTLE_SET.has(itemName);
  const family = FAMILY_OF_CURRENCY[price.currency];
  if (family === undefined) return undefined;
  return (itemName) => capacityFamilyOfItemName(itemName) !== family;
};

export { selfLockRuleOf };
