/* @layer shared-input @kind types */
import type { InputBinding } from '../../../types/controls/bindings';
import type { ModernSlot, SlotIndex } from '../../../types/controls/scheme';

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
