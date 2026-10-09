/* @layer shared-game @kind constants */
import type { ShopShuffleMode } from '../shop-scope.type';

const SHOP_SHUFFLE_MODES: readonly ShopShuffleMode[] = ['vanilla', 'sequential', 'random', 'custom'];

const COUNTED_MODES: ReadonlySet<ShopShuffleMode> = new Set<ShopShuffleMode>(['sequential', 'random']);

export { COUNTED_MODES, SHOP_SHUFFLE_MODES };
