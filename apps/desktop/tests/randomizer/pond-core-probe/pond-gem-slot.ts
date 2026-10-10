/* @layer tests @kind helper */
import { POND_GEM_SLOTS, WRAM } from './pond-core.constants';

const pondGemSlot = (index: number): number => WRAM.pondGemReceipt + POND_GEM_SLOTS - 1 - index;

export { pondGemSlot };
