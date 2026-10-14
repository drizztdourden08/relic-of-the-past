/* @layer shared-game @kind logic */
import { BASELINE } from '../../state-helpers';
import { itemKeyOfName } from '../../display-names/item-key-name';
import { priceField } from '../seeded-price';
import type { ShopPrice } from '../../shops/shop-price.type';
import type { SeedTable } from '../rules.type';

const countOf = (price: ShopPrice | undefined): number => (price?.currency === 'bottle' ? price.amount ?? 1 : 1);

const amountOf = (price: ShopPrice | undefined): number =>
  (price !== undefined && price.currency !== 'bottle' && price.currency !== 'item' ? price.amount : 0);

const writePrice = (table: SeedTable, prefix: string, price: ShopPrice | undefined): void => {
  const count = countOf(price);
  table.set(priceField.currency(prefix), price?.currency ?? 'none');
  table.set(priceField.amount(prefix), amountOf(price));
  table.set(priceField.item(prefix), price?.currency === 'item' ? itemKeyOfName(price.itemName) : '');
  table.set(priceField.count(prefix), count);
  table.set(priceField.overLimit(prefix), count > BASELINE.progressiveBottleLimit);
  table.set(priceField.content(prefix), price?.currency === 'bottle' ? price.content : '');
};

export { writePrice };
