/* @layer shared-input @kind types */
import type { TouchPoint, TouchSnap } from '@rotp/features';
import type { ScreenBox } from '../touch-logic.type';

interface MoveGroupOptions {
  groupId: string;
  delta: TouchPoint;
  snap: TouchSnap;
  box: ScreenBox;
}

export type { MoveGroupOptions };
