/* @layer shared-game @kind logic */
import { COUNTED_MODES } from './shop-scope.constants';
import type { ShopShuffleMode } from '../shop-scope.type';

const usesSlotCount = (mode: ShopShuffleMode): boolean => COUNTED_MODES.has(mode);

export { usesSlotCount };
