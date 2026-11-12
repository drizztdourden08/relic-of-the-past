/* @layer renderer-app @kind types */
import type { OrientationLayout, TouchPoint, TouchSnap } from '@rotp/features';
import type { ScreenBox } from '@rotp/input-mapping';

type DragApply = (start: OrientationLayout, delta: TouchPoint, snap: TouchSnap, box: ScreenBox) => OrientationLayout;

interface DragSession {
  pointerId: number;
  x: number;
  y: number;
  start: OrientationLayout;
  apply: DragApply;
  onTap: () => void;
  moved: boolean;
}

interface EditorDragInput {
  layout: OrientationLayout;
  box: ScreenBox;
  snap: TouchSnap;
  onLayout: (layout: OrientationLayout) => void;
}

export type { DragApply, DragSession, EditorDragInput };
