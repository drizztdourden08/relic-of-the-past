/* @layer shared-game @kind logic */
import type { ShopPrice } from '../shop-price.type';

const priceLabelOf = (price: ShopPrice): string => {
  if (price.currency === 'bottle') return `a bottled ${price.content.replace(/-/g, ' ')}`;
  if (price.currency === 'item') return `the ${price.itemName}, shown`;
  const { amount, currency } = price;
  if (currency === 'hearts') return `${amount} heart${amount === 1 ? '' : 's'}`;
  return `${amount} ${currency}`;
};

export { priceLabelOf };
