/* @layer bridge-wasm @kind logic */
import { SRAM_SLOT_COUNT } from './sram-slots.constants';
import { slotBlockOffset } from './slot-block-offset';

const validSramSlots = (bytes: Uint8Array): number[] => {
  const slots: number[] = [];
  for (let i = 0; i < SRAM_SLOT_COUNT; i++) {
    if (slotBlockOffset(bytes, i) !== null) slots.push(i);
  }
  return slots;
};

export { validSramSlots };
