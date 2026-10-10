/* @layer renderer-components @kind logic */
import type { ModernSlot } from '@rotp/game-data';

const slotInScheme = (slots: readonly ModernSlot[], index: number): boolean =>
  slots.some((slot) => slot.index === index);

export { slotInScheme };
