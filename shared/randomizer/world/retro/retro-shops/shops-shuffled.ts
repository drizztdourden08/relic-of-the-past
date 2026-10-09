/* @layer shared-game @kind logic */
import type { ShopScope } from '../../shops/shop-scope.type';

const shopsShuffled = (scope: ShopScope): boolean => scope.mode !== 'vanilla';

export { shopsShuffled };
