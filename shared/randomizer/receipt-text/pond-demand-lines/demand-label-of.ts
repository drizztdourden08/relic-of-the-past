/* @layer shared-game @kind logic */
import { priceLabelOf } from '../../world/shops/shop-price-native';
import { BOTTLE_NAMES, BOTTLE_PLURALS, POTIONS } from './pond-demand-lines.constants';
import { demandCountOf } from './demand-count-of';
import { demandItemNameOf } from './demand-item-name-of';
import type { ShopBottlePrice, ShopPrice } from '../../world/shops/shop-price.type';

const bottleLabelOf = (demand: ShopBottlePrice): string => {
  const potion = POTIONS.has(demand.content);
  const count = demandCountOf(demand);
  if (count === 1) {
    const one = BOTTLE_NAMES[demand.content];
    return potion ? `a bottle of ${one}` : `a ${one} in a bottle`;
  }
  const many = BOTTLE_PLURALS[demand.content];
  return potion ? `${count} bottles of ${many}` : `${count} ${many} in bottles`;
};

const spokenSingular = (label: string, amount: number | undefined): string =>
  (amount === 1 ? label.replace(/s$/, '') : label);

const demandLabelOf = (demand: ShopPrice): string => {
  if (demand.currency === 'item') return `the ${demandItemNameOf(demand.itemName)}`;
  if (demand.currency === 'bottle') return bottleLabelOf(demand);
  return spokenSingular(priceLabelOf(demand), demand.amount);
};

export { demandLabelOf };
