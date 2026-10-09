/* @layer shared-types @kind types */
import type { SdlAxisName, SdlButtonName } from '../../sdl-buttons';
import type { ButtonIcon, InputBinding } from '../bindings';

type SlotIndex = number;

type SlotAssignment =
  | { kind: 'none' }
  | { kind: 'sword' }
  | { kind: 'action' }
  | { kind: 'item'; hudItem: number };

interface CoreBindings {
  up: InputBinding; down: InputBinding; left: InputBinding; right: InputBinding;
  pause: InputBinding; map: InputBinding;
  confirm: InputBinding; cancel: InputBinding; prevScreen: InputBinding; nextScreen: InputBinding;
}

interface ModernSlot {
  index: SlotIndex;
  binding: InputBinding;
  position?: SdlButtonName | SdlAxisName;
  label: string;
  icon?: ButtonIcon | null;
}

interface ModernBindings {
  core: CoreBindings;
  slots: ModernSlot[];
  layoutId?: string;
}

interface ModernScheme {
  assignments: Record<SlotIndex, SlotAssignment>;
}

export type { CoreBindings, ModernBindings, ModernScheme, ModernSlot, SlotAssignment, SlotIndex };
