/* @layer shared-game @kind logic */
import { capacityFamilyOfItemName } from '@shared/game/data/capacity-upgrade-item';
import { itemKeyName } from '../display-names/item-key-name';
import { BOTTLE_SET, FAMILY_OF_CURRENCY } from './shop-self-lock.constants';
import type { ItemRule } from '../world.type';
import type { ShopPrice } from './shop-price.type';

const selfLockRuleOf = (price: ShopPrice): ItemRule | undefined => {
  if (price.currency === 'item') return (item) => itemKeyName(item) !== price.itemName;
  if (price.currency === 'bottle') return (item) => !BOTTLE_SET.has(item);
  const family = FAMILY_OF_CURRENCY[price.currency];
  if (family === undefined) return undefined;
  return (item) => capacityFamilyOfItemName(itemKeyName(item)) !== family;
};

export { selfLockRuleOf };
