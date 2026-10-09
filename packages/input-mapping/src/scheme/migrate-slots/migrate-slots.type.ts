/* @layer shared-input @kind types */
import type { ModernSlot, SlotAssignment, SlotIndex } from '@rotp/game-data';

type OldSlot = Partial<ModernSlot> & { id?: unknown };

interface MigratedScheme {
  slots: ModernSlot[];
  assignments: Record<SlotIndex, SlotAssignment>;
}

interface MigratedSlotList {
  slots: ModernSlot[];
  byOldId: Map<string, SlotIndex>;
}

export type { MigratedScheme, MigratedSlotList, OldSlot };
