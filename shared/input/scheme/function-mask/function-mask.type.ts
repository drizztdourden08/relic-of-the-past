/* @layer shared-input @kind types */
import type { SlotIndex } from '../../../types/controls/scheme';

interface MenuMask {
  confirm: boolean;
  cancel: boolean;
  prevScreen: boolean;
  nextScreen: boolean;
}

interface FunctionMask {
  dpad: number;
  pause: boolean;
  map: boolean;
  menu: MenuMask;
  slots: SlotIndex[];
}

export type { FunctionMask, MenuMask };
