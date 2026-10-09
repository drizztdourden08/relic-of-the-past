/* @layer shared-input @kind types */
import type { InputBinding, ModernSlot, SlotIndex } from '@rotp/game-data';

interface SlotListEdit {
  slots: ModernSlot[];
  renumber: ReadonlyMap<SlotIndex, SlotIndex>;
}

interface SlotSeed {
  binding?: InputBinding;
  position?: ModernSlot['position'];
  label?: string;
  icon?: ModernSlot['icon'];
}

export type { SlotListEdit, SlotSeed };
