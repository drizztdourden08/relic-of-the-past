/* @layer shared-game @kind types */
import type { ShopBottleContent } from '../shops/shop-price.type';

interface PotionCauldron {
  canonicalIndex: number;
  content: ShopBottleContent;
  label: string;
  price: number;
}

export type { PotionCauldron };
