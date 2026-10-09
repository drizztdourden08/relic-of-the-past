/* @layer shared-game @kind logic */
import { itemKeyOfName } from '../../display-names/item-key-name';
import { has, helper } from '../rule-node-build';
import { shopBottleNode } from './shop-bottle-node';
import type { RuleNode } from '../rule-node.type';
import type { ShopPrice } from '../../shops/shop-price.type';

const priceNode = (price: ShopPrice): RuleNode => {
  if (price.currency === 'bottle') return shopBottleNode(price.content, price.amount ?? 1);
  if (price.currency === 'item') return has(itemKeyOfName(price.itemName));
  const { amount } = price;
  if (price.currency === 'rupees') return helper('walletAtLeast', amount);
  if (price.currency === 'arrows') return helper('projectilesAtLeast', amount);
  if (price.currency === 'bombs') return helper('explosivesAtLeast', amount);
  return helper('heartCapacityAbove', amount);
};

export { priceNode };
