/* @layer renderer-components @kind logic */
import type { ShopScope, ShopShuffleMode } from '@rotp/randomizer';
import { reclamped } from './reclamped';

const withMode = (scope: ShopScope, mode: ShopShuffleMode): ShopScope =>
  reclamped({ ...scope, mode });

export { withMode };
