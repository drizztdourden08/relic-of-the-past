/* @layer shared-input @kind logic */
import type { ModernSlot } from '../../../types/controls/scheme';

const isLegacySlotList = (raw: readonly unknown[]): boolean =>
  raw.every((entry) => {
    const index = (entry as Partial<ModernSlot> | null)?.index;
    return !(typeof index === 'number' && Number.isInteger(index) && index > 0);
  });

export { isLegacySlotList };
