/* @layer renderer-hooks @kind types */
import type { ShopPrice } from '@rotp/randomizer';

interface PondCharge {
  demand?: ShopPrice;
  rupees: number;
  other: boolean;
}

export type { PondCharge };
