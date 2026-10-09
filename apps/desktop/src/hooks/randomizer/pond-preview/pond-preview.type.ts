/* @layer renderer-hooks @kind types */
import type { ShopPrice } from '@shared/randomizer/world/shops/shop-price.type';

interface PondCharge {
  demand?: ShopPrice;
  rupees: number;
  other: boolean;
}

export type { PondCharge };
