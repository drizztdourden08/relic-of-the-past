/* @layer shared-game @kind logic */
import { BOTTLE_LABEL_OF } from './bottle-labels.constants';
import type { ShopBottleContent } from '../shops/shop-price.type';

const contentOfStock = (vanillaItem: string): ShopBottleContent | undefined => {
  const id = vanillaItem.toLowerCase().replace(/\s+/g, '-');
  return BOTTLE_LABEL_OF.has(id) ? id as ShopBottleContent : undefined;
};

export { contentOfStock };
