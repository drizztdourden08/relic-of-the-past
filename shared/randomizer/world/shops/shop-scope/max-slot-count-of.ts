/* @layer shared-game @kind logic */
import { normalizeEnabled } from './normalize-enabled';
import type { ShopScope } from '../shop-scope.type';

const maxSlotCountOf = (scope: ShopScope): number => normalizeEnabled(scope.enabled).length;

export { maxSlotCountOf };
