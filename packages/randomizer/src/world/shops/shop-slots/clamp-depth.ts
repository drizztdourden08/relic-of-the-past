/* @layer shared-game @kind logic */
import { MAX_SHOP_SLOT_DEPTH, MIN_SHOP_SLOT_DEPTH } from './shop-slots.constants';

const clampDepth = (depth: number): number =>
  Math.min(MAX_SHOP_SLOT_DEPTH, Math.max(MIN_SHOP_SLOT_DEPTH, Math.trunc(depth)));

export { clampDepth };
