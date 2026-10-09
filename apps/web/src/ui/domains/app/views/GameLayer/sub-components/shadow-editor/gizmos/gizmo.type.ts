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

type IsHighlighted = (part: GizmoPart) => boolean;

export type { GizmoPart, GizmoHit, GizmoContext, GizmoPoint, IsHighlighted };
