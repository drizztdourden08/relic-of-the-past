/* @layer renderer-components @kind types */
type GizmoPart =
  | 'move-x'
  | 'move-y'
  | 'move-center'
  | 'resize-x'
  | 'resize-y'
  | 'resize-uniform'
  | 'rotate'
  | `vertex-${number}`
  | `radius-${number}`;

interface GizmoHit {
  part: GizmoPart;
  cursor: string;
}

interface GizmoPoint {
  x: number;
  y: number;
}

interface GizmoContext {
  cx: number;
  cy: number;
  hw: number;
  hh: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  vertices?: GizmoPoint[];
  isFreehand: boolean;
}

interface GizmoShape {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  points?: GizmoPoint[];
  sides?: number;
}

interface GizmoScale {
  scaleX: number;
  scaleY: number;
}

type IsHighlighted = (part: GizmoPart) => boolean;

export type { GizmoPart, GizmoHit, GizmoContext, GizmoPoint, GizmoScale, GizmoShape, IsHighlighted };
