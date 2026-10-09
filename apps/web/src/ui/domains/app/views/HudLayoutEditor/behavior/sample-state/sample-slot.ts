/* @layer renderer-components @kind logic */
import type { ModernSlot, SlotIndex } from '@shared/types/controls/scheme';

const sampleSlot = (index: SlotIndex, position: string, label: string): ModernSlot => ({
  index,
  binding: { type: 'none' },
  position: position as ModernSlot['position'],
  label,
  icon: null,
});

export { sampleSlot };
