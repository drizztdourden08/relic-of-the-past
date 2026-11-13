/* @layer shared-input @kind types */
import type { TouchPoint, TouchSnap } from '@rotp/features';
import type { ScreenBox } from '../touch-logic.type';

interface ShiftMotion {
  delta: TouchPoint;
  snap: TouchSnap;
  box: ScreenBox;
}

export type { ShiftMotion };
