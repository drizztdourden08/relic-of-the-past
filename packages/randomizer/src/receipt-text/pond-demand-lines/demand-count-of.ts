/* @layer shared-game @kind logic */
import type { ShopPrice } from '../../world/shops/shop-price.type';

const demandCountOf = (demand: ShopPrice): number => (demand.currency === 'item' ? 1 : demand.amount ?? 1);

export { demandCountOf };
