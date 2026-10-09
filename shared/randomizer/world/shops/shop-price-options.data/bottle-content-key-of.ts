/* @layer shared-game @kind logic */
import type { ShopBottleContent } from '../shop-price.type';

const bottleContentKeyOf = (content: ShopBottleContent): string =>
  `shop_price_bottle_${content.replace(/-/g, '_')}`;

export { bottleContentKeyOf };
