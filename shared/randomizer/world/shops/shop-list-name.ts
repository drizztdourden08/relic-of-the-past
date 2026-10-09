/* @layer shared-game @kind logic */
import { SHOP_LIST_NAMES, WORLD_WORDS_PATTERN } from './shop-list-name.constants';

const shortShopNameOf = (shopId: string, shopName: string): string =>
  SHOP_LIST_NAMES[shopId] ?? shopName.replace(WORLD_WORDS_PATTERN, '').trim();

export { shortShopNameOf };
