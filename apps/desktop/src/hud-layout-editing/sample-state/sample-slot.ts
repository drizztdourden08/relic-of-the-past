/* @layer renderer-components @kind logic */
import type { ModernSlot, SlotIndex } from '@rotp/game-data';

const sampleSlot = (index: SlotIndex, position: string, label: string): ModernSlot => ({
  index,
  binding: { type: 'none' },
  position: position as ModernSlot['position'],
  label,
  icon: null,
});

export { sampleSlot };
