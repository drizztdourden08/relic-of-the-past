/* @layer shared-input @kind logic */
import { keyboardModernBindings } from '../default-modern-bindings';
import { defaultSlotList } from '../derive-slots';
import { renumberSlots } from '../slot-list';
import type { ModernSlot } from '@rotp/game-data';
import type { SlotSource } from './effective-slots.type';

const prefillFor = (source: SlotSource): ModernSlot[] => {
  if (source.keyboard) return keyboardModernBindings().slots;
  if (source.controls && source.controls.length > 0) return defaultSlotList(source.controls, source.core);
  return [];
};

const effectiveSlots = (source: SlotSource): ModernSlot[] => {
  const stored = source.stored;
  if (stored && stored.length > 0) return renumberSlots(stored).slots;
  return prefillFor(source);
};

export { effectiveSlots };
