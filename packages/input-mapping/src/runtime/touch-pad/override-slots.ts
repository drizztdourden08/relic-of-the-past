/* @layer shared-input @kind logic */
import type { InputBinding, ModernSlot } from '@rotp/game-data';
import { TOUCH_SLOT_LABEL } from './touch-pad.constants';

const overrideSlots = (slots: ModernSlot[], overrides: Readonly<Record<number, InputBinding>>): ModernSlot[] => {
  const indexes = Object.keys(overrides).map(Number);
  if (indexes.length === 0) return slots;
  const replaced = slots.map((slot) => {
    const binding = overrides[slot.index];
    return binding ? { ...slot, binding } : slot;
  });
  const known = new Set(slots.map((slot) => slot.index));
  const added = indexes
    .filter((index) => !known.has(index))
    .map((index) => ({ index, binding: overrides[index] as InputBinding, label: TOUCH_SLOT_LABEL }));
  return [...replaced, ...added];
};

export { overrideSlots };
