/* @layer shared-input @kind types */
import type { TouchPoint, TouchSnap } from '@rotp/features';
import type { ScreenBox } from '../touch-logic.type';

interface MoveButtonOptions {
  id: string;
  delta: TouchPoint;
  snap: TouchSnap;
  box: ScreenBox;
}

export type { MoveButtonOptions };
