/* @layer shared-input @kind logic */
import type { SlotIndex } from '@rotp/game-data';

const slotName = (index: SlotIndex): string => `Slot ${index}`;

export { slotName };
