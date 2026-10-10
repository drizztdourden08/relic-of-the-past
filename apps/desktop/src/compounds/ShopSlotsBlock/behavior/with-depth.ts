/* @layer renderer-components @kind logic */
import { clampDepth } from '@rotp/randomizer';
import type { ShopScope } from '@rotp/randomizer';

const withDepth = (scope: ShopScope, depth: number): ShopScope =>
  ({ ...scope, depth: clampDepth(depth) });

export { withDepth };
