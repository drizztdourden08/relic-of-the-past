/* @layer renderer-lib @kind constants */
import { emptyFunctionMask } from '@shared/input/scheme';
import type { ModernSlot, SlotIndex } from '@shared/types/controls';

const NO_FUNCTIONS = emptyFunctionMask();
const NO_SLOTS: ModernSlot[] = [];
const NO_SHADOW: ReadonlySet<SlotIndex> = new Set<SlotIndex>();
const KEEP_EQUIPPED_ITEM = 0;
const NEUTRAL_MASK = 0;

export { NO_FUNCTIONS, NO_SLOTS, NO_SHADOW, KEEP_EQUIPPED_ITEM, NEUTRAL_MASK };
